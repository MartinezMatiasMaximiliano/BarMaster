namespace BackEndAPI.DTOs.Response
{
    public class RespuestaDTO
    {
        public int Codigo { get; set; }
        public string Tipo { get; set; }
        public string Mensaje { get; set; }
    }

    public class ErrorDTO
    {
        public RespuestaDTO error { get; set; }
        public ErrorDTO(int Codigo, string Tipo, string Mensaje)
        {
            error = new RespuestaDTO()
            {
                Codigo = Codigo,
                Tipo = Tipo,
                Mensaje = Mensaje
            };
        }
    }

    public class EntregaDTO
    {
        public RespuestaDTO data { get; set; }

        public EntregaDTO(int Codigo, string Tipo, string Mensaje)
        {
            data = new RespuestaDTO()
            {
                Codigo = Codigo,
                Tipo = Tipo,
                Mensaje = Mensaje
            };
        }
    }
}
