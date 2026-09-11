using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IRolesServices _RolesServices;

        public RolesController(IRolesServices rolesServices)
        {
            _RolesServices = rolesServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetListaRoles()
        {
            var roles = await _RolesServices.BuscarListaRoles();
            var listaRoles = roles.Select(rol => new RolDTO
            {
                Id = rol.Id,
                Nombre = rol.Nombre
            }).ToList();

            return Ok(listaRoles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRolPorId(int id)
        {
            var rol = await _RolesServices.BuscarRolPorId(id);
            var rolDTO = new RolDTO
            {
                Id = rol.Id,
                Nombre = rol.Nombre
            };
            return Ok(rolDTO);
        }
    }
}
