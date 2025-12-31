using Microsoft.AspNetCore.Http;

namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearProductoDTO
    {
        public Guid IdMenu { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public decimal CostoProduccion { get; set; }
        public bool Activo { get; set; } = true;
        public List<OpcionesDTO> Opciones { get; set; } = new List<OpcionesDTO>();
        public IFormFile? Imagen { get; set; }

    }

    public class OpcionesDTO
    {
        public string Nombre { get; set; }
    }
}
