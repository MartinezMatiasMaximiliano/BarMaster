namespace BackEndAPI.Exceptions
{
    /// <summary>La identidad es válida, pero no tiene permiso para realizar la operación. → 403.</summary>
    public class ForbiddenException : AppException
    {
        public override int StatusCode => StatusCodes.Status403Forbidden;
        public override string Tipo => "FORBIDDEN";

        public ForbiddenException(string message) : base(message) { }
    }
}
