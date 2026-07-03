namespace BackEndAPI.ARCA.Clases
{
    //clase para recibir la respuesta de AFIP con el CAE (Codigo de Autorización Electrónica)
    public class FECAEResponse
    {
        public string Result { get; set; } = default!;
        public string CAE { get; set; } = default!;
        public string CAEExpiration { get; set; } = default!;
    }
}
