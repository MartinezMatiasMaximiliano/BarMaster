using BackEndAPI.ARCA.Clases;
using BackEndAPI.Data;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
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
        private readonly WsaaAuthService _wasaaAuthService;
        private readonly ICurrentDbContext _currentDbContext;
        private readonly ILogger<WsfeService> _logger;
        private readonly AppDbContext db;
        public WsfeService(HttpClient httpClient, IOptions<ArcaOptions> arcaOptions, ICurrentDbContext currentDbContext, WsaaAuthService wasaaAuthService, ILogger<WsfeService> logger)
        {
            _httpClient = httpClient;
            _arcaOptions = arcaOptions.Value;
            _currentDbContext = currentDbContext;
            _wasaaAuthService = wasaaAuthService;
            _logger = logger;
            db = _currentDbContext.Db;
        }
        public async Task<FacturaElectronica> CrearFacturaElectronica(DatosParaFactura datosCliente, MontosComprobante montos)
        {
            if (datosCliente.PuntoDeVenta <= 0) throw new BusinessRuleException("El punto de venta es obligatorio");
            if (datosCliente.TipoDeComprobante <= 0) throw new BusinessRuleException("El tipo de comprobante es obligatorio");
            if (datosCliente.TipoDocumentoCliente <= 0) throw new BusinessRuleException("El tipo de documento del cliente es obligatorio");
            if (datosCliente.CondicionIVAReceptor <= 0) throw new BusinessRuleException("La condición de IVA del receptor es obligatoria");
            if (datosCliente.concepto is < 1 or > 3) throw new BusinessRuleException("El concepto debe ser 1 (productos), 2 (servicios) o 3 (productos y servicios)");

            var empresa = await db.Empresas.FirstOrDefaultAsync()
                ?? throw new NotFoundException("No se encontró la empresa para facturar");

            var tokenValido = await _wasaaAuthService.AutenticarFacturacionElectronica(empresa);

            var auth = new FEAuthRequest
            {
                Token = tokenValido.Token,
                Sign = tokenValido.Sign,
                Cuit = empresa.Cuit,
            };

            var last = await GetLastVoucherAsync(auth, datosCliente.PuntoDeVenta, datosCliente.TipoDeComprobante);

            var comprobante = new FECAERequest
            {
                Concepto = datosCliente.concepto,
                DocTipo = datosCliente.TipoDocumentoCliente,
                DocNro = datosCliente.NumeroDocumentoCliente,
                CondicionIVAReceptorId = datosCliente.CondicionIVAReceptor,
                CbteDesde = last + 1,
                CbteHasta = last + 1,
                CbteFch = DateTime.Today,
                ImpTotal = montos.ImpTotal,
                ImpTotConc = montos.ImpTotConc,
                ImpNeto = montos.ImpNeto,
                ImpOpEx = montos.ImpOpEx,
                ImpIVA = montos.ImpIVA,
                ImpTrib = montos.ImpTrib,
                Iva = montos.DetalleIva
            };

            return await RequestCAEAsync(auth, datosCliente.PuntoDeVenta, datosCliente.TipoDeComprobante, comprobante);
        }


        public async Task<List<FacturaElectronica>> GetFacturasAsync()
        {
            return await db.FacturasElectronicas.ToListAsync();
        }

        public async Task<FacturaElectronica> RequestCAEAsync(FEAuthRequest auth, int ptoVta, int cbteTipo, FECAERequest invoice)
        {
            var soapXml = BuildCAERequestSoap(auth, ptoVta, cbteTipo, invoice);

            var content = new StringContent(soapXml, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", $"\"{WsfeSoapActions.FECAESolicitar}\"");
            var response = await _httpClient.PostAsync(_arcaOptions.WsfeUrl, content);

            var responseXml = await response.Content.ReadAsStringAsync();

            var doc = XDocument.Parse(responseXml);
            XNamespace ns = "http://ar.gov.afip.dif.FEV1/";

            var result = doc.Descendants(ns + "Resultado").FirstOrDefault()?.Value;

            if (result != "A")
            {
                // "R" (rechazado) o "P" (parcial) — no hay CAE válido. AFIP manda el motivo en
                // <Errors>/<Err> (rechazo de la solicitud entera) u <Observaciones>/<Obs>
                // (rechazo puntual del comprobante). Sin esto, antes se guardaba una "factura"
                // sin CAE real y nadie se enteraba.
                var motivos = doc.Descendants(ns + "Err").Concat(doc.Descendants(ns + "Obs"))
                    .Select(e => $"{e.Element(ns + "Code")?.Value}: {e.Element(ns + "Msg")?.Value}")
                    .ToList();
                var detalle = motivos.Count > 0 ? string.Join(" | ", motivos) : "AFIP no informó el motivo.";
                _logger.LogError("AFIP rechazó la solicitud de CAE (Resultado={Resultado}). {Detalle}. Respuesta cruda: {RespuestaAfip}", result, detalle, responseXml);
                throw new BusinessRuleException($"AFIP rechazó la factura: {detalle}");
            }

            var cae = doc.Descendants(ns + "CAE").First().Value;
            var caeVto = doc.Descendants(ns + "CAEFchVto").First().Value;

            var CAEResponse = new FECAEResponse
            {
                Result = result,
                CAE = cae,
                CAEExpiration = caeVto
            };

            return await GuardarFactura(invoice, CAEResponse, ptoVta, cbteTipo, soapXml, responseXml);
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




        private async Task<FacturaElectronica> GuardarFactura(FECAERequest invoice, FECAEResponse response, int PuntoVenta, int TipoComprobante, string requestXml, string responseXml)
        {
            var factura = new FacturaElectronica
            {
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
            return factura;
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
                                <ImpTotal>{invoice.ImpTotal.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</ImpTotal>
                                <ImpTotConc>{invoice.ImpTotConc.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</ImpTotConc>
                                <ImpNeto>{invoice.ImpNeto.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</ImpNeto>
                                <ImpOpEx>{invoice.ImpOpEx.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</ImpOpEx>
                                <ImpTrib>{invoice.ImpTrib.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</ImpTrib>
                                <ImpIVA>{invoice.ImpIVA.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</ImpIVA>
                                <MonId>{invoice.MonId}</MonId>
                                <MonCotiz>{invoice.MonCotiz}</MonCotiz>
                                {BuildIvaXml(invoice.Iva)}
                            </FECAEDetRequest>
                            </FeDetReq>
                        </FeCAEReq>
                        </FECAESolicitar>
                    </soap:Body>
                </soap:Envelope>
                """;
        }

        private static string BuildIvaXml(List<DetalleIva> detalle)
        {
            if (detalle == null || detalle.Count == 0) return string.Empty;

            var culture = System.Globalization.CultureInfo.InvariantCulture;
            var alicuotas = string.Concat(detalle.Select(d => $"""
                <AlicIva>
                    <Id>{d.AlicuotaId}</Id>
                    <BaseImp>{d.BaseImponible.ToString("F2", culture)}</BaseImp>
                    <Importe>{d.Importe.ToString("F2", culture)}</Importe>
                </AlicIva>
                """));

            return $"<Iva>{alicuotas}</Iva>";
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
    }
}