using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.ConstrainedExecution;

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

        public Test(ICurrentDbContext currentDbContext) {
            _currentDbContext = currentDbContext;
        }

        [HttpPost("/migrar")]
        public async Task<IActionResult> migrar()
        {
            _currentDbContext.Db.Database.Migrate();
            return Ok($"Merged");
        }

                
        [HttpPost("/test-ARCA")]
        public async Task<IActionResult> testARCA()
        {
            try
            {
                var traGen = new TraGenerator();
                var certLoad = CertificateLoader.Load(System.IO.File.ReadAllBytes("C:/Users/Matias/Desktop/certificado.pfx"), "123456");
                var cmsSigner = new CmsSignerService();
                var serv = new WsaaAuthService(traGen, cmsSigner, new HttpClient());
                var response = await serv.AuthenticateAsync(certLoad);
                var feService = new WsfeService(new HttpClient());

                var last = await feService.GetLastVoucherAsync(new FEAuthRequest
                        {
                            Token = response.Token,
                            Sign = response.Sign,
                            Cuit = 20405306558
                        },
                        1,
                        11);

                return Ok();
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}
