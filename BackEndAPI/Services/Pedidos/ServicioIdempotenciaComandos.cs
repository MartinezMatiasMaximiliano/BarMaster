using BackEndAPI.Models.Impresion;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Services.Pedidos;

public interface IServicioIdempotenciaComandos
{
    Task<bool> RegistrarAsync(Guid idComando, Guid idVisita);
}

public sealed class ServicioIdempotenciaComandos(ICurrentDbContext contexto) : IServicioIdempotenciaComandos
{
    public async Task<bool> RegistrarAsync(Guid idComando, Guid idVisita)
    {
        if (idComando == Guid.Empty) throw new Exception("El identificador del pedido es inválido");
        var db = contexto.Db;
        if (db.Database.IsRelational())
        {
            var insertados = await db.Database.ExecuteSqlInterpolatedAsync($$"""
                INSERT INTO "ComandosPedidoVisita" ("IdComando", "IdVisita", "CreadoEn")
                VALUES ({{idComando}}, {{idVisita}}, {{DateTime.UtcNow}})
                ON CONFLICT ("IdComando") DO NOTHING
                """);
            return insertados == 1;
        }
        if (await db.ComandosPedidoVisita.AnyAsync(x => x.IdComando == idComando)) return false;
        db.ComandosPedidoVisita.Add(new ComandoPedidoVisita { IdComando = idComando, IdVisita = idVisita, CreadoEn = DateTime.UtcNow });
        await db.SaveChangesAsync();
        return true;
    }
}
