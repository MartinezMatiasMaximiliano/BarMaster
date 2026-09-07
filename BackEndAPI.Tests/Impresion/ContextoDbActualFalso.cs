using BackEndAPI.Data;
using BackEndAPI.Tenancy.Services;

namespace BackEndAPI.Tests.Impresion;

internal sealed class ContextoDbActualFalso : ICurrentDbContext
{
    public ContextoDbActualFalso(AppDbContext db) => Db = db;
    public AppDbContext Db { get; }
}
