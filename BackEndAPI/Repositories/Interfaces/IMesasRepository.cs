using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IMesasRepository
    {
        public Task<Mesa?> ObtenerMesaPorId(Guid idMesa);
        public Task<Mesa?> ExisteMesaEnPlano(Guid idPlano, string nombreMesa);
        public Task<Mesa?> CrearMesa(Mesa nuevaMesa);
        public Task<Mesa?> ModificarMesa(Mesa mesaActualizada);


    }
}
