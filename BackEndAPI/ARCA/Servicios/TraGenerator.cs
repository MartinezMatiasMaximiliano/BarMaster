using System.Xml.Linq;

public class TraGenerator
{
    public string Generate(string service)
    {
        var uniqueId = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        Console.WriteLine(DateTime.Now);
        Console.WriteLine(DateTime.UtcNow);
        Console.WriteLine(DateTimeOffset.UtcNow);
        Console.WriteLine(TimeZoneInfo.Local.DisplayName);

        var generationTime = DateTime.UtcNow.AddHours(-3);
        var expirationTime = DateTime.UtcNow.AddHours(9);
        var xml = new XDocument(
            new XElement("loginTicketRequest",
                new XAttribute("version", "1.0"),

                new XElement("header",
                    new XElement("uniqueId",uniqueId),
                    new XElement("generationTime", generationTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss")),
                    new XElement("expirationTime",expirationTime.ToString("yyyy-MM-ddTHH:mm:ss"))),
                new XElement("service", service)
            )
        );

        return xml.ToString(SaveOptions.DisableFormatting);
    }
}