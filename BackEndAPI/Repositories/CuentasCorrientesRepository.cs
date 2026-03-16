using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class CuentasCorrientesRepository : ICuentasCorrientesRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext Db;
        public CuentasCorrientesRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
            Db = currentDbContext.Db;
        }

        public async Task<ICollection<CuentaCorriente>> GetListaCuentasCorrientes()
        {
            return await Db.CuentasCorrientes.Include(c => c.Movimientos).ThenInclude(m => m.MovimientoCaja).ToListAsync();
        }

        public async Task<CuentaCorriente?> GetCuentaCorrientePorId(Guid id)
        {
            return await Db.CuentasCorrientes.Include(c => c.Movimientos).ThenInclude(m => m.MovimientoCaja).FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<CuentaCorriente?> CrearCuentaCorriente(CuentaCorriente cuentaCorriente)
        {
            Db.CuentasCorrientes.Add(cuentaCorriente);
            await Db.SaveChangesAsync();
            return cuentaCorriente;
        }

        public async Task<CuentaCorriente?> ActualizarDatosCuentaCorriente(CuentaCorriente cuentaCorriente)
        {
            Db.CuentasCorrientes.Update(cuentaCorriente);
            await Db.SaveChangesAsync();
            return cuentaCorriente;
        }

        public async Task<bool> EliminarCuentaCorriente(CuentaCorriente cc)
        {
            Db.CuentasCorrientes.Remove(cc);
            await Db.SaveChangesAsync();
            return true;
        }
    }
}
