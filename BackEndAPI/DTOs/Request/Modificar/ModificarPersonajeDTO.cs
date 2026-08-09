using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarPersonajeDTO
    {
        [Range(0, 9, ErrorMessage = "El personaje seleccionado no es válido.")]
        public int PersonajeId { get; set; }
    }
}
