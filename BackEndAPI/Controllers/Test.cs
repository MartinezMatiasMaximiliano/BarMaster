using BackEndAPI.Data;
using BackEndAPI.Tenancy;
using BackEndAPI.Tenancy.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Mvc;

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

        [HttpPost("/test")]
        public IActionResult Ping([FromBody] string nombre)
        {
            var result = _currentDbContext.Db.Empresas.ToList();
            return Ok($"Pong {nombre}");
        }

    }



}
