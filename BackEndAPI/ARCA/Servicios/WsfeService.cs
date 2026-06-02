using BackEndAPI.ARCA.Clases;
using System.Text;
using System.Xml.Linq;

namespace BackEndAPI.ARCA.Servicios
{
    //WSFEV1: https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL
    //WSFEV1: web service facturación electrónica V1 de AFIP

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

        public async Task<int> GetLastVoucherAsync(FEAuthRequest auth, int ptoVta, int cbteTipo)
        {
            var soapXml = BuildLastVoucherSoap(auth, ptoVta, cbteTipo);

            var content = new StringContent(soapXml, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", "\"http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado\"");

            var url = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx";
            var response = await _httpClient.PostAsync(url, content);

            var responseXml = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseXml);

            var doc = XDocument.Parse(responseXml);
            XNamespace ns = "http://ar.gov.afip.dif.FEV1/";
            var cbteNro = doc.Descendants(ns + "CbteNro").First().Value;

            return int.Parse(cbteNro);
        }


        private string BuildCAERequestSoap(FEAuthRequest auth, int ptoVta, int cbteTipo, FECAERequest invoice)
        {
            return $"""
                <?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <FECAESolicitar
                        xmlns="http://ar.gov.afip.dif.FEV1/">
                        <Auth>
                            <Token>{auth.Token}</Token>
                            <Sign>{auth.Sign}</Sign>
                            <Cuit>{auth.Cuit}</Cuit>
                        </Auth>
                        <FeCAEReq>
                            <FeCabReq>
                                <CantReg>1</CantReg>
                                <PtoVta>{ptoVta}</PtoVta>
                                <CbteTipo>{cbteTipo}</CbteTipo>
                            </FeCabReq>
                            <FeDetReq>
                            <FECAEDetRequest>
                                <Concepto>{invoice.Concepto}</Concepto>
                                <DocTipo>{invoice.DocTipo}</DocTipo>
                                <DocNro>{invoice.DocNro}</DocNro>
                                <CbteDesde>{invoice.CbteDesde}</CbteDesde>
                                <CbteHasta>{invoice.CbteHasta}</CbteHasta>
                                <CbteFch>{invoice.CbteFch:yyyyMMdd}</CbteFch>
                                <ImpTotal>{invoice.ImpTotal}</ImpTotal>
                                <ImpTotConc>{invoice.ImpTotConc}</ImpTotConc>
                                <ImpNeto>{invoice.ImpNeto}</ImpNeto>
                                <ImpOpEx>{invoice.ImpOpEx}</ImpOpEx>
                                <ImpIVA>{invoice.ImpIVA}</ImpIVA>
                                <ImpTrib>{invoice.ImpTrib}</ImpTrib>
                                <MonId>{invoice.MonId}</MonId>
                                <MonCotiz>{invoice.MonCotiz}</MonCotiz>
                            </FECAEDetRequest>
                            </FeDetReq>
                        </FeCAEReq>
                        </FECAESolicitar>
                    </soap:Body>
                </soap:Envelope>
                """;
        }
        public async Task<FECAEResponse> RequestCAEAsync(FEAuthRequest auth, int ptoVta, int cbteTipo, FECAERequest invoice)
        {
            var soapXml = BuildCAERequestSoap(auth, ptoVta, cbteTipo, invoice);

            var content = new StringContent(soapXml, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", "\"http://ar.gov.afip.dif.FEV1/FECAESolicitar\"");

            var url = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx";
            var response = await _httpClient.PostAsync(url, content);

            var responseXml = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseXml);

            var doc = XDocument.Parse(responseXml);
            XNamespace ns = "http://ar.gov.afip.dif.FEV1/";

            var result = doc.Descendants(ns + "Resultado").First().Value;
            var cae = doc.Descendants(ns + "CAE").First().Value;
            var caeVto = doc.Descendants(ns + "CAEFchVto").First().Value;

            return new FECAEResponse
            {
                Result = result,
                CAE = cae,
                CAEExpiration = caeVto
            };

        }
    }
}
