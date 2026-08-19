using Amazon.S3;
using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.Data;
using BackEndAPI.Hubs;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
using BackEndAPI.Services.Amazon;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
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
builder.Services.AddScoped<IVisitasRepository, VisitasRepository>();
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<IPagosRepository, PagosRepository>();
builder.Services.AddScoped<IPagosServices, PagosServices>();
builder.Services.AddScoped<IVisitasRepository, VisitasRepository>();
builder.Services.AddScoped<IVisitasServices, VisitasServices>();    
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
builder.Services.AddScoped<IRolesRepository, RolesRepository>();
builder.Services.AddScoped<IRolesServices, RolesServices>();
builder.Services.AddScoped<ICuentasCorrientesRepository, CuentasCorrientesRepository>();
builder.Services.AddScoped<ICuentasCorrientesServices, CuentasCorrientesServices>();
builder.Services.AddScoped<S3Service>();
//builder.Services.AddAWSService<IAmazonS3>();

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
    });

#endregion

var app = builder.Build();

#region CARPETAS
var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
DirectoryInfo infoUploads = Directory.CreateDirectory(uploads);
#endregion

#region MIDDLEWARES

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploads),
    RequestPath = "/uploads",
});

app.UseRouting();
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<TenantDbMiddleware>();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
#endregion

#region ENDPOINTS
app.MapControllers();
app.MapHub<NotificacionesHub>("/NotificacionesHub");
#endregion

app.Run();
