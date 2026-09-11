namespace BackEndAPI.Exceptions
{
    /// <summary>El request es inválido según una regla de negocio (datos faltantes,
    /// valor fuera de rango, operación no permitida en el estado actual). → 400.</summary>
    public class BusinessRuleException : AppException
    {
        public override int StatusCode => StatusCodes.Status400BadRequest;
        public override string Tipo => "BAD REQUEST";

        public BusinessRuleException(string message) : base(message) { }
    }
}
