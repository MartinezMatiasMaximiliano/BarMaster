using BackEndAPI.ARCA.Clases;
using Microsoft.Extensions.Options;
using System.Text;
using System.Xml.Linq;

namespace BackEndAPI.ARCA.Servicios
{
    //WSFEV1: https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL
    //WSFEV1: web service facturación electrónica V1 de AFIP

    public class WsfeService
    {
        private readonly HttpClient _httpClient;
        private readonly ArcaOptions _arcaOptions;
        public WsfeService(HttpClient httpClient, IOptions<ArcaOptions> arcaOptions)
        {
            _httpClient = httpClient;
            _arcaOptions = arcaOptions.Value;
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
            content.Headers.Add("SOAPAction", $"\"{WsfeSoapActions.FECompUltimoAutorizado}\"");

            var response = await _httpClient.PostAsync(_arcaOptions.WsfeUrl, content);

            var responseXml = await response.Content.ReadAsStringAsync();

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
                                <CondicionIVAReceptorId>{invoice.CondicionIVAReceptorId}</CondicionIVAReceptorId>
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
            content.Headers.Add("SOAPAction", $"\"{WsfeSoapActions.FECAESolicitar}\"");
            var response = await _httpClient.PostAsync(_arcaOptions.WsfeUrl, content);

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


        private string BuildCondicionIvaRequest(FEAuthRequest auth)
        {
            return $"""
                <?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <FEParamGetCondicionIvaReceptor
                    xmlns="http://ar.gov.afip.dif.FEV1/">
                        <Auth>
                            <Token>{auth.Token}</Token>
                            <Sign>{auth.Sign}</Sign>
                            <Cuit>{auth.Cuit}</Cuit>
                        </Auth>
                    </FEParamGetCondicionIvaReceptor>
                </soap:Body>
                </soap:Envelope>
                """;
        }
        public async Task<List<CondicionIvaReceptor>> GetCondicionesIvaReceptorAsync(FEAuthRequest auth)
        {
            var soapXml = BuildCondicionIvaRequest(auth);
            var content = new StringContent(soapXml, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", $"\"{WsfeSoapActions.FEParamGetCondicionIvaReceptor}\"");

            var response = await _httpClient.PostAsync(_arcaOptions.WsfeUrl, content);
            var responseXml = await response.Content.ReadAsStringAsync();

            var doc = XDocument.Parse(responseXml);

            XNamespace ns = "http://ar.gov.afip.dif.FEV1/";

            return doc.Descendants(ns + "CondicionIvaReceptor").Select(x => new CondicionIvaReceptor
            {
                Id = int.Parse(x.Element(ns + "Id")!.Value),

                Descripcion = x.Element(ns + "Desc")!.Value,

                ClaseComprobante = x.Element(ns + "Cmp_Clase")?.Value ?? ""
            }).ToList();
        }

        private string BuildFECompConsultarSoap(FEAuthRequest auth, FECompConsultarRequest request)
        {
            return $"""
                <?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <FECompConsultar
                        xmlns="http://ar.gov.afip.dif.FEV1/">
                            <Auth>
                                <Token>{auth.Token}</Token>
                                <Sign>{auth.Sign}</Sign>
                                <Cuit>{auth.Cuit}</Cuit>
                            </Auth>
                            <FeCompConsReq>
                                <CbteTipo>{request.TipoComprobante}</CbteTipo>
                                <CbteNro>{request.NumeroComprobante}</CbteNro>
                                <PtoVta>{request.PuntoVenta}</PtoVta>
                            </FeCompConsReq>
                        </FECompConsultar>
                    </soap:Body>
                </soap:Envelope>
                """;
        }

        public async Task<FECompConsultarResponse> FECompConsultarAsync(FEAuthRequest auth, FECompConsultarRequest request)
        {
            var soapXml = BuildFECompConsultarSoap(auth, request);
            var content = new StringContent(soapXml, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", $"\"{WsfeSoapActions.FECompConsultar}\"");

            var response = await _httpClient.PostAsync(_arcaOptions.WsfeUrl, content);
            var responseXml = await response.Content.ReadAsStringAsync();

            var doc = XDocument.Parse(responseXml);
            XNamespace ns = "http://ar.gov.afip.dif.FEV1/";
            var result = doc.Descendants(ns + "ResultGet").First();

            return new FECompConsultarResponse
            {
                NumeroComprobante = long.Parse(result.Element(ns + "CbteDesde")!.Value),
                PuntoVenta = int.Parse(result.Element(ns + "PtoVta")!.Value),
                TipoComprobante = int.Parse(result.Element(ns + "CbteTipo")!.Value),
                DocTipo = int.Parse(result.Element(ns + "DocTipo")!.Value),
                DocNro = long.Parse(result.Element(ns + "DocNro")!.Value),
                ImporteTotal = decimal.Parse(result.Element(ns + "ImpTotal")!.Value, System.Globalization.CultureInfo.InvariantCulture),
                Cae = result.Element(ns + "CodAutorizacion")?.Value ?? "",
                CaeVencimiento = result.Element(ns + "FchVto")?.Value ?? "",
                FechaComprobante = DateTime.ParseExact(result.Element(ns + "CbteFch")!.Value, "yyyyMMdd", null),
                Resultado = "A"
            };
        }
    }
}
