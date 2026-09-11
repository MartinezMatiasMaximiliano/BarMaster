namespace BackEndAPI.Exceptions
{
    /// <summary>El que hace el request está autenticado (o se identificó) pero la credencial
    /// que presentó (contraseña actual, etc.) es inválida. → 401.
    /// No confundir con que falte o sea inválido el JWT en sí — eso lo maneja
    /// [Authorize]/la autenticación de ASP.NET Core antes de llegar a un controller,
    /// devolviendo 401 automáticamente sin pasar por acá.</summary>
    public class UnauthorizedException : AppException
    {
        public override int StatusCode => StatusCodes.Status401Unauthorized;
        public override string Tipo => "UNAUTHORIZED";

        public UnauthorizedException(string message) : base(message) { }
    }
}
