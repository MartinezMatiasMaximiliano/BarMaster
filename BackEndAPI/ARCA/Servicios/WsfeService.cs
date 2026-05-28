using BackEndAPI.ARCA.Clases;

namespace BackEndAPI.ARCA.Servicios
{
    public class WsfeService
    {
        private readonly HttpClient _httpClient;

        public WsfeService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        private string BuildLastVoucherSoap(FEAuthRequest auth, int ptoVta, int cbteTipo)
        {
            return
            $"""
                <?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                    <FECompUltimoAutorizado
                    xmlns="http://ar.gov.afip.dif.FEV1/">
                    <Auth>
                    <Token>{auth.Token}</Token>
                    <Sign>{auth.Sign}</Sign>
                    <Cuit>{auth.Cuit}</Cuit>
                    </Auth>
                    <PtoVta>{ptoVta}</PtoVta>
                    <CbteTipo>{cbteTipo}</CbteTipo>
                    </FECompUltimoAutorizado>
                    </soap:Body>
                </soap:Envelope>
                """;
        }

        //public async Task<int> GetLastVoucherAsync(FEAuthRequest auth, int ptoVta, int cbteTipo)
        //{

       // }
    }
}
