namespace BackEndAPI.Impresion.Estaciones;

public sealed class ExcepcionEstacionImpresion : Exception
{
    public ExcepcionEstacionImpresion(string codigo, string mensaje, int codigoEstado) : base(mensaje)
    {
        Codigo = codigo;
        CodigoEstado = codigoEstado;
    }

    public string Codigo { get; }
    public int CodigoEstado { get; }
}
