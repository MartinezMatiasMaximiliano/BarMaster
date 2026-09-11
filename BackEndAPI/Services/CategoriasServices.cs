using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
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
                throw new BusinessRuleException("El nombre es obligatorio");
            }

            var CategoriaExiste = await _categoriasRepository.CategoriaExiste(request.Nombre);
            if (CategoriaExiste == true)
            {
                throw new ConflictException("La categoria ya existe");
            }

            Categoria nuevaCategoria = new Categoria
            {
                Nombre = request.Nombre
            };

            return await _categoriasRepository.CrearCategoria(nuevaCategoria);

        }

        public async Task<IEnumerable<Categoria>> BuscarListaCategorias()
        {
            var categorias = await _categoriasRepository.GetAllCategorias();
            if (categorias == null || !categorias.Any())
            {
                throw new NotFoundException("No se encontraron categorias");
            }
            return categorias;
        }

        public async Task<Categoria> BuscarCategoriaPorId(Guid id)
        {
            var categoria = await _categoriasRepository.GetCategoriaPorId(id);
            if (categoria == null)
            {
                throw new NotFoundException("La categoria no existe");
            }
            return categoria;
        }

        public async Task<Categoria?> ModificarCategoria(Guid id, ModificarCategoriaDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Nombre))
            {
                throw new BusinessRuleException("El nombre es obligatorio");
            }
            var categoriaModificada = await _categoriasRepository.GetCategoriaPorId(id);
            if (categoriaModificada == null)
            {
                throw new NotFoundException("La categoria no existe");
            }

            if (!string.Equals(categoriaModificada.Nombre, request.Nombre, StringComparison.OrdinalIgnoreCase))
            {
                var nombreYaExiste = await _categoriasRepository.CategoriaExiste(request.Nombre);
                if (nombreYaExiste)
                {
                    throw new ConflictException("Ya existe una categoria con ese nombre");
                }
            }

            categoriaModificada.Nombre = request.Nombre;

            await _categoriasRepository.ActualizarCategoria(categoriaModificada);
            return categoriaModificada;
        }

        public async Task<Categoria?> EliminarCategoria(Guid id)
        {
            var categoriaAEliminar = await _categoriasRepository.GetCategoriaPorId(id);
            if (categoriaAEliminar == null)
            {
                throw new NotFoundException("La categoria no existe");
            }

            await _categoriasRepository.EliminarCategoria(categoriaAEliminar);
            return categoriaAEliminar;
        }

        public async Task<Categoria?> ActivarDesactivarCategoria(Guid id)
        {
            var categoria = await _categoriasRepository.GetCategoriaPorId(id);
            if (categoria == null)
            {
                throw new NotFoundException("La categoria no existe");
            }

            categoria.Activo = !categoria.Activo;
            await _categoriasRepository.ActualizarCategoria(categoria);
            return categoria;
        }
    }
}
