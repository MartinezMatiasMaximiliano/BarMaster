using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Controllers
{
    public class PingResponse
    {
        public string Message { get; set; }
    }

    [Route("[controller]")]
    [ApiController]
    public class Test : ControllerBase
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly ICajasServices _cajasServices;


        public Test(ICurrentDbContext currentDbContext,ICajasServices cajas) {
            _currentDbContext = currentDbContext;
            _cajasServices = cajas;
        }

        [HttpPost("/migrar")]
        public async Task<IActionResult> migrar()
        {
            _currentDbContext.Db.Database.Migrate();
            return Ok($"Merged");
        }

                
        [HttpPost("/test-ARCA")]
        public async Task<IActionResult> testARCA([FromBody] CrearCajaDTO request)
        {
            try
            {
                var traGen = new TraGenerator();
                var certLoader = new CertificateLoader();
                var certLoad = certLoader.Load(System.IO.File.ReadAllBytes("C:/Users/Matias/Desktop/certificado.pfx"), "123456");
                var cmsSigner = new CmsSignerService();
                var serv = new WsaaAuthService(traGen, cmsSigner, new HttpClient());
                var response = await serv.AuthenticateAsync(certLoad);
                return Ok();
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}
