using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ICategoriasRepository
    {
        Task<bool> CategoriaExiste(string Nombre);  
        Task<Categoria> CrearCategoria(Categoria nuevaCategoria);
        Task<ICollection<Categoria>> GetAllCategorias();
        Task<ICollection<Categoria?>> GetListaCategorias(IEnumerable<Guid> ListaCategorias);
        Task<Categoria?> GetCategoriaPorId(Guid id);
        Task<Categoria?> ActualizarCategoria(Categoria categoria);
        Task<Categoria?> EliminarCategoria(Categoria categoriaAEliminar);
    }
}
