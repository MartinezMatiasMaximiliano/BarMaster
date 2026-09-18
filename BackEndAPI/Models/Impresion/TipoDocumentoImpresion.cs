using System.Text.Json.Serialization;

namespace BackEndAPI.Models.Impresion;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TipoDocumentoImpresion
{
    Preticket = 0,
    ComprobantePago = 1,
    Comanda = 2
}
