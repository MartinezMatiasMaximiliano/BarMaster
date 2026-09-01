namespace BackEndAPI.Printing.Stations;

public sealed class PrintingStationException : Exception
{
    public PrintingStationException(string code, string message, int statusCode) : base(message)
    {
        Code = code;
        StatusCode = statusCode;
    }

    public string Code { get; }
    public int StatusCode { get; }
}
