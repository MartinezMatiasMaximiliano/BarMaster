using BackEndAPI.DTOs.Query;
using BackEndAPI.DTOs.Response;

namespace BackEndAPI.Services.Empresas
{
    internal static class SucursalesResumenBuilder
    {
        private static readonly TimeZoneInfo ZonaHorariaArgentina = ObtenerZonaHorariaArgentina();

        public static (DateTime DesdeUtc, DateTime HastaUtc) ObtenerRangoUtc(DateTime desde, DateTime hasta)
        {
            var rango = NormalizarRango(desde, hasta);
            return (rango.DesdeUtc, rango.HastaUtc);
        }

        public static EmpresaSucursalesResumenDTO Construir(EmpresaResumenQueryDTO empresa, DateTime desde, DateTime hasta)
        {
            var rango = NormalizarRango(desde, hasta);

            return new EmpresaSucursalesResumenDTO
            {
                EmpresaId = empresa.EmpresaId,
                EmpresaNombre = empresa.EmpresaNombre,
                Desde = rango.Desde,
                Hasta = rango.Hasta,
                Sucursales = empresa.Sucursales
                    .OrderBy(s => s.Nombre)
                    .Select(s => ConstruirSucursal(s, rango))
                    .ToList()
            };
        }

        private static RangoFechas NormalizarRango(DateTime desde, DateTime hasta)
        {
            var desdeUtc = NormalizarFechaUtc(desde);
            var hastaUtc = NormalizarFechaUtc(hasta);

            if (hastaUtc < desdeUtc)
            {
                (desdeUtc, hastaUtc) = (hastaUtc, desdeUtc);
            }

            var desdeLocal = ConvertirAFechaArgentina(desdeUtc);
            var hastaLocal = ConvertirAFechaArgentina(hastaUtc);

            return new RangoFechas(
                desdeLocal,
                hastaLocal,
                desdeLocal.Date,
                hastaLocal.Date,
                desdeUtc,
                hastaUtc
            );
        }

        private static SucursalResumenDTO ConstruirSucursal(SucursalResumenQueryDTO sucursal, RangoFechas rango)
        {
            var visitasPeriodo = sucursal.VisitasPeriodo
                .ToList();

            return new SucursalResumenDTO
            {
                Id = sucursal.Id,
                Nombre = sucursal.Nombre,
                Direccion = sucursal.Direccion,
                Telefono = sucursal.Telefono,
                Caja = ConstruirCaja(sucursal.CajaActiva),
                KpisPeriodo = ConstruirKpis(visitasPeriodo),
                Series = new SucursalSeriesDTO
                {
                    VentasPorHoraPeriodo = ConstruirVentasPorHora(visitasPeriodo),
                    VentasPorDia = ConstruirVentasPorDia(visitasPeriodo, rango)
                },
                TopProductos = ConstruirTopProductos(visitasPeriodo)
            };
        }

        private static SucursalKpisDTO ConstruirKpis(IReadOnlyCollection<VisitaResumenQueryDTO> visitasPeriodo)
        {
            var ventasPeriodo = visitasPeriodo.Sum(v => v.Total);
            var margenPeriodo = CalcularMargen(visitasPeriodo, out var rentabilidadIncompleta);

            return new SucursalKpisDTO
            {
                Ventas = ventasPeriodo,
                CantidadVisitas = visitasPeriodo.Count,
                TicketPromedio = visitasPeriodo.Count > 0 ? ventasPeriodo / visitasPeriodo.Count : 0,
                MargenEstimado = margenPeriodo,
                MargenPorcentaje = ventasPeriodo > 0 ? (margenPeriodo / ventasPeriodo) * 100 : 0,
                RentabilidadIncompleta = rentabilidadIncompleta
            };
        }

        private static SucursalCajaResumenDTO ConstruirCaja(CajaResumenQueryDTO? cajaActiva)
        {
            if (cajaActiva == null)
            {
                return new SucursalCajaResumenDTO { Abierta = false };
            }

            var movimientos = cajaActiva.Movimientos ?? [];
            var montoEfectivo = cajaActiva.MontoApertura + movimientos
                .Where(m => m.EsEfectivo == true)
                .Sum(CalcularMontoFirmado);
            var montoNoEfectivo = movimientos
                .Where(m => m.EsEfectivo == false)
                .Sum(CalcularMontoFirmado);

            return new SucursalCajaResumenDTO
            {
                Abierta = true,
                IdCaja = cajaActiva.Id,
                FechaApertura = cajaActiva.FechaApertura,
                MontoApertura = cajaActiva.MontoApertura,
                MontoActual = cajaActiva.MontoActual,
                MontoEfectivo = montoEfectivo,
                MontoNoEfectivo = montoNoEfectivo
            };
        }

        private static decimal CalcularMontoFirmado(MovimientoCajaResumenQueryDTO movimiento)
        {
            return movimiento.EsIngreso == false
                ? -movimiento.MontoTotal
                : movimiento.MontoTotal;
        }

        private static decimal CalcularMargen(IEnumerable<VisitaResumenQueryDTO> visitas, out bool rentabilidadIncompleta)
        {
            rentabilidadIncompleta = false;
            decimal margen = 0;

            foreach (var productoVendido in visitas.SelectMany(v => v.Productos ?? []))
            {
                var costo = productoVendido.CostoProduccion;
                if (costo == null)
                {
                    rentabilidadIncompleta = true;
                    margen += productoVendido.PrecioDelMomento;
                    continue;
                }

                margen += productoVendido.PrecioDelMomento - costo.Value;
            }

            return margen;
        }

        private static List<VentasPorHoraDTO> ConstruirVentasPorHora(IEnumerable<VisitaResumenQueryDTO> visitasPeriodo)
        {
            var ventasPorHora = visitasPeriodo
                .GroupBy(v => ConvertirAFechaArgentina(v.FechaHora).Hour)
                .ToDictionary(g => g.Key, g => g.Sum(v => v.Total));

            return Enumerable.Range(0, 24)
                .Select(hora => new VentasPorHoraDTO
                {
                    Hora = $"{hora:00}:00",
                    Total = ventasPorHora.TryGetValue(hora, out var total) ? total : 0
                })
                .ToList();
        }

        private static List<VentasPorDiaDTO> ConstruirVentasPorDia(IEnumerable<VisitaResumenQueryDTO> visitasPeriodo, RangoFechas rango)
        {
            var visitasPorDia = visitasPeriodo
                .GroupBy(v => ConvertirAFechaArgentina(v.FechaHora).Date)
                .ToDictionary(g => g.Key, g => g.ToList());

            var totalDias = (rango.HastaDia - rango.DesdeDia).Days + 1;

            return Enumerable.Range(0, totalDias)
                .Select(offset =>
                {
                    var fecha = rango.DesdeDia.AddDays(offset);
                    var visitasDia = visitasPorDia.TryGetValue(fecha, out var visitas) ? visitas : [];
                    var margen = CalcularMargen(visitasDia, out _);

                    return new VentasPorDiaDTO
                    {
                        Fecha = fecha,
                        Ventas = visitasDia.Sum(v => v.Total),
                        Margen = margen
                    };
                })
                .ToList();
        }

        private static List<SucursalTopProductoDTO> ConstruirTopProductos(IEnumerable<VisitaResumenQueryDTO> visitasPeriodo)
        {
            return visitasPeriodo
                .SelectMany(v => v.Productos ?? [])
                .GroupBy(p => string.IsNullOrWhiteSpace(p.NombreProducto) ? "Sin nombre" : p.NombreProducto)
                .Select(g => new SucursalTopProductoDTO
                {
                    Nombre = g.Key,
                    Cantidad = g.Count(),
                    Ventas = g.Sum(p => p.PrecioDelMomento),
                    MargenEstimado = g.Sum(p => p.PrecioDelMomento - (p.CostoProduccion ?? 0))
                })
                .OrderByDescending(p => p.Ventas)
                .Take(5)
                .ToList();
        }

        private static DateTime NormalizarFechaUtc(DateTime fecha)
        {
            return fecha.Kind switch
            {
                DateTimeKind.Utc => fecha,
                DateTimeKind.Local => fecha.ToUniversalTime(),
                _ => DateTime.SpecifyKind(fecha, DateTimeKind.Utc)
            };
        }

        private static DateTime ConvertirAFechaArgentina(DateTime fecha)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(NormalizarFechaUtc(fecha), ZonaHorariaArgentina);
        }

        private static TimeZoneInfo ObtenerZonaHorariaArgentina()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Argentina Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");
            }
        }

        private sealed record RangoFechas(
            DateTime Desde,
            DateTime Hasta,
            DateTime DesdeDia,
            DateTime HastaDia,
            DateTime DesdeUtc,
            DateTime HastaUtc
        );
    }
}
