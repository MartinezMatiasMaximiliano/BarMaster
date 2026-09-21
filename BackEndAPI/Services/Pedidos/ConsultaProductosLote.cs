using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;

namespace BackEndAPI.Services.Pedidos;

public interface IConsultaProductosLote
{
    Task<IReadOnlyDictionary<Guid, Producto>> ObtenerAsync(IEnumerable<Guid> ids);
}

public sealed class ConsultaProductosLote(IProductosRepository repositorio) : IConsultaProductosLote
{
    public Task<IReadOnlyDictionary<Guid, Producto>> ObtenerAsync(IEnumerable<Guid> ids) => repositorio.GetProductosPorIds(ids);
}
