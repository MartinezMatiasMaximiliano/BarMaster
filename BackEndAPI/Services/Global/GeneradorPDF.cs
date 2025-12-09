using QuestPDF.Companion;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;
using BackEndAPI.Models;
using Microsoft.IdentityModel.Logging;
using System.Numerics;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.AspNetCore.Authentication;
using Microsoft.CodeAnalysis.CSharp;


namespace BackEndAPI.Services
{

    public static class GeneradorPDF
    {
        public static byte[] GenerarPDF(int IdPedido, int numeroMesa,List<Item> listaItems)
        {
            var listaReducida = listaItems.GroupBy(i => new { i.Nombre,i.Precio, i.Indicaciones }).Select(grupo => new {
                Nombre = grupo.Key.Nombre,
                Precio = grupo.Key.Precio,
                Indicaciones = grupo.Key.Indicaciones,
                Cantidad = grupo.Count(),
                Total = grupo.Key.Precio * grupo.Count()
            }).ToList();


           return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(30);
                    page.Size(PageSizes.A4);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));



                    page.Content()
                        .PaddingVertical(10)
                        .Column(column =>
                        {
                            column.Spacing(12);

                            column.Item().Row(row =>
                            {
                                row.RelativeItem().AlignCenter().Column(col =>
                                {
                                    col.Item().AlignRight().AlignCenter()
                                    .Width(100)
                                    .Height(100)
                                    .Image("./wwwroot/logo.webp");
                                });

                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().AlignRight().Text("Ticket").Bold();
                                    col.Item().AlignRight().Text("Barmaster");
                                    col.Item().AlignRight().Text("Direccion");
                                    col.Item().AlignRight().Text("Mesa n°: " + numeroMesa.ToString());
                                    col.Item().AlignRight().Text("Pedido n°: " + IdPedido.ToString());
                                    col.Item().AlignRight().Text("Consumidor final");
                                    col.Item().AlignRight().Text("123-456-7890");
                                    col.Item().AlignRight().Text(DateTime.Now.ToString());
                                });

                            });

                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(25);
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("#");
                                    header.Cell().Element(CellStyle).Text("Producto");
                                    header.Cell().Element(CellStyle).Text("Indicaciones");
                                    header.Cell().Element(CellStyle).AlignRight().AlignBottom().Text("Precio");
                                    header.Cell().Element(CellStyle).AlignRight().AlignBottom().Text("Unidades");
                                    header.Cell().Element(CellStyle).AlignRight().AlignBottom().Text("Total");

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                                    }
                                });

                                foreach (var item in listaReducida)
                                {

                                    table.Cell().Element(CellStyle).Text((listaReducida.IndexOf(item) + 1).ToString());
                                    table.Cell().Element(CellStyle).Text(item.Nombre);
                                    table.Cell().Element(CellStyle).Text(item.Indicaciones);
                                    table.Cell().Element(CellStyle).AlignRight().Text($"$ {item.Precio}");
                                    table.Cell().Element(CellStyle).AlignRight().Text(item.Cantidad.ToString());
                                    table.Cell().Element(CellStyle).AlignRight().Text($"$ {item.Total}");

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                                    }
                                }
                            });
                            column.Item().Row(row => row.RelativeItem().Column(col => col.Item().AlignRight().Text($"Precio Final: $ {listaReducida.Sum(item => item.Total)}")));
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x => x.Span("Gracias por su visita!").Italic());
                });

            }).GeneratePdf();
        }

        public static byte[] GenerarTicket(int IdPedido,int NumeroMesa, List<Item> listaItems)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Tickets");
            Directory.CreateDirectory(filePath);
            var pdfBytes = GenerarPDF(IdPedido,NumeroMesa,listaItems);
            System.IO.File.WriteAllBytes(filePath + $"/Ticket_Mesa{NumeroMesa}_{DateTime.Now.ToString("ddMMyyhhmmss")}.pdf", pdfBytes);
            return pdfBytes;
        }
    }
}
