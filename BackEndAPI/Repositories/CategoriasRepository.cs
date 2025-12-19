using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class CategoriasRepository : ICategoriasRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;
        public CategoriasRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext= currentDbContext;
            db = _currentDbContext.Db;
        }

        public async Task<bool> CategoriaExiste(string Nombre)
        {
            return await db.Categorias.AnyAsync(c => c.Nombre == Nombre);
        }

        public async Task<Categoria> CrearCategoria(Categoria nuevaCategoria)
        {
            await db.Categorias.AddAsync(nuevaCategoria);
            await db.SaveChangesAsync();
            return nuevaCategoria;
        }
    }
}
