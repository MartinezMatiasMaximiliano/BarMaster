using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class TipoEnviosServices : ITipoEnviosServices
    {
        private readonly ITipoEnviosRepository _tipoEnviosRepository;

        public TipoEnviosServices(ITipoEnviosRepository tipoEnviosRepository)
        {
            _tipoEnviosRepository = tipoEnviosRepository;
        }

        public async Task<IEnumerable<TipoEnvio>> BuscarListaTiposEnvio()
        {
            return await _tipoEnviosRepository.GetAllTiposEnvio();
        }

        public async Task<TipoEnvio> BuscarTipoEnvioPorId(int id)
        {
            var tipoEnvio = await _tipoEnviosRepository.GetTipoEnvioPorId(id);
            if (tipoEnvio == null)
            {
                throw new Exception("El tipo de envio no existe");
            }

            return tipoEnvio;
        }

        public async Task<TipoEnvio> CrearTipoEnvio(CrearTipoEnvioDTO request)
        {
            

            var tipoEnvioExistente = await _tipoEnviosRepository.GetTipoEnvioPorNombre(request.Nombre!.Trim());
            if (tipoEnvioExistente != null) throw new Exception("El tipo de envio ya existe");

            var nuevoTipoEnvio = new TipoEnvio
            {
                Nombre = request.Nombre!.Trim(),
                Precio = request.Precio!.Value,
            };

            return await _tipoEnviosRepository.CrearTipoEnvio(nuevoTipoEnvio);
        }

        public async Task<TipoEnvio?> ModificarTipoEnvio(int id, ModificarTipoEnvioDTO request)
        {
            var tipoEnvio = await _tipoEnviosRepository.GetTipoEnvioPorId(id);
            if (tipoEnvio == null)
            {
                throw new Exception("El tipo de envio no existe");
            }

            if (request.Nombre == null && request.Precio == null )
            {
                throw new Exception("Debe enviar al menos un campo para modificar");
            }

            if (request.Nombre != null)
            {
                if (string.IsNullOrWhiteSpace(request.Nombre))
                {
                    throw new Exception("El nombre es obligatorio");
                }

                var tipoEnvioConMismoNombre = await _tipoEnviosRepository.GetTipoEnvioPorNombre(request.Nombre.Trim());
                if (tipoEnvioConMismoNombre != null && tipoEnvioConMismoNombre.Id != id)
                {
                    throw new Exception("Ya existe un tipo de envio con ese nombre");
                }

                tipoEnvio.Nombre = request.Nombre.Trim();
            }

            if (request.Precio.HasValue)
            {
                if (request.Precio.Value < 0)
                {
                    throw new Exception("El precio no puede ser negativo");
                }

                tipoEnvio.Precio = request.Precio.Value;
            }

          

            await _tipoEnviosRepository.ActualizarTipoEnvio(tipoEnvio);
            return tipoEnvio;
        }

        public async Task<TipoEnvio?> EliminarTipoEnvio(int id)
        {
            var tipoEnvio = await _tipoEnviosRepository.GetTipoEnvioPorId(id);
            if (tipoEnvio == null)
            {
                throw new Exception("El tipo de envio no existe");
            }

            await _tipoEnviosRepository.EliminarTipoEnvio(tipoEnvio);
            return tipoEnvio;
        }
    }
}
