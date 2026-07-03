using System.Xml.Linq;

public class TraGenerator
{
    public string Generate()
    {
        var uniqueId = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var generationTime = DateTime.UtcNow.AddHours(-3);
        var expirationTime = DateTime.UtcNow.AddHours(9);

        var xml = new XDocument(
            new XElement("loginTicketRequest",
                new XAttribute("version", "1.0"),

                new XElement("header",
                    new XElement("uniqueId",uniqueId),
                    new XElement("generationTime", generationTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss")),
                    new XElement("expirationTime",expirationTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss"))),
                new XElement("service", "wsfe") // El servicio para el cual se solicita el token, en este caso "wsfe" para Web Service de Facturación Electrónica.
            )
        );
        return xml.ToString(SaveOptions.DisableFormatting);
    }
}