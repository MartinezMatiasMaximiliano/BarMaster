using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ICategoriasRepository
    {
        Task<bool> CategoriaExiste(string Nombre);  
        Task<Categoria> CrearCategoria(Categoria nuevaCategoria);
        Task<IEnumerable<Categoria>> GetAllCategorias();
        Task<Categoria?> GetCategoriaById(Guid id);
        Task<Categoria?> ActualizarCategoria(Categoria categoria);
        Task<Categoria?> EliminarCategoria(Guid id);
    }
}
