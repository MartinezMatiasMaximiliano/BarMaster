using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
namespace BackEndAPI.Tests.Contratos;
public class CuentasContratoTests
{
    [Theory]
    [InlineData(0, true)]
    [InlineData(10, false)]
    [InlineData(-10, false)]
    public async Task SoloEliminaSinBalance(decimal balance, bool permitido)
    {
        var eliminada = false;
        var cuenta = new CuentaCorriente { Balance = balance };
        var repo = DobleContrato.Crear<ICuentasCorrientesRepository>((m,a) => {
            if(m.Name == "GetCuentaCorrientePorId") return Task.FromResult<CuentaCorriente?>(cuenta);
            eliminada = true; return Task.FromResult(true);
        });
        var servicio = new CuentasCorrientesServices(repo, null!);
        if(permitido) Assert.True(await servicio.EliminarCuentaCorriente(Guid.NewGuid()));
        else Assert.Equal("balance no nulo", (await Assert.ThrowsAsync<Exception>(() => servicio.EliminarCuentaCorriente(Guid.NewGuid()))).Message);
        Assert.Equal(permitido, eliminada);
    }
}
