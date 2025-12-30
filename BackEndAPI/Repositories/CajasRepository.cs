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

        public async Task<Caja> BuscarCajaAbierta()
        {
            return await Db.Cajas.Where(c => c.FechaCierre == null).FirstOrDefaultAsync();
        }   

    }
}
