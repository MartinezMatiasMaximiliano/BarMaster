using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class MesaDTO
    {
        public int Id { get; set; }
        public int NumeroMesa { get; set; }
        public string CodigoParaPedir { get; set; }
        public Persona Encargado { get; set; }
    }
}
