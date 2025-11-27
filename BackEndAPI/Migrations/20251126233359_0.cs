using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _0 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Auditorias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tabla = table.Column<string>(type: "text", nullable: false),
                    PK = table.Column<string>(type: "text", nullable: false),
                    Anterior = table.Column<string>(type: "text", nullable: false),
                    Posterior = table.Column<string>(type: "text", nullable: false),
                    Accion = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auditorias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstadoReservas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadoReservas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: true),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Precio = table.Column<decimal>(type: "numeric", nullable: false),
                    Costo = table.Column<decimal>(type: "numeric", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    PathImagen = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TipoEnvios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Precio = table.Column<double>(type: "double precision", nullable: false),
                    Vehiculo = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoEnvios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TipoPagos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoPagos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TipoSubscriptions",
                columns: table => new
                {
                    Id = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Precio = table.Column<decimal>(type: "numeric", nullable: false),
                    Features = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categorias_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Opciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    PrecioExtra = table.Column<decimal>(type: "numeric", nullable: false),
                    IdProducto = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Opciones_Productos_IdProducto",
                        column: x => x.IdProducto,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cajas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaApertura = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaCierre = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MontoApertura = table.Column<decimal>(type: "numeric", nullable: false),
                    MontoCierre = table.Column<decimal>(type: "numeric", nullable: false),
                    Total = table.Column<decimal>(type: "numeric", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cajas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Deliveries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NombreCliente = table.Column<string>(type: "text", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    Indicaciones = table.Column<string>(type: "text", nullable: true),
                    Telefono = table.Column<string>(type: "text", nullable: false),
                    PrecioTotal = table.Column<double>(type: "double precision", nullable: false),
                    IdCaja = table.Column<Guid>(type: "uuid", nullable: false),
                    IdPago = table.Column<Guid>(type: "uuid", nullable: false),
                    IdPersonaRegistro = table.Column<Guid>(type: "uuid", nullable: false),
                    IdCadete = table.Column<Guid>(type: "uuid", nullable: false),
                    IdTipoEnvio = table.Column<int>(type: "integer", nullable: false),
                    Entregado = table.Column<bool>(type: "boolean", nullable: false),
                    PersonaRegistroId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deliveries_Cajas_IdCaja",
                        column: x => x.IdCaja,
                        principalTable: "Cajas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Deliveries_TipoEnvios_IdTipoEnvio",
                        column: x => x.IdTipoEnvio,
                        principalTable: "TipoEnvios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Telefonos = table.Column<string[]>(type: "text[]", nullable: true),
                    Emails = table.Column<string[]>(type: "text[]", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaInscripcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "bytea", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "bytea", nullable: false),
                    IdTipoSubscripcion = table.Column<short>(type: "smallint", nullable: false),
                    IdPropietario = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Empresas_TipoSubscriptions_IdTipoSubscripcion",
                        column: x => x.IdTipoSubscripcion,
                        principalTable: "TipoSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MenuProducto",
                columns: table => new
                {
                    MenusId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductosId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuProducto", x => new { x.MenusId, x.ProductosId });
                    table.ForeignKey(
                        name: "FK_MenuProducto_Productos_ProductosId",
                        column: x => x.ProductosId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Menus",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Menus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Mesas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    CodigoParaPedir = table.Column<string>(type: "text", nullable: true),
                    Capacidad = table.Column<int>(type: "integer", nullable: false),
                    x = table.Column<float>(type: "real", nullable: false),
                    y = table.Column<float>(type: "real", nullable: false),
                    w = table.Column<float>(type: "real", nullable: false),
                    h = table.Column<float>(type: "real", nullable: false),
                    IdPlano = table.Column<Guid>(type: "uuid", nullable: true),
                    PersonaId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mesas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IdVisita = table.Column<Guid>(type: "uuid", nullable: false),
                    IdTipoPago = table.Column<int>(type: "integer", nullable: false),
                    VisitaId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pagos_TipoPagos_IdTipoPago",
                        column: x => x.IdTipoPago,
                        principalTable: "TipoPagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Personas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombres = table.Column<string>(type: "text", nullable: false),
                    Apellido = table.Column<string>(type: "text", nullable: false),
                    Dni = table.Column<string>(type: "text", nullable: true),
                    Direccion = table.Column<string>(type: "text", nullable: true),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    CodigoDeServicio = table.Column<string>(type: "text", nullable: true),
                    PasswordHash = table.Column<byte[]>(type: "bytea", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "bytea", nullable: false),
                    IdRol = table.Column<int>(type: "integer", nullable: false),
                    IdEmpresa = table.Column<Guid>(type: "uuid", nullable: false),
                    SucursalId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Personas_Empresas_IdEmpresa",
                        column: x => x.IdEmpresa,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Personas_Roles_IdRol",
                        column: x => x.IdRol,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Sucursales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "bytea", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "bytea", nullable: false),
                    IdEncargado = table.Column<Guid>(type: "uuid", nullable: true),
                    IdEmpresa = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sucursales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sucursales_Empresas_IdEmpresa",
                        column: x => x.IdEmpresa,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Sucursales_Personas_IdEncargado",
                        column: x => x.IdEncargado,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Visitas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Total = table.Column<decimal>(type: "numeric", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false),
                    IdMesa = table.Column<Guid>(type: "uuid", nullable: false),
                    IdCaja = table.Column<Guid>(type: "uuid", nullable: false),
                    IdMozo = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visitas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Visitas_Cajas_IdCaja",
                        column: x => x.IdCaja,
                        principalTable: "Cajas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Visitas_Mesas_IdMesa",
                        column: x => x.IdMesa,
                        principalTable: "Mesas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Visitas_Personas_IdMozo",
                        column: x => x.IdMozo,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Planos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "text", nullable: false),
                    detalles = table.Column<string>(type: "text", nullable: true),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Planos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Planos_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reservas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NombreReserva = table.Column<string>(type: "text", nullable: false),
                    CantidadDePersonas = table.Column<int>(type: "integer", nullable: true),
                    EstadoId = table.Column<int>(type: "integer", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reservas_EstadoReservas_EstadoId",
                        column: x => x.EstadoId,
                        principalTable: "EstadoReservas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reservas_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductosPorVisita",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NombreProducto = table.Column<string>(type: "text", nullable: false),
                    Detalles = table.Column<string>(type: "text", nullable: true),
                    PrecioDelMomento = table.Column<double>(type: "double precision", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    PrecioTotal = table.Column<double>(type: "double precision", nullable: false),
                    IdVisita = table.Column<Guid>(type: "uuid", nullable: false),
                    IdProducto = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductosPorVisita", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductosPorVisita_Productos_IdProducto",
                        column: x => x.IdProducto,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductosPorVisita_Visitas_IdVisita",
                        column: x => x.IdVisita,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "EstadoReservas",
                columns: new[] { "Id", "Nombre" },
                values: new object[,]
                {
                    { 1, "Pendiente" },
                    { 2, "Confirmada" },
                    { 3, "Cancelada" },
                    { 4, "Completada" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Nombre" },
                values: new object[,]
                {
                    { 1, "Admin" },
                    { 2, "Empleado" }
                });

            migrationBuilder.InsertData(
                table: "TipoPagos",
                columns: new[] { "Id", "Nombre" },
                values: new object[,]
                {
                    { 1, "Efectivo" },
                    { 2, "Tarjeta de Crédito" },
                    { 3, "Tarjeta de Débito" },
                    { 4, "Transferencia Bancaria" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cajas_IdSucursal",
                table: "Cajas",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_ProductoId",
                table: "Categorias",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IdCadete",
                table: "Deliveries",
                column: "IdCadete");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IdCaja",
                table: "Deliveries",
                column: "IdCaja");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IdPago",
                table: "Deliveries",
                column: "IdPago",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IdTipoEnvio",
                table: "Deliveries",
                column: "IdTipoEnvio");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_PersonaRegistroId",
                table: "Deliveries",
                column: "PersonaRegistroId");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_IdPropietario",
                table: "Empresas",
                column: "IdPropietario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_IdTipoSubscripcion",
                table: "Empresas",
                column: "IdTipoSubscripcion");

            migrationBuilder.CreateIndex(
                name: "IX_MenuProducto_ProductosId",
                table: "MenuProducto",
                column: "ProductosId");

            migrationBuilder.CreateIndex(
                name: "IX_Menus_IdSucursal",
                table: "Menus",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_IdPlano",
                table: "Mesas",
                column: "IdPlano");

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_PersonaId",
                table: "Mesas",
                column: "PersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_Opciones_IdProducto",
                table: "Opciones",
                column: "IdProducto");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdTipoPago",
                table: "Pagos",
                column: "IdTipoPago");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_VisitaId",
                table: "Pagos",
                column: "VisitaId");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_IdEmpresa",
                table: "Personas",
                column: "IdEmpresa");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_IdRol",
                table: "Personas",
                column: "IdRol");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_SucursalId",
                table: "Personas",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_Planos_IdSucursal",
                table: "Planos",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosPorVisita_IdProducto",
                table: "ProductosPorVisita",
                column: "IdProducto");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosPorVisita_IdVisita",
                table: "ProductosPorVisita",
                column: "IdVisita");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_EstadoId",
                table: "Reservas",
                column: "EstadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_IdSucursal",
                table: "Reservas",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_Sucursales_IdEmpresa",
                table: "Sucursales",
                column: "IdEmpresa");

            migrationBuilder.CreateIndex(
                name: "IX_Sucursales_IdEncargado",
                table: "Sucursales",
                column: "IdEncargado");

            migrationBuilder.CreateIndex(
                name: "IX_Visitas_IdCaja",
                table: "Visitas",
                column: "IdCaja");

            migrationBuilder.CreateIndex(
                name: "IX_Visitas_IdMesa",
                table: "Visitas",
                column: "IdMesa");

            migrationBuilder.CreateIndex(
                name: "IX_Visitas_IdMozo",
                table: "Visitas",
                column: "IdMozo");

            migrationBuilder.AddForeignKey(
                name: "FK_Cajas_Sucursales_IdSucursal",
                table: "Cajas",
                column: "IdSucursal",
                principalTable: "Sucursales",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Deliveries_Pagos_IdPago",
                table: "Deliveries",
                column: "IdPago",
                principalTable: "Pagos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Deliveries_Personas_IdCadete",
                table: "Deliveries",
                column: "IdCadete",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Deliveries_Personas_PersonaRegistroId",
                table: "Deliveries",
                column: "PersonaRegistroId",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Empresas_Personas_IdPropietario",
                table: "Empresas",
                column: "IdPropietario",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MenuProducto_Menus_MenusId",
                table: "MenuProducto",
                column: "MenusId",
                principalTable: "Menus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Menus_Sucursales_IdSucursal",
                table: "Menus",
                column: "IdSucursal",
                principalTable: "Sucursales",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Personas_PersonaId",
                table: "Mesas",
                column: "PersonaId",
                principalTable: "Personas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Planos_IdPlano",
                table: "Mesas",
                column: "IdPlano",
                principalTable: "Planos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_Visitas_VisitaId",
                table: "Pagos",
                column: "VisitaId",
                principalTable: "Visitas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Personas_Sucursales_SucursalId",
                table: "Personas",
                column: "SucursalId",
                principalTable: "Sucursales",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personas_Sucursales_SucursalId",
                table: "Personas");

            migrationBuilder.DropForeignKey(
                name: "FK_Empresas_Personas_IdPropietario",
                table: "Empresas");

            migrationBuilder.DropTable(
                name: "Auditorias");

            migrationBuilder.DropTable(
                name: "Categorias");

            migrationBuilder.DropTable(
                name: "Deliveries");

            migrationBuilder.DropTable(
                name: "MenuProducto");

            migrationBuilder.DropTable(
                name: "Opciones");

            migrationBuilder.DropTable(
                name: "ProductosPorVisita");

            migrationBuilder.DropTable(
                name: "Reservas");

            migrationBuilder.DropTable(
                name: "Pagos");

            migrationBuilder.DropTable(
                name: "TipoEnvios");

            migrationBuilder.DropTable(
                name: "Menus");

            migrationBuilder.DropTable(
                name: "Productos");

            migrationBuilder.DropTable(
                name: "EstadoReservas");

            migrationBuilder.DropTable(
                name: "TipoPagos");

            migrationBuilder.DropTable(
                name: "Visitas");

            migrationBuilder.DropTable(
                name: "Cajas");

            migrationBuilder.DropTable(
                name: "Mesas");

            migrationBuilder.DropTable(
                name: "Planos");

            migrationBuilder.DropTable(
                name: "Sucursales");

            migrationBuilder.DropTable(
                name: "Personas");

            migrationBuilder.DropTable(
                name: "Empresas");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "TipoSubscriptions");
        }
    }
}
