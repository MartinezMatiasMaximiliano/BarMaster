namespace BackEndAPI.Tenancy
{
    //contiene la informacion del tenant
    public class TenantInfo
    {
        public string TenantId { get; set; } = default!;
        public string ConnectionString { get; set; } = default!;
    }
}
