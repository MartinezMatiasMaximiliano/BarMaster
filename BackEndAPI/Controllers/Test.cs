using BackEndAPI.Data;
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

        public Test(ICurrentDbContext currentDbContext) {
            _currentDbContext = currentDbContext;
        }   

        [HttpPost("/migrar")]
        public async Task<IActionResult> Ping([FromBody] string nombre)
        {
            await _currentDbContext.Db.Database.MigrateAsync();
            return Ok($"Pong");
        }

    }



}
