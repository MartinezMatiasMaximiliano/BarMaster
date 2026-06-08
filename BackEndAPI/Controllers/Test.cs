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
        private readonly WsfeService _wsfeService;
        private readonly WsaaAuthService _wasaaAuthService;

        public Test(ICurrentDbContext currentDbContext, WsfeService wsfeService, WsaaAuthService wsaaAuthService)
        {
            _currentDbContext = currentDbContext;
            _wsfeService = wsfeService;
            _wasaaAuthService = wsaaAuthService;
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
                //1. Cargar el certificado
                var certLoad = CertificateLoader.Load(System.IO.File.ReadAllBytes("C:/Users/Matias/Desktop/certificado.pfx"), "123456");

                //2. Autenticar y obtener el token
                //var response = await _wasaaAuthService.AuthenticateAsync(certLoad);
                //FEAuthRequest auth = new FEAuthRequest{Token = response.Token, Sign = response.Sign, Cuit = 20405306558};
                FEAuthRequest auth = new FEAuthRequest { Token = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8c3NvIHZlcnNpb249IjIuMCI+CiAgICA8aWQgc3JjPSJDTj13c2FhaG9tbywgTz1BRklQLCBDPUFSLCBTRVJJQUxOVU1CRVI9Q1VJVCAzMzY5MzQ1MDIzOSIgZHN0PSJDTj13c2ZlLCBPPUFGSVAsIEM9QVIiIHVuaXF1ZV9pZD0iODkxMzA5Mzg4IiBnZW5fdGltZT0iMTc4MDYxODM3MCIgZXhwX3RpbWU9IjE3ODA2NjE2MzAiLz4KICAgIDxvcGVyYXRpb24gdHlwZT0ibG9naW4iIHZhbHVlPSJncmFudGVkIj4KICAgICAgICA8bG9naW4gZW50aXR5PSIzMzY5MzQ1MDIzOSIgc2VydmljZT0id3NmZSIgdWlkPSJTRVJJQUxOVU1CRVI9Q1VJVCAyMDQwNTMwNjU1OCwgQ049dGVzdGJhcm1hc3RlciIgYXV0aG1ldGhvZD0iY21zIiByZWdtZXRob2Q9IjIyIj4KICAgICAgICAgICAgPHJlbGF0aW9ucz4KICAgICAgICAgICAgICAgIDxyZWxhdGlvbiBrZXk9IjIwNDA1MzA2NTU4IiByZWx0eXBlPSI0Ii8+CiAgICAgICAgICAgIDwvcmVsYXRpb25zPgogICAgICAgIDwvbG9naW4+CiAgICA8L29wZXJhdGlvbj4KPC9zc28+Cg==", Sign = "V/ZFIl4t+FGCwZkYhrM8qnV5Fn9pCVUh+VZtL0sAl+HyBzWCwlGqNUmTPO2P13aNyTKkhXO3pmPfvVcijUlg3eKtJWseTjd+7vcJ46yeDTRuEHwdnxnhHpueZMyIN6QQ2GVnst7Oww+cc9sdwooxecupzr+D7ahDAommdg6Wx5M=", Cuit = 20405306558 };
                //3. Obtener el último comprobante para el punto de venta y tipo de comprobante
                //TODO: buscar que es el punto de venta y una lista de tipos de comprobantes
                //var last = await _wsfeService.GetLastVoucherAsync(auth,1,11);

                //var condiciones = await _wsfeService.GetCondicionesIvaReceptorAsync(auth);


                //4. Crear un nuevo comprobante
                //TODO: buscar los valores posibles para cada campo
                //var comprobante = new FECAERequest
                //{
                //    Concepto = 1,
                //    DocTipo = 99,
                //    DocNro = 0,
                //    CondicionIVAReceptorId = 5,
                //    CbteDesde = last + 1,
                //    CbteHasta = last + 1,
                //    CbteFch = DateTime.Today,
                //    ImpTotal = 100,
                //    ImpTotConc = 0,
                //    ImpNeto = 100,
                //    ImpOpEx = 0,
                //    ImpIVA = 0,
                //    ImpTrib = 0
                //};


                //5. Solicitar el CAE para el nuevo comprobante
                //var caeResponse = await _wsfeService.RequestCAEAsync(auth,1,11, comprobante);

                //6. Verificar la respuesta
                var confirm = await _wsfeService.FECompConsultarAsync(auth, new FECompConsultarRequest
                {
                    PuntoVenta = 1,
                    TipoComprobante = 11,
                    NumeroComprobante = 1
                });
                //7. Imprimir el resultado

                //8. Manejar errores

                return Ok();
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}
