using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace BackEndAPI.Models
{
    public class Mesa
    {
        //propiedades
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string? CodigoParaPedir { get; set; } = null;
        public int Capacidad { get; set; }
        public float x { get; set; }
        public float y { get; set; }
        public float w { get; set; }
        public float h { get; set; }

        //Foreign Keys  

        public Guid? IdMozo { get; set; } = null;  
        public Guid? IdPlano { get; set; }

        //navegacion
        public Persona? Mozo { get; set; } = null;
        public Plano? Plano { get; set; } = null!;
        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
        public ICollection<Visita> Visitas { get; set; } = new List<Visita>();
    }
}
