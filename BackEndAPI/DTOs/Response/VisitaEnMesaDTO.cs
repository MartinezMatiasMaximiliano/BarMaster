namespace BackEndAPI.DTOs.Response
{
    /// <summary>Visita incluida dentro de MesaDTO (sin IdMesa por redundancia).</summary>
    public class VisitaEnMesaDTO
    {
        public Guid Id { get; set; }
        public Guid IdCaja { get; set; }
        /// <summary>Datos del mozo asignado a la visita (en lugar de solo el id).</summary>
        public MozoEnVisitaDTO? Mozo { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    /// <summary>Datos del mozo incluidos en una visita (solo campos necesarios para mostrar).</summary>
    public class MozoEnVisitaDTO
    {
        public Guid Id { get; set; }
        public string? CodigoDeServicio { get; set; }
        public string Nombres { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
    }
}
