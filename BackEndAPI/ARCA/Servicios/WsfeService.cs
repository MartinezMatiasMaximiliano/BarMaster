using BackEndAPI.ARCA.Clases;
using BackEndAPI.Data;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Reflection.Metadata.Ecma335;
using System.Security.Cryptography.X509Certificates;
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
        private readonly WsaaAuthService _wasaaAuthService;
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;
        public WsfeService(HttpClient httpClient, IOptions<ArcaOptions> arcaOptions, ICurrentDbContext currentDbContext, WsaaAuthService wasaaAuthService)
        {
            _httpClient = httpClient;
            _arcaOptions = arcaOptions.Value;
            _currentDbContext = currentDbContext;
            _wasaaAuthService = wasaaAuthService;
            db = _currentDbContext.Db;
        }

        private async Task<bool> GuardarFactura(FECAERequest invoice, FECAEResponse response, int PuntoVenta, int TipoComprobante, string requestXml, string responseXml)
        {
            try
            {
                var factura = new FacturaElectronica
                {
                    Id = Guid.NewGuid(),
                    PuntoVenta = PuntoVenta,
                    TipoComprobante = TipoComprobante,
                    NumeroComprobante = invoice.CbteDesde,
                    CAE = response.CAE,
                    CAEFechaEmision = DateTime.UtcNow,
                    CAEFechaVencimiento = DateTime.ParseExact(response.CAEExpiration, "yyyyMMdd", null),
                    Total = invoice.ImpTotal,
                    JsonSolicitud = System.Text.Json.JsonSerializer.Serialize(invoice),
                    XmlRespuesta = responseXml
                };
                await db.FacturasElectronicas.AddAsync(factura);
                await db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al guardar la factura: {ex.Message}");
                return false;
            }
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


            var CAEResponse = new FECAEResponse
            {
                Result = result,
                CAE = cae,
                CAEExpiration = caeVto
            };
            await GuardarFactura(invoice, CAEResponse, ptoVta, cbteTipo, soapXml, responseXml);
            return CAEResponse;
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

        public async Task<List<FacturaElectronica>> GetFacturasAsync()
        {
            return await db.FacturasElectronicas.ToListAsync();
        }

        //ESTA FUNCION ES EL PUNTO DE INICIO DE LAS FACTURAS ELECTRONICAS, SE DEBE LLAMAR DESDE EL CONTROLADOR
        public async Task<int> CrearFacturaElectronica(FEAuthRequest auth, DatosParaFactura DatosFactura)
        {
            try
            {
                //1. Cargar el certificado
                //TODO: cambiar la ruta de los certificados y la contraseñas por busquedas en S3
                X509Certificate2 certLoad = CertificateLoader.Load(System.IO.File.ReadAllBytes("C:/Users/Matias/Desktop/certificado.pfx"), "123456");

                //2. Autenticar y obtener el token                
                FEAuthResponse response = await _wasaaAuthService.AutenticarFacturacionElectronica(certLoad);

                //3. Obtener el último comprobante para el punto de venta y tipo de comprobante
                //TODO: buscar que es el punto de venta y una lista de tipos de comprobantes
                int last = await GetLastVoucherAsync(auth, DatosFactura.PuntoDeVenta, DatosFactura.TipoDeComprobante);

                ////TODO: buscar los valores posibles para cada campo
                FECAERequest comprobante = new FECAERequest
                {
                    Concepto = DatosFactura.concepto,
                    DocTipo = DatosFactura.TipoDocumentoCliente,
                    DocNro = DatosFactura.NumeroDocumentoCliente,
                    CondicionIVAReceptorId = DatosFactura.CondicionIVAReceptor,
                    CbteDesde = last + 1,
                    CbteHasta = last + 1,
                    CbteFch = DateTime.Today,
                    ImpTotal = 100, //importe total = ImpTotal = ImpNeto + ImpIVA + ImpTrib + ImpOpEx + ImpTotConc
                    ImpTotConc = 0, //Importe no gravado. conceptos que no integran la base imponible del IVA. Generalmente 0
                    ImpNeto = 100, //Importe neto gravado. Es el subtotal sujeto a IVA. el total antes de impuestos
                    ImpOpEx = 0, //Importe exento. Es el subtotal de operaciones exentas de IVA. Generalmente 0
                    ImpIVA = 0, //Importe del IVA. Es el subtotal de operaciones sujetas a IVA. !!ES UN PORCENTAJE!!
                    ImpTrib = 0 //Otros tributos.
                };


                //5. Solicitar el CAE para el nuevo comprobante
                FECAEResponse caeResponse = await RequestCAEAsync(auth, DatosFactura.PuntoDeVenta, DatosFactura.TipoDeComprobante, comprobante);

                //6. Verificar la respuesta
                FECompConsultarResponse confirm = await FECompConsultarAsync(auth, new FECompConsultarRequest
                {
                    PuntoVenta = DatosFactura.PuntoDeVenta,
                    TipoComprobante = DatosFactura.TipoDeComprobante,
                    NumeroComprobante = comprobante.CbteDesde
                });
                //7. Imprimir el resultado

                //8. Manejar errores

                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return 0;
            }
        }
    }
}