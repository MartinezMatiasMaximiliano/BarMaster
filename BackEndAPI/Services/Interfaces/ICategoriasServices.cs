using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ICategoriasServices
    {
        Task<Categoria> CrearCategoria(CrearCategoriaDTO request);
        Task<IEnumerable<Categoria>> BuscarListaCategorias();
        Task<Categoria> BuscarCategoriaPorId(Guid id);
        Task<Categoria?> ModificarCategoria(Guid id, ModificarCategoriaDTO request);
        Task<Categoria?> EliminarCategoria(Guid id);
        Task<Categoria?> ActivarDesactivarCategoria(Guid id);
    }
}
