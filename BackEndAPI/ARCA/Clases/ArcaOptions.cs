namespace BackEndAPI.ARCA.Clases
{
    //clase para representar las opciones de configuración de ARCA
    public class ArcaOptions
    {
        public string Environment { get; set; } = default!;
        public string WsaaUrl { get; set; } = default!;
        public string WsfeUrl { get; set; } = default!;
    }
}
