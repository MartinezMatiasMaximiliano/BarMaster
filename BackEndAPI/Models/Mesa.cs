using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace BackEndAPI.Models
{
    public class Mesa
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? CodigoParaPedir { get; set; } = null;
        public Persona? Persona { get; set; } = null;
        public int Capacidad { get; set; }
        public Guid IdSucursal { get; set; }

        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
        public ICollection<Visita> Visitas { get; set; } = new List<Visita>();
    }
}
