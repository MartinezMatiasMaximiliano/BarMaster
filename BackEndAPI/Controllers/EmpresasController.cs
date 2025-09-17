using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmpresasController : ControllerBase
    {
        private readonly IEmpresasServices _empresasServices;
        public EmpresasController(IEmpresasServices empresasServices)
        {
            _empresasServices = empresasServices;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> AddEmpresaAsync([FromBody] CrearEmpresaDTO request)
        {
            CrearEmpresaResponseDTO result = await _empresasServices.AddEmpresaAsync(request);
            return Ok(result);
        }
    }
}
