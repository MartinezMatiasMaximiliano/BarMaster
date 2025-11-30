using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace BackEndAPI.Models
{
    public class Mesa
    {
        //propiedades
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? IdPlano { get; set; }
        public string Nombre { get; set; } = null!;
        public string? CodigoParaPedir { get; set; } = null;
        public int Capacidad { get; set; }
        public float x { get; set; }
        public float y { get; set; }
        public float w { get; set; }
        public float h { get; set; }



        //navegacion
        public Plano? Plano { get; set; } = null!;
    }
}
