using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ICategoriasRepository
    {
        Task<bool> CategoriaExiste(string Nombre);  
        Task<Categoria> CrearCategoria(Categoria nuevaCategoria);
    }
}
