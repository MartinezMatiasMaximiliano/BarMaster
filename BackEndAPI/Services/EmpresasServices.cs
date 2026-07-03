using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Empresas;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;

namespace BackEndAPI.Services
{
    public class EmpresasServices : IEmpresasServices
    {
        private readonly IEmpresasRepository _empresasRepository;
        private readonly ITenantServices _tenantServices;
        private readonly PasswordService _passwordService;

        public EmpresasServices(IEmpresasRepository empresasRepository, ITenantServices tenantServices, PasswordService passwordService)
        {
            _empresasRepository = empresasRepository;
            _tenantServices = tenantServices;
            _passwordService = passwordService;
        }

        public async Task<IEnumerable<Empresa>> GetAllEmpresas()
        {
            IEnumerable<Empresa> result = await _empresasRepository.GetAllEmpresas();
            return result;
        }

        public async Task<Empresa?> GetEmpresaById(Guid id)
        {
            var result = await _empresasRepository.GetEmpresaById(id);
            return result;
        }

        public async Task<Empresa?> GetEmpresaByNombre(string nombre)
        {
            return await _empresasRepository.GetEmpresaByUsername(nombre);
        }

        public async Task<EmpresaSucursalesResumenDTO?> GetResumenSucursales(Guid idEmpresa, DateTime desde, DateTime hasta)
        {
            var (desdeUtc, hastaUtc) = SucursalesResumenBuilder.ObtenerRangoUtc(desde, hasta);
            var datosResumen = await _empresasRepository.GetDatosResumenSucursales(idEmpresa, desdeUtc, hastaUtc);
            if (datosResumen == null) return null;

            return SucursalesResumenBuilder.Construir(datosResumen, desde, hasta);
        }

        public async Task<Empresa> AddEmpresa(CrearEmpresaDTO request)
        {
            var result = await _tenantServices.BuscarTenantPorNombreEmpresa(request.Nombre.ToLower().Replace(" ", string.Empty));

            if (result != null) throw new Exception("Ya existe una empresa con el nombre solicitado.");

            Empresa empresa = new()
            {
                Nombre = request.Nombre,
                Telefonos = request.Telefonos,
                Emails = request.Emails,
                Activo = true,
                FechaInscripcion = DateTime.UtcNow,
                IdTipoSubscripcion = null,
                Username = request.Nombre.ToLower().Replace(" ", string.Empty),
            };
            _passwordService.CrearPasswordHash(request.Password, out byte[] hash, out byte[] salt);
            empresa.EstablecerContrasena(hash, salt);

            var tenantInfo = await _tenantServices.CrearTenant(empresa);
            return empresa;
        }

        public Task<bool> ModificarEmpresa(ModificarEmpresaDTO request)
        {
            throw new KeyNotFoundException($"La empresa no fue encontrada.");
        }

        public async Task DeleteEmpresa(Guid id)
        {
            await _empresasRepository.DeleteEmpresa(id);
        }
    }
}
