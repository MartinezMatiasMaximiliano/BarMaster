using System.Text.Json.Serialization;

namespace BackEndAPI.Models.Impresion;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EstadoTrabajoImpresion
{
    Pendiente = 0,
    Reservado = 1,
    Enviando = 2,
    AceptadoPorCola = 3,
    ReintentoProgramado = 4,
    RequiereAtencion = 5,
    Vencido = 6,
    Cancelado = 7
}
