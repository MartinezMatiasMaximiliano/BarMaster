using System.Text.Json.Serialization;

namespace BackEndAPI.Models.Impresion;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TipoSalidaImpresion
{
    Comanda = 0,
    Ticket = 1
}
