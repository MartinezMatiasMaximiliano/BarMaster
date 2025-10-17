using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BackEndAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class TestsController : ControllerBase
    {
        private readonly IEmpresasServices _empresasService;
        public TestsController(IEmpresasServices empresasService)
        {
            _empresasService = empresasService;
        }


        //[Authorize]
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _empresasService.GetAllEmpresasAsync());
        }
    }
}