using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class MesasRepository : IMesasRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;

        public MesasRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }

        public async Task<Mesa?> ObtenerMesaPorId(Guid idMesa)
        {
            var mesa = await db.Mesas.FirstOrDefaultAsync(m => m.Id == idMesa);
            return mesa;
        }

        public async Task<Mesa?> ExisteMesaEnPlano(Guid idPlano, string nombreMesa)
        {
            var mesa = await db.Mesas.FirstOrDefaultAsync(m => m.IdPlano == idPlano && m.Nombre.ToLower() == nombreMesa.ToLower());
            return mesa;
        }

        public async Task<Mesa?> CrearMesa(Mesa nuevaMesa)
        {
            db.Mesas.Add(nuevaMesa);
            await db.SaveChangesAsync();
            return nuevaMesa;
        }

        public async Task<Mesa?> ModificarMesa(Mesa mesaActualizada)
        {
            db.Entry(mesaActualizada).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return mesaActualizada;
        }

        public async Task<IEnumerable<Mesa>> ObtenerTodasLasMesas()
        {
            return await db.Mesas
                .Include(m => m.Plano)
                .ToListAsync();
        }
    }
}
