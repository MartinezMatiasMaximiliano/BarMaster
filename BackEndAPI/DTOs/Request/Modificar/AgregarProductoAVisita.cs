namespace BackEndAPI.DTOs.Request.Modificar
{
    public class AgregarProductoAVisita
    {
        public Guid IdProducto { get; set; }
        public string Detalles { get; set; }
        public int Cantidad {  get; set; }
    }
}
