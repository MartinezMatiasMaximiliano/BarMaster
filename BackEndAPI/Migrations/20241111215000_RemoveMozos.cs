using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMozos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CategoriaProducto_categorias_CategoriasId",
                table: "CategoriaProducto");

            migrationBuilder.DropForeignKey(
                name: "FK_CategoriaProducto_productos_ProductosId",
                table: "CategoriaProducto");

            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Mozos_MozoId",
                table: "Mesas");

            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_productos_ProductoId",
                table: "Pedidos");

            migrationBuilder.DropTable(
                name: "Mozos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_productos",
                table: "productos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_categorias",
                table: "categorias");

            migrationBuilder.RenameTable(
                name: "productos",
                newName: "Productos");

            migrationBuilder.RenameTable(
                name: "categorias",
                newName: "Categorias");

            migrationBuilder.RenameColumn(
                name: "MozoId",
                table: "Mesas",
                newName: "PersonaId");

            migrationBuilder.RenameIndex(
                name: "IX_Mesas_MozoId",
                table: "Mesas",
                newName: "IX_Mesas_PersonaId");

            migrationBuilder.AddColumn<string>(
                name: "CodigoDeServicio",
                table: "Personas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Dni",
                table: "Personas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "RolId",
                table: "Personas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Productos",
                table: "Productos",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categorias",
                table: "Categorias",
                column: "Id");

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

            migrationBuilder.CreateIndex(
                name: "IX_Personas_RolId",
                table: "Personas",
                column: "RolId");

            migrationBuilder.AddForeignKey(
                name: "FK_CategoriaProducto_Categorias_CategoriasId",
                table: "CategoriaProducto",
                column: "CategoriasId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CategoriaProducto_Productos_ProductosId",
                table: "CategoriaProducto",
                column: "ProductosId",
                principalTable: "Productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Personas_PersonaId",
                table: "Mesas",
                column: "PersonaId",
                principalTable: "Personas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Productos_ProductoId",
                table: "Pedidos",
                column: "ProductoId",
                principalTable: "Productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Personas_Roles_RolId",
                table: "Personas",
                column: "RolId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CategoriaProducto_Categorias_CategoriasId",
                table: "CategoriaProducto");

            migrationBuilder.DropForeignKey(
                name: "FK_CategoriaProducto_Productos_ProductosId",
                table: "CategoriaProducto");

            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Personas_PersonaId",
                table: "Mesas");

            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Productos_ProductoId",
                table: "Pedidos");

            migrationBuilder.DropForeignKey(
                name: "FK_Personas_Roles_RolId",
                table: "Personas");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Productos",
                table: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Personas_RolId",
                table: "Personas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categorias",
                table: "Categorias");

            migrationBuilder.DropColumn(
                name: "CodigoDeServicio",
                table: "Personas");

            migrationBuilder.DropColumn(
                name: "Dni",
                table: "Personas");

            migrationBuilder.DropColumn(
                name: "RolId",
                table: "Personas");

            migrationBuilder.RenameTable(
                name: "Productos",
                newName: "productos");

            migrationBuilder.RenameTable(
                name: "Categorias",
                newName: "categorias");

            migrationBuilder.RenameColumn(
                name: "PersonaId",
                table: "Mesas",
                newName: "MozoId");

            migrationBuilder.RenameIndex(
                name: "IX_Mesas_PersonaId",
                table: "Mesas",
                newName: "IX_Mesas_MozoId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_productos",
                table: "productos",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_categorias",
                table: "categorias",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Mozos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PersonaId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    CodigoDeServicio = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mozos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mozos_Personas_PersonaId",
                        column: x => x.PersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mozos_PersonaId",
                table: "Mozos",
                column: "PersonaId");

            migrationBuilder.AddForeignKey(
                name: "FK_CategoriaProducto_categorias_CategoriasId",
                table: "CategoriaProducto",
                column: "CategoriasId",
                principalTable: "categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CategoriaProducto_productos_ProductosId",
                table: "CategoriaProducto",
                column: "ProductosId",
                principalTable: "productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Mozos_MozoId",
                table: "Mesas",
                column: "MozoId",
                principalTable: "Mozos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_productos_ProductoId",
                table: "Pedidos",
                column: "ProductoId",
                principalTable: "productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
