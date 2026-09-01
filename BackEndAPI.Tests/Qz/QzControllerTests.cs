using BackEndAPI.Controllers;
using BackEndAPI.Models.Printing;
using BackEndAPI.Printing.Qz;
using BackEndAPI.Printing.Stations;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Tests.Qz;

public sealed class QzControllerTests
{
    private static readonly Guid StationId = Guid.Parse("309af557-644f-4e6e-918e-5fa68f6e6722");

    [Fact]
    public void Certificate_ReturnsOnlyPemAsPlainText()
    {
        const string pem = "-----BEGIN CERTIFICATE-----\nAQID\n-----END CERTIFICATE-----\n";
        var controller = CreateController(new FakeSigningService(pem), canUse: true);

        var result = Assert.IsType<ContentResult>(controller.Certificate());

        Assert.Equal(StatusCodes.Status200OK, result.StatusCode ?? StatusCodes.Status200OK);
        Assert.Equal("text/plain; charset=utf-8", result.ContentType);
        Assert.Equal(pem, result.Content);
    }

    [Fact]
    public async Task Sign_RejectsDifferentHeaderAndBodyStation()
    {
        var controller = CreateController(new FakeSigningService("pem"), canUse: true);
        controller.Request.Headers["X-Printing-Station-ID"] = Guid.NewGuid().ToString();

        var result = await controller.Sign(new QzSignRequest(new string('a', 64), StationId), default);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Sign_RejectsUnauthorizedStation()
    {
        var controller = CreateController(new FakeSigningService("pem"), canUse: false);
        controller.Request.Headers["X-Printing-Station-ID"] = StationId.ToString();

        var result = Assert.IsType<ObjectResult>(await controller.Sign(new QzSignRequest(new string('a', 64), StationId), default));

        Assert.Equal(StatusCodes.Status403Forbidden, result.StatusCode);
    }

    [Fact]
    public async Task Sign_ReturnsBase64AsPlainText()
    {
        var controller = CreateController(new FakeSigningService("pem", "signed-value"), canUse: true);
        controller.Request.Headers["X-Printing-Station-ID"] = StationId.ToString();

        var result = Assert.IsType<ContentResult>(await controller.Sign(new QzSignRequest(new string('a', 64), StationId), default));

        Assert.Equal("text/plain; charset=utf-8", result.ContentType);
        Assert.Equal("signed-value", result.Content);
    }

    private static QzController CreateController(IQzSigningService signing, bool canUse)
    {
        var controller = new QzController(
            signing,
            new FakeStationService(canUse),
            Options.Create(new QzSigningOptions()),
            new FakeEnvironment());
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        return controller;
    }

    private sealed class FakeSigningService(string pem, string signature = "signature") : IQzSigningService
    {
        public QzSigningState State { get; } = new(true, true, false, null, null, null, null, null);
        public string GetPublicCertificatePem() => pem;
        public string SignDigest(string digest) => signature;
    }

    private sealed class FakeStationService(bool canUse) : IPrintingStationService
    {
        public Task<bool> CanUseAsync(Guid stationId, CancellationToken cancellationToken) => Task.FromResult(canUse);
        public Task<PrintingStationResponse> RegisterAsync(RegisterPrintingStationRequest request, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<PrintingStationResponse?> GetCurrentAsync(Guid clientInstallationId, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<PrintingStationResponse> HeartbeatAsync(Guid stationId, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<IReadOnlyList<PrinterAssignmentResponse>> GetAssignmentsAsync(Guid stationId, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<PrinterAssignmentResponse> UpsertAssignmentAsync(Guid stationId, PrinterRole role, UpdatePrinterAssignmentRequest request, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<PrintingStationResponse> SetEnabledAsync(Guid stationId, bool enabled, CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private sealed class FakeEnvironment : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Production";
        public string ApplicationName { get; set; } = "BackEndAPI.Tests";
        public string WebRootPath { get; set; } = string.Empty;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
