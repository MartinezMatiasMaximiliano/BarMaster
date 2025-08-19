namespace BackEndAPI.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Indicaciones { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public Estado Estado { get; set; } = Estado.Creado;
        public int PedidoId { get; set; } 
    }

    public enum Estado {
        Creado = 0,
        Procesando = 1,
        Pagado = 2,
    }
}
