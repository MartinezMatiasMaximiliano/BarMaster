using System.Text.Json.Serialization;

namespace BackEndAPI.Models.Printing;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PrinterRole
{
    Preticket = 1,
    PaymentReceipt = 2,
    Kitchen = 3,
    Bar = 4
}
