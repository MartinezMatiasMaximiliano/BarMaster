using System.Text.Json.Serialization;

namespace BackEndAPI.Models.Impresion;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MomentoImpresion
{
    AlCargarProductosMesa = 0,
    AlCobrarProductosFacturados = 1,
    AlGenerarPreticket = 2,
    AlCobrarProductosSinFacturar = 3
}
