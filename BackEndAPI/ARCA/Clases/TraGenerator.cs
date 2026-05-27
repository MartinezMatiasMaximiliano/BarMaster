using System.Xml.Linq;

public class TraGenerator
{
    public string Generate(string service)
    {
        var uniqueId = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        var generationTime = DateTime.UtcNow.AddMinutes(-10);
        var expirationTime = DateTime.UtcNow.AddHours(12);

        var xml = new XDocument(
            new XElement("loginTicketRequest",
                new XAttribute("version", "1.0"),
                    new XElement("header",
                    new XElement("uniqueId", uniqueId),
                    new XElement("generationTime", generationTime.ToString("s")),
                    new XElement("expirationTime", expirationTime.ToString("s"))
                ),

                new XElement("service", service)
            )
        );

        return xml.ToString();
    }
}