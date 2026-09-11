namespace BackEndAPI.Exceptions
{
    /// <summary>El recurso pedido (por Id, DNI, código, etc.) no existe. → 404.</summary>
    public class NotFoundException : AppException
    {
        public override int StatusCode => StatusCodes.Status404NotFound;
        public override string Tipo => "NOT FOUND";

        public NotFoundException(string message) : base(message) { }
    }
}
