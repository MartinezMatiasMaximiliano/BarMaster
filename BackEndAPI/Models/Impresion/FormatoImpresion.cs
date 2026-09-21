using System.Text.Json.Serialization;

namespace BackEndAPI.Models.Impresion;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FormatoImpresion
{
    Crudo = 1
}
