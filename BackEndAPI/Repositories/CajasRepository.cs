using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class CajasRepository : ICajasRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext Db;

        public CajasRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
            Db = currentDbContext.Db;
        }   

        public async Task<Caja> CrearCaja(Caja caja)
        {
            Db.Cajas.Add(caja);
            await Db.SaveChangesAsync();    
            return caja;
        }

        public async Task<Caja?> BuscarCajaAbierta()
        {
            return await Db.Cajas.Where(c => c.FechaCierre == null).FirstOrDefaultAsync();
        }
        public async Task<Caja?> BuscarCajaAbiertaPorIdSucursal(Guid IdSucursal)
        {
            return await Db.Cajas.Where(c => c.FechaCierre == null && c.IdSucursal == IdSucursal).FirstOrDefaultAsync();
        }

        public async Task<Caja?> BuscarUltimaCajaCerradaPorIdSucursal(Guid IdSucursal)
        {
            return await Db.Cajas
                .Where(c => c.IdSucursal == IdSucursal && c.FechaCierre != null && c.MontoCierre != null)
                .OrderByDescending(c => c.FechaCierre)
                .FirstOrDefaultAsync();
        }

        public async Task<Caja?> GetCajaPorId(Guid id)
        {
            return await Db.Cajas.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Caja>> BuscarListaCajas()
        {
            return await Db.Cajas.ToListAsync();
        }

        public async Task<Caja> ActualizarCaja(Caja caja)
        {
            Db.Cajas.Update(caja);
            await Db.SaveChangesAsync();
            return caja;
        }
    }
}
