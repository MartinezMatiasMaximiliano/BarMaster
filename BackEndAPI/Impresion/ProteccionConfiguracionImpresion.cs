using BackEndAPI.Data;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Impresion;

internal static class ProteccionConfiguracionImpresion
{
    public static async Task AsegurarSinCajaActivaAsync(
        AppDbContext db,
        Guid idSucursal,
        CancellationToken tokenCancelacion)
    {
        if (await db.Cajas.AsNoTracking().AnyAsync(
                x => x.IdSucursal == idSucursal && x.FechaCierre == null,
                tokenCancelacion))
            throw new ExcepcionEstacionImpresion(
                "CONFIGURACION_IMPRESION_BLOQUEADA_CAJA_ACTIVA",
                "No se puede modificar la configuración de impresión mientras haya una caja activa.",
                StatusCodes.Status409Conflict);
    }
}
