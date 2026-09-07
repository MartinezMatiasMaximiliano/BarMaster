namespace BackEndAPI.Models.Impresion;

public sealed class ComandoPedidoVisita
{
    public Guid IdComando { get; set; }
    public Guid IdVisita { get; set; }
    public DateTime CreadoEn { get; set; }
    public Visita Visita { get; set; } = null!;
}
