using BackEndAPI.Tenancy.Models;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Data
{
    public class MasterDbContext : DbContext
    {
        public MasterDbContext(DbContextOptions<MasterDbContext> options): base(options) { }
        public DbSet<Tenant> Tenants { get; set; } = null!;


    }
}
