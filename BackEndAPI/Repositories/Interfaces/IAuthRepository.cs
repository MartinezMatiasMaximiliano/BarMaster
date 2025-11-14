using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<Sucursal> LoginSucursal(string password);


    }
}
