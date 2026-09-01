using System.Text.Json.Serialization;

namespace BackEndAPI.Models.Printing;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PrintFormat
{
    Raw = 1,
    Pdf = 2,
    Png = 3
}
