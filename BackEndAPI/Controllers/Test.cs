using BackEndAPI.Data;
using BackEndAPI.Tenancy;
using BackEndAPI.Tenancy.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class Test : ControllerBase
    {

        public Test()
        {

        }

        [HttpPost("/test")]
        public IActionResult Ping([FromBody] string nombre)
        {
            return Ok($"Pong {nombre}");
        }

    }



}
