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
        public async Task<Categoria> CrearCategoria(string Nombre)
        {
            if (string.IsNullOrWhiteSpace(Nombre))
            {
                throw new Exception("El nombre es obligatorio");
            }

            var CategoriaExiste = await _categoriasRepository.CategoriaExiste(Nombre);
            if (CategoriaExiste == true)
            {
                throw new Exception("La categoria ya existe");
            }

            Categoria nuevaCategoria = new Categoria
            {
                Nombre = Nombre,
            };

            return await _categoriasRepository.CrearCategoria(nuevaCategoria);

        }
    }
}
