using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IMesasServices
    {
        public Task<Mesa?> CrearMesa(CrearMesaDTO request);
        public Task<Mesa?> ModificarMesa(ModificarMesaDTO request);
        public Task<Visita?> AbrirCerrarMesa(AbrirMesaDTO request);
        public Task<IEnumerable<Mesa>> ObtenerTodasLasMesas();
        /// <summary>Obtiene todas las mesas con la visita asociada (activa) si existe.</summary>
        Task<IEnumerable<(Mesa mesa, Visita? visita)>> ObtenerTodasLasMesasConVisitaAsync();
        public Task<bool> EliminarMesa(Guid IdMesa);
    }
}
