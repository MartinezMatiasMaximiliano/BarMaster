using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class CategoriasServices : ICategoriasServices
    {
        private readonly ICategoriasRepository _categoriasRepository;
        public CategoriasServices(ICategoriasRepository categoriasRepository)
        {
            _categoriasRepository = categoriasRepository;
        }
        public async Task<Categoria> CrearCategoria(CrearCategoriaDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Nombre))
            {
                throw new Exception("El nombre es obligatorio");
            }

            var CategoriaExiste = await _categoriasRepository.CategoriaExiste(request.Nombre);
            if (CategoriaExiste == true)
            {
                throw new Exception("La categoria ya existe");
            }

            Categoria nuevaCategoria = new Categoria
            {
                Nombre = request.Nombre,
                Activo = request.Activo
            };

            return await _categoriasRepository.CrearCategoria(nuevaCategoria);

        }

        public async Task<IEnumerable<Categoria>> BuscarListaCategorias()
        {
            return await _categoriasRepository.GetAllCategorias();
        }

        public async Task<Categoria> BuscarCategoriaPorId(Guid id)
        {
            var categoria = await _categoriasRepository.GetCategoriaPorId(id);
            if (categoria == null)
            {
                throw new Exception("La categoria no existe");
            }
            return categoria;
        }

        public async Task<Categoria?> ModificarCategoria(Guid id, ModificarCategoriaDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Nombre)) {
                throw new Exception("El nombre es obligatorio");
            }

            var categoria = await _categoriasRepository.GetCategoriaPorId(id);
            
            if (categoria == null)
            {
                throw new Exception("La categoria no existe");
            }

            var categoriaExiste = await _categoriasRepository.CategoriaExiste(request.Nombre);

            if (categoriaExiste)
            {
                if (categoria.Nombre != request.Nombre)
                {
                    throw new Exception("Ya existe una categoria con ese nombre");
                }
            }

            if (request.Activo.HasValue)
            {
                categoria.Activo = request.Activo.Value;
            }

            categoria.Nombre = request.Nombre;

            await _categoriasRepository.ActualizarCategoria(categoria);
            return categoria;
        }

        public async Task<Categoria?> EliminarCategoria(Guid id)
        {
            var categoriaAEliminar = await _categoriasRepository.GetCategoriaPorId(id);
            if (categoriaAEliminar == null)
            {
                throw new Exception("La categoria no existe");
            }

            await _categoriasRepository.EliminarCategoria(categoriaAEliminar);
            return categoriaAEliminar;
        }
    }
}
