namespace BackEndAPI.Models.Printing;

public sealed class PrinterAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StationId { get; set; }
    public PrinterRole Role { get; set; }
    public string QzPrinterName { get; set; } = string.Empty;
    public PrintFormat Format { get; set; } = PrintFormat.Raw;
    public short PaperWidthMm { get; set; } = 80;
    public short Copies { get; set; } = 1;
    public bool Enabled { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public PrintingStation Station { get; set; } = null!;
}
