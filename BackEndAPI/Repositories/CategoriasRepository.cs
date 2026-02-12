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

        public async Task<ICollection<Categoria>> GetAllCategorias()
        {
            return await db.Categorias.ToListAsync();
        }

        public async Task<ICollection<Categoria?>> GetListaCategorias(IEnumerable<Guid> ListaIdCategorias)
        {
            return await db.Categorias.Where(c => ListaIdCategorias.Contains(c.Id)).ToListAsync();
        }

        public async Task<Categoria?> GetCategoriaPorId(Guid id)
        {
            return await db.Categorias.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Categoria?> ActualizarCategoria(Categoria categoria)
        {
            db.Entry(categoria).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return null;
        }

        public async Task<Categoria?> EliminarCategoria(Categoria categoriaAEliminar)
        {
            db.Categorias.Remove(categoriaAEliminar);
            await db.SaveChangesAsync();
            return categoriaAEliminar;
        }
    }
}
