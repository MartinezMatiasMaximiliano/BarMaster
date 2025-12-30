using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy;
using BackEndAPI.Tenancy.Models;
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
            return Ok($"Pong");
        }

        [HttpPost("/test")]
        public async Task<IActionResult> test([FromBody] CrearCajaDTO request)
        {
            var resultado = await _cajasServices.CrearCaja(request);
            return Ok();
        }

    }



}
