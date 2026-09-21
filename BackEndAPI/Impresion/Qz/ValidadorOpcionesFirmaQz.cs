using Microsoft.Extensions.Options;

namespace BackEndAPI.Impresion.Qz;

public sealed class ValidadorOpcionesFirmaQz : IValidateOptions<OpcionesFirmaQz>
{
    public ValidateOptionsResult Validate(string? name, OpcionesFirmaQz opciones)
    {
        if (!opciones.Habilitada) return ValidateOptionsResult.Success;
        if (opciones.MinimoDiasRestantes is < 1 or > 365)
            return ValidateOptionsResult.Fail("FirmaQz:MinimoDiasRestantes debe estar entre 1 y 365.");

        try
        {
            using var _ = MaterialCertificadoQz.CargarYValidar(opciones);
            return ValidateOptionsResult.Success;
        }
        catch (Exception exception)
        {
            return ValidateOptionsResult.Fail(exception.Message);
        }
    }
}
