using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.DTOs.Request
{
    public class ValidarCodigoMozoDTO
    {
        [Required]
        [RegularExpression(@"^\d{4}$", ErrorMessage = "El código debe contener exactamente 4 dígitos.")]
        public string Codigo { get; set; } = string.Empty;
    }
}
