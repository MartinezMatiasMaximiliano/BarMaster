namespace BackEndAPI.DTOs.Request.Modificar
{
    public class CambiarEstadoProductoDTO
    {
        public int IdProducto { get; set; }
        public string Estado { get; set; } = null!;
    }
}
