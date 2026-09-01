using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Printing.Qz;

public sealed record QzSignRequest(
    [param: Required, RegularExpression("^[0-9a-f]{64}$")] string Request,
    Guid StationId);
