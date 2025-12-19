using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ICategoriasServices
    {
        Task<Categoria> CrearCategoria(string Nombre); 
    }
}
