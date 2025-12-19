using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;

namespace BackEndAPI.Services
{
    public class MesasServices : IMesasServices
    {
        private readonly IMesasRepository _mesasRepository;
        private readonly IPersonasRepository _personasRepository;
        public MesasServices(IMesasRepository mesasRepository, IPersonasRepository personasRepository)
        {
            _mesasRepository = mesasRepository;
            _personasRepository = personasRepository;
        }

        public async Task<Mesa?> CrearMesa(CrearMesaDTO request)
        {
            var MesaExiste = await _mesasRepository.ExisteMesaEnPlano(request.IdPlano, request.Nombre);
            if (MesaExiste != null)
            {
                throw new Exception($"Ya existe la mesa en el plano seleccionado");
            }

            var nuevaMesa = new Mesa
            {
                IdPlano = request.IdPlano,
                Nombre = request.Nombre,
                CodigoParaPedir = null,
                Capacidad = request.Capacidad,
                x = request.x,
                y = request.y,
                w = request.w,
                h = request.h
            };
            await _mesasRepository.CrearMesa(nuevaMesa);
            return nuevaMesa;
        }

        public async Task<Mesa?> ModificarMesa(ModificarMesaDTO request)
        {
            var buscarMesa = await _mesasRepository.ObtenerMesaPorId(request.Id);
            if (buscarMesa == null)
            {
                throw new Exception("La mesa que intenta modificar no existe");
            }

            if (!string.IsNullOrEmpty(request.Nombre))
                buscarMesa.Nombre = request.Nombre;

            if (request.Capacidad.HasValue)
                buscarMesa.Capacidad = request.Capacidad.Value;

            if (request.x.HasValue)
                buscarMesa.x = request.x.Value;

            if (request.y.HasValue)
                buscarMesa.y = request.y.Value;

            if (request.w.HasValue)
                buscarMesa.w = request.w.Value;

            if (request.h.HasValue)
                buscarMesa.h = request.h.Value;

            return await _mesasRepository.ModificarMesa(buscarMesa);
        }

        public async Task<Mesa?> AbrirCerrarMesa(AbrirMesaDTO request)
        {
            var buscarMesa = await _mesasRepository.ObtenerMesaPorId(request.IdMesa);
            if (buscarMesa == null)
            {
                throw new Exception("La mesa que intenta modificar no existe");
            }

            if (request.Abrir) // Lógica para abrir la mesa
            {
                buscarMesa.CodigoParaPedir = Helpers.CrearCodigoMesa();
                var mozoBuscado = await _personasRepository.GetPersonaPorCodigoDeServicio(request.CodigoServicioMozo);

                if (mozoBuscado == null)
                {
                    throw new Exception("No se encontró un mozo con ese codigo de servicio");
                }

                //        mesaBuscada.Persona = mozoBuscado;
                //        var pedido = new Pedido
                //        {
                //            Mesa = mesaBuscada,
                //            FechaRealizado = DateTime.UtcNow,
                //            Activo = true,
                //        };

                //        _context.Pedidos.Add(pedido);
                //        await _context.SaveChangesAsync();

                //        var respuesta = new PedidoDTO
                //        {
                //            Id = pedido.Id,
                //            FechaRealizado = pedido.FechaRealizado,
                //            IdMesa = pedido.Mesa.Id,
                //            NumeroMesa = pedido.Mesa.NumeroMesa,
                //            Activo = pedido.Activo
                //        };
                return await _mesasRepository.ModificarMesa(buscarMesa);
            }
            else // Lógica para cerrar la mesa
            {
                buscarMesa.CodigoParaPedir = null;
                //        mesaBuscada.Persona = null;
                //        var pedidoDeLaMesa = await _context.Pedidos.Include(pedido => pedido.Items).FirstOrDefaultAsync(pedido => pedido.Mesa == mesaBuscada && pedido.Activo == true);

                //        if (pedidoDeLaMesa.Items.Count() == 0)
                //        {
                //            _context.Pedidos.Remove(pedidoDeLaMesa);                 
                //        }
                //        else
                //        {
                //            pedidoDeLaMesa.Activo = false;
                //            foreach(var item in pedidoDeLaMesa.Items)
                //            {
                //                item.Estado = Estado.Pagado;
                //            }
                //            _context.Entry(pedidoDeLaMesa).State = EntityState.Modified;
                //        }

                //        _context.Entry(mesaBuscada).State = EntityState.Modified;
                //        await _context.SaveChangesAsync();
            }
            return buscarMesa;
        }
    }
}
