using Amazon.Extensions.NETCore.Setup;
using Amazon.S3;
using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.Data;
using BackEndAPI.Hubs;
using BackEndAPI.Impresion;
using BackEndAPI.Impresion.Identidad;
using BackEndAPI.Impresion.Qz;
using BackEndAPI.Impresion.Estaciones;
using BackEndAPI.Impresion.Seguridad;
using BackEndAPI.Impresion.Dispositivos;
using BackEndAPI.Impresion.Reglas;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Impresion.Notificaciones;
using BackEndAPI.Impresion.Documentos;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
using BackEndAPI.Services.Amazon;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;
using Serilog;
using Serilog.Exceptions;
using System.Text;
using System.Threading.RateLimiting;
using BackEndAPI.Middlewares;

#region LOGGING (bootstrap)
// Logger mínimo para poder loguear errores que ocurran durante el arranque
// (antes de que builder.Configuration esté disponible para configurar el logger definitivo).
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Iniciando BackEndAPI...");
#endregion

var builder = WebApplication.CreateBuilder(args);

#region LOGGING (definitivo)
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithExceptionDetails()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}{Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/backendapi-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 31,
        outputTemplate:
            "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {SourceContext}{NewLine}{Message:lj} {Properties:j}{NewLine}{Exception}"));
#endregion

#region CONTROLLERS Y SWAGGER

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "Enter your API key",
        Name = "X-Tenant-ID",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            new string[] {}
        }
    });
});
#endregion

#region CORS
var corsAllowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
    options.AddPolicy("BarMaster", policy =>
    {
        if (allowedOrigins.Length == 0 && builder.Environment.IsDevelopment())
            policy.WithOrigins("http://localhost:3006", "https://localhost:3006");
        else
            policy.WithOrigins(allowedOrigins);

        policy.AllowAnyMethod().AllowAnyHeader();
    });
});
#endregion

#region RATE LIMITING
// - "auth": límite estricto para /Login y /LoginPersona (5 intentos por minuto por IP).
// - Límite global: backstop general para el resto de la API (100 requests por minuto por IP).
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("auth", limiterOptions =>
    {
        limiterOptions.PermitLimit = 5;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
    });

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "sin-ip",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});
#endregion

#region SERVICIOS

builder.Services.AddHttpClient<WsfeService>();
builder.Services.AddHttpClient<WsaaAuthService>();
builder.Services.Configure<ArcaOptions>(builder.Configuration.GetSection("Arca"));
builder.Services.AddScoped<TraGenerator>();
builder.Services.AddScoped<CmsSignerService>();
builder.Services.AddScoped<AppDbContextFactory>();
builder.Services.AddScoped<JWTServices>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<ITenantServices, TenantServices>();
builder.Services.AddScoped<ICurrentTenant, CurrentTenant>();
builder.Services.AddScoped<IVisitasRepository, VisitasRepository>();
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<IPagosRepository, PagosRepository>();
builder.Services.AddScoped<IPagosServices, PagosServices>();
builder.Services.AddScoped<IVisitasRepository, VisitasRepository>();
builder.Services.AddScoped<IVisitasServices, VisitasServices>();    
builder.Services.AddScoped<BackEndAPI.Services.Pedidos.IServicioIdempotenciaComandos, BackEndAPI.Services.Pedidos.ServicioIdempotenciaComandos>();
builder.Services.AddScoped<BackEndAPI.Services.Pedidos.IConsultaProductosLote, BackEndAPI.Services.Pedidos.ConsultaProductosLote>();
builder.Services.AddScoped<BackEndAPI.Services.Pedidos.IPublicadorNotificacionesPedido, BackEndAPI.Services.Pedidos.PublicadorNotificacionesPedido>();
builder.Services.AddScoped<BackEndAPI.Services.Pedidos.IManejadorAgregarProductos, BackEndAPI.Services.Pedidos.ManejadorAgregarProductos>();
builder.Services.AddScoped<IDeliveryTakeawayRepository, DeliveryTakeawayRepository>();
builder.Services.AddScoped<IDeliveryTakeawayServices, DeliveryTakeawayServices>();
builder.Services.AddScoped<IMenuServices, MenuServices>();
builder.Services.AddScoped<ICajasRepository, CajasRepository>();    
builder.Services.AddScoped<ICajasServices, CajasServices>();
builder.Services.AddScoped<IMovimientosCajaRepository, MovimientosCajaRepository>();
builder.Services.AddScoped<IMovimientosCajaServices, MovimientosCajaServices>();
builder.Services.AddScoped<ITipoMovimientosCajaRepository, TipoMovimientosCajaRepository>();
builder.Services.AddScoped<ITipoMovimientosCajaServices, TipoMovimientosCajaServices>();
builder.Services.AddScoped<ITipoEnviosRepository, TipoEnviosRepository>();
builder.Services.AddScoped<ITipoEnviosServices, TipoEnviosServices>();
builder.Services.AddScoped<ICurrentDbContext, CurrentDbContext>();
builder.Services.AddScoped<IDatabaseTransactionManager, DatabaseTransactionManager>();
builder.Services.AddScoped<IProductosRepository, ProductosRepository>();
builder.Services.AddScoped<IProductosServices, ProductosServices>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IStockServices, StockServices>();
builder.Services.AddScoped<ICategoriasServices, CategoriasServices>();
builder.Services.AddScoped<ICategoriasRepository, CategoriasRepository>();
builder.Services.AddScoped<IPersonasRepository, PersonasRepository>();
builder.Services.AddScoped<IMesasRepository, MesasRepository>();
builder.Services.AddScoped<IMesasServices, MesasServices>();
builder.Services.AddScoped<IPersonasServices, PersonasServices>();  
builder.Services.AddScoped<IPlanosRepository, PlanosRepository>();
builder.Services.AddScoped<IPlanosServices, PlanosServices>();
builder.Services.AddScoped<IEmpresasRepository, EmpresasRepository>();
builder.Services.AddScoped<IEmpresasServices, EmpresasServices>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthServices, AuthServices>();
builder.Services.AddScoped<ISucursalRepository, SucursalRepository>();
builder.Services.AddScoped<ISucursalesServices, SucursalesServices>();
builder.Services.AddScoped<IReservasRepository, ReservasRepository>();
builder.Services.AddScoped<IReservasServices, ReservasServices>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<BackEndAPI.Services.Horario.IServicioHorario, BackEndAPI.Services.Horario.ServicioHorarioBuenosAires>();
builder.Services.AddScoped<IRolesRepository, RolesRepository>();
builder.Services.AddScoped<IRolesServices, RolesServices>();
builder.Services.AddScoped<ICuentasCorrientesRepository, CuentasCorrientesRepository>();
builder.Services.AddScoped<ICuentasCorrientesServices, CuentasCorrientesServices>();
builder.Services.AddScoped<S3Service>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IIdentidadSolicitudImpresion, IdentidadSolicitudImpresion>();
builder.Services.AddScoped<IServicioEstacionImpresion, ServicioEstacionImpresion>();
builder.Services.AddScoped<IServicioCredencialEstacion, ServicioCredencialEstacion>();
builder.Services.AddScoped<IServicioImpresora, ServicioImpresora>();
builder.Services.AddScoped<IServicioReglaImpresion, ServicioReglaImpresion>();
builder.Services.AddScoped<IServicioTrabajoImpresion, ServicioTrabajoImpresion>();
builder.Services.AddScoped<IServicioDocumentoImpresion, ServicioDocumentoImpresion>();
builder.Services.AddScoped<INotificadorImpresion, NotificadorHubImpresion>();
builder.Services.AddHostedService<ServicioMantenimientoImpresion>();
builder.Services.AddOptions<OpcionesImpresionDistribuida>()
    .Bind(builder.Configuration.GetSection(OpcionesImpresionDistribuida.NombreSeccion))
    .ValidateDataAnnotations()
    .Validate(options => options.SegundosHastaFueraDeLinea > options.SegundosLatido,
        "SegundosHastaFueraDeLinea debe ser mayor que SegundosLatido.")
    .ValidateOnStart();
builder.Services.AddSingleton<IValidateOptions<OpcionesFirmaQz>, ValidadorOpcionesFirmaQz>();
builder.Services.AddOptions<OpcionesFirmaQz>()
    .Bind(builder.Configuration.GetSection(OpcionesFirmaQz.NombreSeccion))
    .ValidateOnStart();
builder.Services.AddSingleton<IServicioFirmaQz, ServicioFirmaQz>();
builder.Services.AddAWSService<IAmazonS3>();

builder.Services.AddDbContext<MasterDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Master")));



QuestPDF.Settings.License = LicenseType.Community;
builder.Services.AddSignalR();


#endregion

#region JWT
var signingKey = builder.Configuration["JWT:SigningKey"]
    ?? throw new InvalidOperationException("JWT SigningKey not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidAudience = builder.Configuration["JWT:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrWhiteSpace(accessToken)
                    && context.HttpContext.Request.Path.StartsWithSegments("/hubs/impresion"))
                    context.Token = accessToken;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Impresion.Usar", policy => policy.RequireAssertion(context =>
        context.User.HasClaim("TipoAuth", "sucursal")
        && context.User.HasClaim(claim => claim.Type == "TenantId" && !string.IsNullOrWhiteSpace(claim.Value))
        && context.User.HasClaim(claim => claim.Type == "IdSucursal" && Guid.TryParse(claim.Value, out _))));

    options.AddPolicy("Impresion.Configurar", policy => policy.RequireAssertion(context =>
        AutorizacionImpresion.PuedeConfigurar(context.User)));

    options.AddPolicy("Impresion.Diagnosticos", policy => policy.RequireAssertion(context =>
        context.User.Identity?.IsAuthenticated == true
        && context.User.HasClaim(claim => claim.Type == "TenantId" && !string.IsNullOrWhiteSpace(claim.Value))
        && context.User.HasClaim(claim => claim.Type == "IdSucursal" && Guid.TryParse(claim.Value, out _))));

    options.AddPolicy("Impresion.Estacion", policy => policy.RequireAssertion(context =>
        context.User.HasClaim("TipoAuth", "estacion_impresion")
        && context.User.HasClaim(claim => claim.Type == "TenantId" && !string.IsNullOrWhiteSpace(claim.Value))
        && context.User.HasClaim(claim => claim.Type == "IdSucursal" && Guid.TryParse(claim.Value, out _))
        && context.User.HasClaim(claim => claim.Type == "EstacionImpresionId" && Guid.TryParse(claim.Value, out _))));

    options.AddPolicy("Impresion.Firmar", policy => policy.RequireAssertion(context =>
        context.User.HasClaim(claim => claim.Type == "TenantId" && !string.IsNullOrWhiteSpace(claim.Value))
        && context.User.HasClaim(claim => claim.Type == "IdSucursal" && Guid.TryParse(claim.Value, out _))
        && ((context.User.HasClaim("TipoAuth", "estacion_impresion")
                && context.User.HasClaim(claim => claim.Type == "EstacionImpresionId" && Guid.TryParse(claim.Value, out _)))
            || context.User.HasClaim("TipoAuth", "sucursal"))));

    options.AddPolicy("Impresion.OperarEstacion", policy => policy.RequireAssertion(context =>
        (context.User.HasClaim("TipoAuth", "estacion_impresion")
            || context.User.HasClaim("TipoAuth", "sucursal"))
        && context.User.HasClaim(claim => claim.Type == "TenantId" && !string.IsNullOrWhiteSpace(claim.Value))
        && context.User.HasClaim(claim => claim.Type == "IdSucursal" && Guid.TryParse(claim.Value, out _))));
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            error = new { codigo = "LIMITE_SOLICITUDES", mensaje = "Se realizaron demasiadas solicitudes. Espere un momento." }
        }, cancellationToken);
    };
    options.AddPolicy("FirmaQz", httpContext =>
    {
        var user = httpContext.User;
        var key = string.Join('|',
            user.FindFirst("TenantId")?.Value ?? "anonymous",
            user.FindFirst("IdSucursal")?.Value ?? "none",
            httpContext.Request.Headers["X-Estacion-Impresion-ID"].ToString(),
            user.FindFirst("jti")?.Value ?? "none",
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");

        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 120,
            QueueLimit = 0,
            Window = TimeSpan.FromMinutes(1)
        });
    });
    options.AddPolicy("SesionEstacionImpresion", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            $"{httpContext.Request.Headers["X-Tenant-ID"]}|{httpContext.Connection.RemoteIpAddress}",
            _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

#endregion

var app = builder.Build();

#region CARPETAS
var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
DirectoryInfo infoUploads = Directory.CreateDirectory(uploads);
#endregion

#region MIDDLEWARES

// Loguea un resumen de cada request (método, path, status, duración) enriquecido con
// tenant y usuario (ver TenantDbMiddleware y RequestUserContextMiddleware más abajo).
app.UseSerilogRequestLogging();

// Red de seguridad: cualquier excepción no capturada por los controllers (o lanzada antes
// de llegar a uno, ej. al resolver el tenant) se loguea acá con el contexto completo y
// se devuelve como un error 500 consistente en vez de la página de error por defecto.
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploads),
    RequestPath = "/uploads",
});

app.UseRouting();
app.UseCors("BarMaster");
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseRateLimiter();
app.UseMiddleware<MiddlewareExcepcionesImpresion>();
app.UseMiddleware<TenantDbMiddleware>();
app.UseAuthorization();
app.UseMiddleware<TenantDbMiddleware>();
app.UseMiddleware<RequestUserContextMiddleware>();
#endregion

#region ENDPOINTS
app.MapControllers();
app.MapHub<NotificacionesHub>("/NotificacionesHub");
app.MapHub<HubImpresion>("/hubs/impresion");
#endregion

app.Run();

#region LOGGING (cierre)
}
catch (Exception ex) when (ex is not HostAbortedException) 
{
    Log.Fatal(ex, "BackEndAPI terminó inesperadamente durante el arranque");
}
finally
{
    Log.CloseAndFlush();
}
#endregion
