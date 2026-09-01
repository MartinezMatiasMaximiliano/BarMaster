using BackEndAPI.Data;
using BackEndAPI.Tenancy.Services;

namespace BackEndAPI.Tests.Printing;

internal sealed class FakeCurrentDbContext : ICurrentDbContext
{
    public FakeCurrentDbContext(AppDbContext db) => Db = db;
    public AppDbContext Db { get; }
}
