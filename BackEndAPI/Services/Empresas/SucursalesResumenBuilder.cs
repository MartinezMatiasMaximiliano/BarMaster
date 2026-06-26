using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Empresas
{
    internal static class SucursalesResumenBuilder
    {
        private static readonly TimeZoneInfo ZonaHorariaArgentina = ObtenerZonaHorariaArgentina();

        public static EmpresaSucursalesResumenDTO Construir(Empresa empresa, DateTime desde, DateTime hasta)
        {
            var rango = NormalizarRango(desde, hasta);
            var hoy = ConvertirAFechaArgentina(DateTime.UtcNow).Date;
            var manana = hoy.AddDays(1);

            return new EmpresaSucursalesResumenDTO
            {
                EmpresaId = empresa.Id,
                EmpresaNombre = empresa.Nombre,
                Desde = rango.Desde,
                Hasta = rango.Hasta,
                Sucursales = empresa.Sucursales
                    .OrderBy(s => s.Nombre)
                    .Select(s => ConstruirSucursal(s, rango, hoy, manana))
                    .ToList()
            };
        }

        private static RangoFechas NormalizarRango(DateTime desde, DateTime hasta)
        {
            var desdeDia = desde.Date;
            var hastaDia = hasta.Date;

            if (hastaDia < desdeDia)
            {
                (desdeDia, hastaDia) = (hastaDia, desdeDia);
            }

            var hastaExclusivo = hastaDia.AddDays(1);

            return new RangoFechas(
                desdeDia,
                hastaDia,
                hastaExclusivo,
                ConvertirFechaArgentinaAUtc(desdeDia),
                ConvertirFechaArgentinaAUtc(hastaExclusivo)
            );
        }

        private static SucursalResumenDTO ConstruirSucursal(Sucursal sucursal, RangoFechas rango, DateTime hoy, DateTime manana)
        {
            var cajas = sucursal.Cajas ?? [];
            var cajaActiva = cajas
                .Where(c => c.FechaCierre == null)
                .OrderByDescending(c => c.FechaApertura)
                .FirstOrDefault();

            var visitasPeriodo = cajas
                .SelectMany(c => c.Visitas ?? [])
                .Where(v =>
                {
                    var fechaUtc = NormalizarFechaUtc(v.FechaHora);
                    return fechaUtc >= rango.DesdeUtc && fechaUtc < rango.HastaExclusivoUtc;
                })
                .ToList();

            var visitasHoy = visitasPeriodo
                .Where(v =>
                {
                    var fechaLocal = ConvertirAFechaArgentina(v.FechaHora);
                    return fechaLocal >= hoy && fechaLocal < manana;
                })
                .ToList();

            return new SucursalResumenDTO
            {
                Id = sucursal.Id,
                Nombre = sucursal.Nombre,
                Direccion = sucursal.Direccion,
                Telefono = sucursal.Telefono,
                Caja = ConstruirCaja(cajaActiva),
                KpisHoy = ConstruirKpis(visitasHoy),
                Series = new SucursalSeriesDTO
                {
                    VentasPorHoraHoy = ConstruirVentasPorHora(visitasHoy),
                    VentasPorDia = ConstruirVentasPorDia(visitasPeriodo, rango)
                },
                TopProductos = ConstruirTopProductos(visitasPeriodo)
            };
        }

        private static SucursalKpisDTO ConstruirKpis(IReadOnlyCollection<Visita> visitasHoy)
        {
            var ventasHoy = visitasHoy.Sum(v => v.Total);
            var margenHoy = CalcularMargen(visitasHoy, out var rentabilidadIncompleta);

            return new SucursalKpisDTO
            {
                Ventas = ventasHoy,
                CantidadVisitas = visitasHoy.Count,
                TicketPromedio = visitasHoy.Count > 0 ? ventasHoy / visitasHoy.Count : 0,
                MargenEstimado = margenHoy,
                MargenPorcentaje = ventasHoy > 0 ? (margenHoy / ventasHoy) * 100 : 0,
                RentabilidadIncompleta = rentabilidadIncompleta
            };
        }

        private static SucursalCajaResumenDTO ConstruirCaja(Caja? cajaActiva)
        {
            if (cajaActiva == null)
            {
                return new SucursalCajaResumenDTO { Abierta = false };
            }

            var movimientos = cajaActiva.MovimientosCaja ?? [];
            var montoEfectivo = cajaActiva.MontoApertura + movimientos
                .Where(m => m.TipoMovimientoCaja?.EsEfectivo == true)
                .Sum(CalcularMontoFirmado);
            var montoNoEfectivo = movimientos
                .Where(m => m.TipoMovimientoCaja?.EsEfectivo == false)
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

        private static decimal CalcularMontoFirmado(MovimientoCaja movimiento)
        {
            return movimiento.TipoMovimientoCaja?.EsIngreso == false
                ? -movimiento.Monto
                : movimiento.Monto;
        }

        private static decimal CalcularMargen(IEnumerable<Visita> visitas, out bool rentabilidadIncompleta)
        {
            rentabilidadIncompleta = false;
            decimal margen = 0;

            foreach (var productoVendido in visitas.SelectMany(v => v.Productos ?? []))
            {
                var costo = productoVendido.Producto?.CostoProduccion;
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

        private static List<VentasPorHoraDTO> ConstruirVentasPorHora(IEnumerable<Visita> visitasHoy)
        {
            var ventasPorHora = visitasHoy
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

        private static List<VentasPorDiaDTO> ConstruirVentasPorDia(IEnumerable<Visita> visitasPeriodo, RangoFechas rango)
        {
            var visitasPorDia = visitasPeriodo
                .GroupBy(v => ConvertirAFechaArgentina(v.FechaHora).Date)
                .ToDictionary(g => g.Key, g => g.ToList());

            return Enumerable.Range(0, (rango.HastaExclusivo - rango.Desde).Days)
                .Select(offset =>
                {
                    var fecha = rango.Desde.AddDays(offset);
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

        private static List<SucursalTopProductoDTO> ConstruirTopProductos(IEnumerable<Visita> visitasPeriodo)
        {
            return visitasPeriodo
                .SelectMany(v => v.Productos ?? [])
                .GroupBy(p => string.IsNullOrWhiteSpace(p.NombreProducto) ? "Sin nombre" : p.NombreProducto)
                .Select(g => new SucursalTopProductoDTO
                {
                    Nombre = g.Key,
                    Cantidad = g.Count(),
                    Ventas = g.Sum(p => p.PrecioDelMomento),
                    MargenEstimado = g.Sum(p => p.PrecioDelMomento - (p.Producto?.CostoProduccion ?? 0))
                })
                .OrderByDescending(p => p.Ventas)
                .Take(5)
                .ToList();
        }

        private static DateTime NormalizarFechaUtc(DateTime fecha)
        {
            return fecha.Kind == DateTimeKind.Utc
                ? fecha
                : DateTime.SpecifyKind(fecha, DateTimeKind.Utc);
        }

        private static DateTime ConvertirAFechaArgentina(DateTime fecha)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(NormalizarFechaUtc(fecha), ZonaHorariaArgentina);
        }

        private static DateTime ConvertirFechaArgentinaAUtc(DateTime fechaLocal)
        {
            return TimeZoneInfo.ConvertTimeToUtc(
                DateTime.SpecifyKind(fechaLocal, DateTimeKind.Unspecified),
                ZonaHorariaArgentina
            );
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
            DateTime HastaExclusivo,
            DateTime DesdeUtc,
            DateTime HastaExclusivoUtc
        );
    }
}
