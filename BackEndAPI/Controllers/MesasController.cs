using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class MesasController : ControllerBase
    {
        private readonly IMesasServices _mesasServices;
        public MesasController(IMesasServices mesasServices)
        {
            _mesasServices = mesasServices;
        }

        [HttpGet("/Mesa")]
        public async Task<ActionResult> GetTodasLasMesas()
        {
            var mesasConVisita = await _mesasServices.ObtenerTodasLasMesasConVisita();

            var response = mesasConVisita.Select(t => new MesaDTO
            {
                Id = t.mesa.Id,
                Numero = t.mesa.Numero,
                Capacidad = t.mesa.Capacidad,
                CodigoParaPedir = t.mesa.CodigoParaPedir,
                x = t.mesa.x,
                y = t.mesa.y,
                w = t.mesa.w,
                h = t.mesa.h,
                Plano = t.mesa.Plano != null ? new PlanoDTO
                {
                    Id = t.mesa.Plano.Id,
                    Nombre = t.mesa.Plano.Nombre,
                    Detalles = t.mesa.Plano.Detalles,
                    IdSucursal = t.mesa.Plano.IdSucursal
                } : null,
                Visita = t.visita != null ? new VisitaEnMesaDTO
                {
                    Id = t.visita.Id,
                    IdCaja = t.visita.IdCaja,
                    Mozo = t.visita.Mozo != null ? new MozoEnVisitaDTO
                    {
                        Id = t.visita.Mozo.Id,
                        CodigoDeServicio = t.visita.Mozo.CodigoDeServicio,
                        Nombres = t.visita.Mozo.Nombres,
                        Apellido = t.visita.Mozo.Apellido
                    } : null,
                    FechaHora = t.visita.FechaHora,
                    Estado = t.visita.Estado,
                    Origen = t.visita.Origen
                } : null
            }).ToList();

            return Ok(response);
        }

        [HttpPost("/Mesa")]
        public async Task<ActionResult> CrearMesa(CrearMesaDTO DTO)
        {
            var mesaCreada = await _mesasServices.CrearMesa(DTO);
            return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{mesaCreada!.Id}"));
        }

        [HttpPatch("/Mesa")]
        public async Task<ActionResult> ActualizarMesa(ModificarMesaDTO DTO)
        {
            var mesaActualizada = await _mesasServices.ModificarMesa(DTO);
            return Ok(new EntregaDTO(200, "MODIFIED", $"Modificado exitosamente, Id:{mesaActualizada!.Id}"));
        }

        [HttpPatch("/Mesa/AbrirCerrar")]
        [Authorize(Policy = "Mesas.Operar")]
        public async Task<ActionResult> AbrirCerrarMesa([FromBody] AbrirMesaDTO request)
        {
            var Visita = await _mesasServices.AbrirCerrarMesa(request);

            var response = new VisitaDTO
            {
                Id = Visita!.Id,
                IdCaja = Visita.IdCaja,
                IdMesa = Visita.IdMesa ?? Guid.Empty,
                IdMozo = Visita.IdMozo ?? Guid.Empty,
                FechaHora = Visita.FechaHora,
                Estado = Visita.Estado,
                Origen = Visita.Origen
            };

            return Ok(response);
        }

        [HttpDelete("/Mesa")]
        public async Task<IActionResult> EliminarMesa([FromQuery] Guid IdMesa)
        {
            await _mesasServices.EliminarMesa(IdMesa);
            return Ok(new EntregaDTO(200, "DELETED", "Mesa eliminada exitosamente"));
        }
    }
}
