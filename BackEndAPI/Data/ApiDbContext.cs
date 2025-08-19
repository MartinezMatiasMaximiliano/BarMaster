using BackEndAPI.Controllers;
using BackEndAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.General;

namespace BackEndAPI.Data
{
    public class ApiDbContext: DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }
        

        public DbSet<Producto> Productos { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Persona> Personas { get; set; }
        public DbSet<Mesa> Mesas {  get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<Item> Items { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Mesa>().HasIndex(u => u.NumeroMesa).IsUnique();
            modelBuilder.Entity<Persona>().HasIndex(persona => persona.Dni).IsUnique();
            modelBuilder.Entity<Mesa>().HasOne(mesa => mesa.Persona).WithMany(persona => persona.Mesas).OnDelete(DeleteBehavior.SetNull);

            base.OnModelCreating(modelBuilder);

        }
    }
}
