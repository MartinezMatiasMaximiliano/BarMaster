using Npgsql.Internal;

public class TipoSubscripcion
{
    public short Id { get; set; }
    public string Nombre { get; set; } = null!;
    public decimal Precio { get; set; }
    public string[] Features { get; set; } = null!;
}

