using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IMesasServices
    {
        public Task<Mesa?> CrearMesa(CrearMesaDTO request);
        public Task<Mesa?> ModificarMesa(ModificarMesaDTO request);
        public Task<Mesa?> AbrirCerrarMesa(AbrirMesaDTO request);
    }
}
