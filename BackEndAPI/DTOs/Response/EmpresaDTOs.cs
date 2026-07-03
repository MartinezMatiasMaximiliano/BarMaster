namespace BackEndAPI.DTOs.Response
{
    public class EmpresaDTO
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; } = false;
        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;
    }

    public class EmpresaConSucursalesDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaInscripcion { get; set; }
        public List<SucursalSimpleDTO> Sucursales { get; set; } = [];
    }

    public class SucursalSimpleDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string Username { get; set; } = null!;
    }

    public class EmpresaSucursalesResumenDTO
    {
        public Guid EmpresaId { get; set; }
        public string EmpresaNombre { get; set; } = null!;
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
        public List<SucursalResumenDTO> Sucursales { get; set; } = [];
    }

    public class SucursalResumenDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public SucursalCajaResumenDTO Caja { get; set; } = new();
        public SucursalKpisDTO KpisPeriodo { get; set; } = new();
        public SucursalSeriesDTO Series { get; set; } = new();
        public List<SucursalTopProductoDTO> TopProductos { get; set; } = [];
    }

    public class SucursalCajaResumenDTO
    {
        public bool Abierta { get; set; }
        public Guid? IdCaja { get; set; }
        public DateTime? FechaApertura { get; set; }
        public decimal MontoApertura { get; set; }
        public decimal MontoActual { get; set; }
        public decimal MontoEfectivo { get; set; }
        public decimal MontoNoEfectivo { get; set; }
    }

    public class SucursalKpisDTO
    {
        public decimal Ventas { get; set; }
        public int CantidadVisitas { get; set; }
        public decimal TicketPromedio { get; set; }
        public decimal MargenEstimado { get; set; }
        public decimal MargenPorcentaje { get; set; }
        public bool RentabilidadIncompleta { get; set; }
    }

    public class SucursalSeriesDTO
    {
        public List<VentasPorHoraDTO> VentasPorHoraPeriodo { get; set; } = [];
        public List<VentasPorDiaDTO> VentasPorDia { get; set; } = [];
    }

    public class VentasPorHoraDTO
    {
        public string Hora { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }

    public class VentasPorDiaDTO
    {
        public DateTime Fecha { get; set; }
        public decimal Ventas { get; set; }
        public decimal Margen { get; set; }
    }

    public class SucursalTopProductoDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal Ventas { get; set; }
        public decimal MargenEstimado { get; set; }
    }
}
