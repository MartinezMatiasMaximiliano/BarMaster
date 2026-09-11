namespace BackEndAPI.Exceptions
{
    /// Base para toda excepción de negocio "esperada" (dato no encontrado, conflicto,
    /// regla de negocio violada, etc.), a diferencia de un bug real (NullReferenceException,
    /// falla de conexión, etc.).
    ///
    /// El ExceptionHandlingMiddleware la atrapa de forma genérica y usa StatusCode/Tipo
    /// para armar la respuesta, así agregar un nuevo tipo de excepción (ej. ForbiddenException
    /// cuando se sume autorización por rol) no requiere tocar el middleware.
    public abstract class AppException : Exception
    {
        public abstract int StatusCode { get; }
        public abstract string Tipo { get; }

        protected AppException(string message) : base(message) { }
    }
}
