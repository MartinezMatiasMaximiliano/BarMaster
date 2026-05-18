namespace BackEndAPI.DTOs.Response
{
    public class CadeteDTO 
    {
        public Guid Id { get; set; }
        public object Nombre { get; set; }
        public string Apellido { get; set; }
        public string Telefono { get; set; }
    }
}