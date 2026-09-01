using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace BackEndAPI.Tests.Printing;

public sealed class TenantDbMiddlewareTests
{
    [Fact]
    public async Task AuthenticatedRequestWithDifferentTenantIsRejectedBeforeDatabaseResolution()
    {
        var nextCalled = false;
        var middleware = new TenantDbMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(
            [new Claim("TenantId", "tenant-a")],
            authenticationType: "test"));
        context.Request.Headers["X-Tenant-ID"] = "tenant-b";
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context, null!);

        Assert.False(nextCalled);
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
        context.Response.Body.Position = 0;
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
        Assert.Contains("TENANT_MISMATCH", body);
    }
}
