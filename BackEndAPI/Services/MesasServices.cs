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
        private readonly ICajasRepository _CajasRepository;
        private readonly IVisitasRepository _visitasRepository;
        public MesasServices(IMesasRepository mesasRepository, IPersonasRepository personasRepository, IVisitasRepository visitasRepository, ICajasRepository cajasRepository)
        {
            _mesasRepository = mesasRepository;
            _personasRepository = personasRepository;
            _visitasRepository = visitasRepository;
            _CajasRepository = cajasRepository;
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

        public async Task<Visita?> AbrirCerrarMesa(AbrirMesaDTO request)
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

                var CajaAbierta = await _CajasRepository.BuscarCajaAbierta();

                if (CajaAbierta == null)
                {
                    throw new Exception("No hay una caja abierta para asignar la visita");
                }


                var Visita = new Visita()
                {
                    IdCaja = CajaAbierta.Id,
                    IdMozo = mozoBuscado.Id,
                    IdMesa = buscarMesa.Id,
                    FechaHora = DateTime.UtcNow,
                    Total = 0,
                    Estado = "Abierta"

                };

                await _mesasRepository.ModificarMesa(buscarMesa);
                return await _visitasRepository.CrearVisita(Visita);

            }
            else // Lógica para cerrar la mesa: buscar la visita activa de esta mesa
            {
                buscarMesa.CodigoParaPedir = null;
                var visita = await _visitasRepository.BuscarVisitaActivaPorIdMesa(request.IdMesa);

                if (visita == null)
                {
                    throw new Exception("No hay una visita abierta para esta mesa");
                }

                await _mesasRepository.ModificarMesa(buscarMesa);

                if (visita.Productos.Count() <= 0) // borrar visitas vacías
                {
                    await _visitasRepository.EliminarVisita(visita);
                    return visita;
                }
                else // desactivar visitas no vacías
                {
                    visita.Estado = "Cerrada";
                    return await _visitasRepository.ModificarVisita(visita);
                }

                
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

            }
        }

        public async Task<IEnumerable<Mesa>> ObtenerTodasLasMesas()
        {
            return await _mesasRepository.ObtenerTodasLasMesas();
        }

        public async Task<IEnumerable<(Mesa mesa, Visita? visita)>> ObtenerTodasLasMesasConVisita()
        {
            var mesas = (await _mesasRepository.ObtenerTodasLasMesas()).ToList();
            var visitasActivas = (await _visitasRepository.ObtenerVisitasActivas()).ToList();
            var visitaPorMesa = visitasActivas.ToDictionary(v => v.IdMesa, v => v);
            return mesas.Select(m => (m, visitaPorMesa.TryGetValue(m.Id, out var vis) ? vis : null));
        }

        public async Task<bool> EliminarMesa(Guid IdMesa)
        {
            var mesaAEliminar = await _mesasRepository.ObtenerMesaPorId(IdMesa);
            
            if (mesaAEliminar == null)
            {
                throw new Exception("Mesa no encontrada");
            }

            // Verificar si la mesa está actualmente abierta (tiene código para pedir)
            if (!string.IsNullOrEmpty(mesaAEliminar.CodigoParaPedir))
            {
                throw new Exception("No se puede eliminar una mesa con visitas activas");
            }

            var mesaEliminada = await _mesasRepository.EliminarMesa(mesaAEliminar);

            return mesaEliminada;
        }
    }
}
