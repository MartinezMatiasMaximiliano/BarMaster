using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class TicketDTO
    {
        public int IdPedido { get; set; }
        public int numeroMesa { get; set; }
        public DateTime FechaInicio { get; set; }
        public int IdMesa { get; set; }
        public decimal total { get; set; }
        public List<Ticket> items { get; set; }

    }
    public class Ticket
    {
        public int Id { get; set; } 
        public string NombreProducto { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public string? Indicaciones { get; set; }
        public Estado Estado { get; set; }
    }
}
