using BackEndAPI.Data;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class Test : ControllerBase
    {
        [HttpPost("/ping")]
        public IActionResult Ping()
        {
            var db = HttpContext.Items["DbContext"] as ApiDbContext
                 ?? throw new Exception("No DB context available");
            var products = db.TipoPagos.ToList();
            return Ok(products);
        }

        [HttpPost("/ping2")]
        public IActionResult Ping2([FromBody] string nombre)
        {
            var db = HttpContext.Items["TenantDbContext"] as ApiDbContext
                ?? throw new Exception("No DB context available");

            db.TipoPagos.Add(new Models.TipoPago { Nombre = nombre });
            db.SaveChangesAsync();

            return Ok();
        }
    }

    public class info
    {
        public string user { get; set; }
        public string password { get; set; }
        public string tenantId { get; set; }
    }

}
