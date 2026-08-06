using BackEndAPI.Data;
using BackEndAPI.DTOs.Query;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class EmpresasRepository : IEmpresasRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
        public EmpresasRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;

        }
        public async Task<IEnumerable<Empresa>> GetAllEmpresas()
        {
            return await db.Empresas
                .Include(e => e.Sucursales)
                //.Include(e => e.Propietario)
                .ToListAsync();
        }
        public async Task<Empresa?> GetEmpresaById(Guid id)
        {
            return await db.Empresas
                .AsSplitQuery()
                .Include(e => e.Sucursales)
                //.Include(e=>e.Propietario)
                .FirstOrDefaultAsync(e => e.Id == id);
        }
        public async Task<EmpresaResumenQueryDTO?> GetDatosResumenSucursales(Guid idEmpresa, DateTime desdeUtc, DateTime hastaUtc)
        {
            var empresa = await db.Empresas
                .AsNoTracking()
                .Where(e => e.Id == idEmpresa)
                .Select(e => new EmpresaResumenQueryDTO
                {
                    EmpresaId = e.Id,
                    EmpresaNombre = e.Nombre,
                    Sucursales = e.Sucursales
                        .Select(s => new SucursalResumenQueryDTO
                        {
                            Id = s.Id,
                            Nombre = s.Nombre,
                            Direccion = s.Direccion,
                            Telefono = s.Telefono
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (empresa == null) return null;
            if (empresa.Sucursales.Count == 0) return empresa;

            var sucursalesPorId = empresa.Sucursales.ToDictionary(s => s.Id);
            var idsSucursales = sucursalesPorId.Keys.ToList();

            var cajasActivas = await db.Cajas
                .AsNoTracking()
                .Where(c => idsSucursales.Contains(c.IdSucursal) && c.FechaCierre == null)
                .Select(c => new CajaResumenQueryDTO
                {
                    Id = c.Id,
                    IdSucursal = c.IdSucursal,
                    FechaApertura = c.FechaApertura,
                    MontoApertura = c.MontoApertura,
                    MontoActual = c.MontoActual,
                    Movimientos = c.MovimientosCaja
                        .Select(m => new MovimientoCajaResumenQueryDTO
                        {
                            MontoAbonado = m.MontoAbonado,
                            Vuelto = m.Vuelto,
                            MontoTotal = m.MontoTotal,
                            EsIngreso = m.TipoMovimientoCaja != null ? m.TipoMovimientoCaja.EsIngreso : null,
                            EsEfectivo = m.TipoMovimientoCaja != null ? m.TipoMovimientoCaja.EsEfectivo : null
                        })
                        .ToList()
                })
                .ToListAsync();

            foreach (var cajaActiva in cajasActivas
                .GroupBy(c => c.IdSucursal)
                .Select(g => g.OrderByDescending(c => c.FechaApertura).First()))
            {
                sucursalesPorId[cajaActiva.IdSucursal].CajaActiva = cajaActiva;
            }

            var visitasPeriodo = await db.Visitas
                .AsNoTracking()
                .Where(v =>
                    idsSucursales.Contains(v.Caja.IdSucursal) &&
                    v.FechaHora >= desdeUtc &&
                    v.FechaHora <= hastaUtc)
                .Select(v => new VisitaResumenQueryDTO
                {
                    Id = v.Id,
                    IdSucursal = v.Caja.IdSucursal,
                    FechaHora = v.FechaHora,
                    Total = v.Total,
                    Productos = v.Productos
                        .Select(p => new ProductoVisitaResumenQueryDTO
                        {
                            NombreProducto = p.NombreProducto,
                            PrecioDelMomento = p.PrecioDelMomento,
                            CostoProduccion = p.Producto != null ? p.Producto.CostoProduccion : null
                        })
                        .ToList()
                })
                .ToListAsync();

            foreach (var visita in visitasPeriodo)
            {
                if (sucursalesPorId.TryGetValue(visita.IdSucursal, out var sucursal))
                {
                    sucursal.VisitasPeriodo.Add(visita);
                }
            }

            return empresa;
        }

        public async Task<Empresa?> GetEmpresaByUsername(string username)
        {
            if (db == null) return null;

            return await db.Empresas
                .Include(e => e.Sucursales)
                //.Include(e => e.Propietario)
                .FirstOrDefaultAsync(e => e.Username == username);
        }
        public async Task<Empresa> AddEmpresa(Empresa empresa, Tenant tenant)
        {
            try
            {
                await db.Empresas.AddAsync(empresa);
                await db.SaveChangesAsync();
                return empresa;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public async Task UpdateEmpresa(Empresa empresa)
        {
            db.Empresas.Update(empresa);
            await db.SaveChangesAsync();
        }
        public async Task DeleteEmpresa(Guid Id)
        {
            var empresa = new Empresa { Id = Id };
            db.Empresas.Attach(empresa);
            db.Empresas.Remove(empresa);
            await db.SaveChangesAsync();
        }
    }
}
