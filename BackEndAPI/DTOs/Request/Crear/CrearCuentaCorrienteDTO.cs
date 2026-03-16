using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearCuentaCorrienteDTO
    {
        [Required]
        public string Nombre { get; set; }
        [Required]
        public string Telefono { get; set; }
        [Required]
        public string Domicilio { get; set; }


    }
}
