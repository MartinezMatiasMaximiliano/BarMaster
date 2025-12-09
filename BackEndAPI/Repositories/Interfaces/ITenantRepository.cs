namespace BackEndAPI.Repositories.Interfaces
{
    public interface ITenantRepository
    {
        Task<bool> TenantExistsAsync(string tenantId);
        
    }
}
