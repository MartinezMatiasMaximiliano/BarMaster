namespace BackEndAPI.DTOs.Query
{
    public class EmpresaResumenQueryDTO
    {
        public Guid EmpresaId { get; set; }
        public string EmpresaNombre { get; set; } = null!;
        public List<SucursalResumenQueryDTO> Sucursales { get; set; } = [];
    }

    public class SucursalResumenQueryDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public CajaResumenQueryDTO? CajaActiva { get; set; }
        public List<VisitaResumenQueryDTO> VisitasPeriodo { get; set; } = [];
    }

    public class CajaResumenQueryDTO
    {
        public Guid Id { get; set; }
        public Guid IdSucursal { get; set; }
        public DateTime FechaApertura { get; set; }
        public decimal MontoApertura { get; set; }
        public decimal MontoActual { get; set; }
        public List<MovimientoCajaResumenQueryDTO> Movimientos { get; set; } = [];
    }

    public class MovimientoCajaResumenQueryDTO
    {
        public decimal MontoAbonado { get; set; }
        public decimal Vuelto { get; set; }
        public decimal MontoTotal { get; set; }
        public bool? EsIngreso { get; set; }
        public bool? EsEfectivo { get; set; }
    }

    public class VisitaResumenQueryDTO
    {
        public Guid Id { get; set; }
        public Guid IdSucursal { get; set; }
        public DateTime FechaHora { get; set; }
        public decimal Total { get; set; }
        public List<ProductoVisitaResumenQueryDTO> Productos { get; set; } = [];
    }

    public class ProductoVisitaResumenQueryDTO
    {
        public string NombreProducto { get; set; } = string.Empty;
        public decimal PrecioDelMomento { get; set; }
        public decimal? CostoProduccion { get; set; }
    }
}
