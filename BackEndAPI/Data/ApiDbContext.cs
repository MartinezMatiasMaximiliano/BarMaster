using BackEndAPI.Controllers;
using BackEndAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.General;
using System.Xml;

namespace BackEndAPI.Data
{
    public class ApiDbContext : DbContext
    {

        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }
        //public DbSet<TipoSubscription> TipoSubscriptions => Set<TipoSubscription>();

        public DbSet<Empresa> Empresas => Set<Empresa>();
        public DbSet<Sucursal> Sucursales => Set<Sucursal>();
        public DbSet<Mesa> Mesas => Set<Mesa>();
        public DbSet<Caja> Cajas => Set<Caja>();
        public DbSet<Persona> Personas => Set<Persona>();
        public DbSet<Reserva> Reservas => Set<Reserva>();
        public DbSet<Visita> Visitas => Set<Visita>();
        public DbSet<Menu> Menus => Set<Menu>();
        public DbSet<Producto> Productos => Set<Producto>();
        public DbSet<Categoria> Categorias => Set<Categoria>();
        public DbSet<Opcion> Opciones => Set<Opcion>();
        public DbSet<ProductosPorVisita> ProductosPorVisita => Set<ProductosPorVisita>();
        public DbSet<Rol> Roles => Set<Rol>();
        public DbSet<EstadoReserva> EstadoReservas => Set<EstadoReserva>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<Empresa>()
            //    .HasOne(e => e.TipoSubscription)
            //    .WithMany(t => t.Empresas)
            //    .HasForeignKey(e => e.IdTipoSubscription);

            modelBuilder.Entity<Persona>()
            .HasOne(s => s.Empresa)
            .WithMany(e => e.Personas)
            .HasForeignKey(s => s.IdEmpresa);

            modelBuilder.Entity<Sucursal>()
                .HasOne(s => s.Empresa)
                .WithMany(e => e.Sucursales)
                .HasForeignKey(s => s.IdEmpresa);

            modelBuilder.Entity<Mesa>()
                .HasOne(m => m.Sucursal)
                .WithMany(s => s.Mesas)
                .HasForeignKey(m => m.IdSucursal);

            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Mesa)
                .WithMany(m => m.Reservas)
                .HasForeignKey(r => r.IdMesa);

            modelBuilder.Entity<Visita>()
                .HasOne(v => v.Mesa)
                .WithMany(m => m.Visitas)
                .HasForeignKey(v => v.IdMesa);

            modelBuilder.Entity<Visita>()
                .HasOne(v => v.Caja)
                .WithMany(c => c.Visitas)
                .HasForeignKey(v => v.IdCaja);

            modelBuilder.Entity<Caja>()
                .HasOne(c => c.Sucursal)
                .WithMany(s => s.Cajas)
                .HasForeignKey(c => c.IdSucursal);

            modelBuilder.Entity<Menu>()
                .HasOne(m => m.Sucursal)
                .WithMany(s => s.Menus)
                .HasForeignKey(m => m.IdSucursal);


            modelBuilder.Entity<Opcion>()
                .HasOne(o => o.Producto)
                .WithMany(p => p.Opciones)
                .HasForeignKey(o => o.IdProducto);

            modelBuilder.Entity<ProductosPorVisita>()
                .HasOne(pv => pv.Visita)
                .WithMany(v => v.ProductosPorVisita)
                .HasForeignKey(pv => pv.IdVisita);

            base.OnModelCreating(modelBuilder);

        }
    }
}
