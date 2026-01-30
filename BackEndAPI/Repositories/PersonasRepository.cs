using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class PersonasRepository : IPersonasRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
        public PersonasRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }
        public async Task<Persona?> CrearPersona(Persona nuevaPersona)
        {
            db.Personas.Add(nuevaPersona);
            await db.SaveChangesAsync();
            return nuevaPersona;
        }
        public async Task<Persona?> GetPersonaPorId(Guid IdPersona)
        {
           return await db.Personas.Include(p => p.Rol).FirstOrDefaultAsync(p => p.Id == IdPersona);
        }
        public async Task<Persona?> GetPersonaPorDni(string Dni)
        {
            return await db.Personas.Include(p => p.Rol).FirstOrDefaultAsync(p => p.Dni == Dni);
        }

        public async Task<Persona?> GetPersonaPorCodigoDeServicio(string CodigoDeServicio)
        {
            return await db.Personas.Include(p => p.Rol).FirstOrDefaultAsync(p => p.CodigoDeServicio == CodigoDeServicio);
        }
        public async Task<ICollection<Persona>> GetAllPersonas()
        {
            return await db.Personas.Include(p => p.Rol).ToListAsync(); 
        }

        public async Task<List<Persona>> GetListaPersonasPorIdSucursal(Guid IdSucursal)
        {
           // return await db.Personas.Include(p => p.Rol).Where(p => p.IdSucursal == Guid.TryParse(IdSucursal));
           throw new NotImplementedException();
        }
        public async Task<Persona?> ActualizarPersona(Persona personaActualizada)
        {
            db.Entry(personaActualizada).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return personaActualizada;
        }
        public async Task<Persona?> EliminarPersona(Persona persona)
        {
            db.Personas.Remove(persona);
            await db.SaveChangesAsync();
            return null;

        }
        public async Task<bool> EsCodigoUnico(string codigoDeServicio)
        {
            return !await db.Personas.AnyAsync(p => p.CodigoDeServicio == codigoDeServicio);
        }

        public async Task<ICollection<Persona>> GetPersonasPorNombreRol(string nombreRol)
        {
            return await db.Personas
                .Include(p => p.Rol)
                .Where(p => p.Rol.Nombre == nombreRol)
                .ToListAsync();
        }

    }
}
