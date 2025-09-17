namespace BackEndAPI.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<string> Login(string telefono, string password);
        Task<string> Register(string telefono, string password, int rolId, Guid? idSucursal = null);
        Task<bool> UserExists(string telefono);
        Task<string> LoginSucursal(string password);
        Task<bool> SucursalExists();
    }
}
