namespace BackEndAPI.Exceptions
{
    /// <summary>La operación choca con el estado actual de los datos (DNI/código duplicado,
    /// caja ya cerrada, etc.). → 409.</summary>
    public class ConflictException : AppException
    {
        public override int StatusCode => StatusCodes.Status409Conflict;
        public override string Tipo => "CONFLICT";

        public ConflictException(string message) : base(message) { }
    }
}
