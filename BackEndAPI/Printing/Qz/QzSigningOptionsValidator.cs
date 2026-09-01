using Microsoft.Extensions.Options;

namespace BackEndAPI.Printing.Qz;

public sealed class QzSigningOptionsValidator : IValidateOptions<QzSigningOptions>
{
    public ValidateOptionsResult Validate(string? name, QzSigningOptions options)
    {
        if (!options.Enabled) return ValidateOptionsResult.Success;
        if (options.MinimumRemainingDays is < 1 or > 365)
            return ValidateOptionsResult.Fail("QzSigning:MinimumRemainingDays debe estar entre 1 y 365.");

        try
        {
            using var _ = QzCertificateMaterial.LoadAndValidate(options);
            return ValidateOptionsResult.Success;
        }
        catch (Exception exception)
        {
            return ValidateOptionsResult.Fail(exception.Message);
        }
    }
}
