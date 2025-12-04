using BackEndAPI.Controllers;
using BackEndAPI.Models;
using BackEndAPI.Tenancy.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.General;
using System;
using System.Security.AccessControl;
using System.Text.Json;
using System.Xml;

namespace BackEndAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<TipoSubscripcion> TipoSubscriptions => Set<TipoSubscripcion>();
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
        public DbSet<Pago> Pagos => Set<Pago>();
        public DbSet<TipoPago> TipoPagos => Set<TipoPago>();
        public DbSet<Auditorias> Auditorias => Set<Auditorias>();
        public DbSet<Plano> Planos => Set<Plano>();
        public DbSet<Delivery> Deliveries => Set<Delivery>();
        public DbSet<TipoEnvio> TipoEnvios => Set<TipoEnvio>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<TipoPago>().HasData(
        new TipoPago { Id = 1, Nombre = "Efectivo" },
        new TipoPago { Id = 2, Nombre = "Tarjeta de Crédito" },
        new TipoPago { Id = 3, Nombre = "Tarjeta de Débito" },
        new TipoPago { Id = 4, Nombre = "Transferencia Bancaria" }
    );

            modelBuilder.Entity<Rol>().HasData(
                    new Rol { Id = 1, Nombre = "Admin" },
                    new Rol { Id = 2, Nombre = "Empleado" }
                );

            modelBuilder.Entity<EstadoReserva>().HasData(
                    new EstadoReserva { Id = 1, Nombre = "Pendiente" },
                    new EstadoReserva { Id = 2, Nombre = "Confirmada" },
                    new EstadoReserva { Id = 3, Nombre = "Cancelada" },
                    new EstadoReserva { Id = 4, Nombre = "Completada" }
                );

            modelBuilder.Entity<Empresa>()
                .HasOne(e => e.TipoSubscripcion)
                .WithMany()
                .HasForeignKey(e => e.IdTipoSubscripcion);

            ////// Relacion Empresa 1:1 Persona (Propietario)
            ////modelBuilder.Entity<Empresa>()
            ////    .HasOne(e => e.Propietario)
            ////    .WithOne()
            ////    .HasForeignKey<Empresa>(e => e.IdPropietario)
            ////    .OnDelete(DeleteBehavior.Restrict); // Evita el borrado de un propietario si tiene una empresa asociada

            // Relacion Empresa 1:N Persona (Empleados)
            modelBuilder.Entity<Empresa>()
                .HasMany(e => e.Personas)
                .WithOne(p => p.Empresa)
                .HasForeignKey(p => p.IdEmpresa)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra una empresa, se borran sus empleados


            // Relacion Sucursal N:1 Empresa
            modelBuilder.Entity<Sucursal>()
                .HasOne(s => s.Empresa)
                .WithMany(e => e.Sucursales)
                .HasForeignKey(s => s.IdEmpresa)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra una empresa, se borran sus sucursales

            // Relacion Sucursal 1:N Reserva
            modelBuilder.Entity<Sucursal>()
                .HasMany(s => s.Reservas)
                .WithOne(r => r.Sucursal)
                .HasForeignKey(r => r.IdSucursal)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra una sucursal, se borran sus reservas

            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Estado)
                .WithMany()
                .HasForeignKey(r => r.IdEstadoReserva)
                .OnDelete(DeleteBehavior.SetNull);

            // Relacion Sucursal 1:N PlanosMesas
            modelBuilder.Entity<Sucursal>()
                .HasMany(s => s.Planos)
                .WithOne(r => r.Sucursal)
                .HasForeignKey(r => r.IdSucursal)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra una sucursal, se borran sus planos de mesas

            // Relacion Persona N:1 Rol
            modelBuilder.Entity<Persona>()
                .HasOne(p => p.Rol)
                .WithMany()
                .HasForeignKey(p => p.IdRol)
                .OnDelete(DeleteBehavior.Restrict); // Evita el borrado de un rol si tiene personas asociadas

            // Relacion Visita N:1 Caja
            modelBuilder.Entity<Visita>()
                .HasOne(v => v.Caja)
                .WithMany(c => c.Visitas)
                .HasForeignKey(v => v.IdCaja)
                .OnDelete(DeleteBehavior.SetNull); // si se borra una caja, se pone a null en la visita

            // Relacion Caja N:1 Sucursal
            modelBuilder.Entity<Caja>()
                .HasOne(c => c.Sucursal)
                .WithMany(s => s.Cajas)
                .HasForeignKey(c => c.IdSucursal)
                .OnDelete(DeleteBehavior.SetNull); // Si se borra una sucursal se pone a null en la caja

            modelBuilder.Entity<Plano>()
                .HasMany(p => p.Mesas)
                .WithOne(m => m.Plano)
                .HasForeignKey(pm => pm.IdPlano)
                .OnDelete(DeleteBehavior.SetNull); // Si se borra un plano, se pone a null en las mesas 

            // Relacion Menu N:1 Sucursal
            modelBuilder.Entity<Menu>()
                .HasOne(m => m.Sucursal)
                .WithMany(s => s.Menus)
                .HasForeignKey(m => m.IdSucursal)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra una sucursal, se borran sus menus


            // Relacion Opciones N:1 Producto
            modelBuilder.Entity<Opcion>()
                .HasOne(o => o.Producto)
                .WithMany(p => p.Opciones)
                .HasForeignKey(o => o.IdProducto)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra un producto, se borran sus opciones

            // Relacion ProductosPorVisita N:1 Producto
            modelBuilder.Entity<ProductosPorVisita>()
                .HasOne(pv => pv.Producto)
                .WithMany()
                .HasForeignKey(pv => pv.IdProducto)
                .OnDelete(DeleteBehavior.SetNull); // Si se borra un producto, se pone a null en productos por visita

            modelBuilder.Entity<ProductosPorVisita>()
               .HasOne(pv => pv.Visita)
               .WithMany()
               .HasForeignKey(pv => pv.IdVisita)
               .OnDelete(DeleteBehavior.SetNull); 


            // Relacion TipoPago 1:N Pagos
            modelBuilder.Entity<Pago>()
                .HasOne(p => p.TipoPago)
                .WithMany()
                .HasForeignKey(p => p.IdTipoPago)
                .OnDelete(DeleteBehavior.Restrict); // Evita el borrado de un tipo de pago si tiene pagos asociados

            
            modelBuilder.Entity<Pago>()
                .HasOne(p => p.Visita)
                .WithMany(v => v.Pagos)
                .HasForeignKey(p => p.IdVisita)
                .OnDelete(DeleteBehavior.SetNull);

            // Relacion Visita N:1 Mozo (Persona)
            modelBuilder.Entity<Visita>()
                .HasOne(v => v.Mozo)
                .WithMany()
                .HasForeignKey(v => v.IdMozo)
                .OnDelete(DeleteBehavior.SetNull); // Si se borra un mozo, se pone a null en la visita

            modelBuilder.Entity<Visita>()
                .HasOne(v => v.Mesa)
                .WithMany()
                .HasForeignKey(v => v.IdMesa)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Visita>()
                .HasMany(v => v.Productos)
                .WithOne(pv => pv.Visita)
                .HasForeignKey(v => v.IdVisita)
                .OnDelete(DeleteBehavior.SetNull);

            ////modelBuilder.Entity<Delivery>()
            ////.HasOne(d => d.Cadete)
            ////.WithMany()
            ////.HasForeignKey(d => d.IdCadete)
            ////.OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Delivery>()
                .HasOne(d => d.TipoEnvio)
                .WithMany()
                .HasForeignKey(d => d.IdTipoEnvio)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Delivery>()
                .HasOne(d => d.Sucursal)
                .WithMany(s => s.Deliveries)
                .HasForeignKey(d => d.IdSucursal)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Delivery>()
                .HasOne(d => d.Visita)
                .WithMany()
                .HasForeignKey(d => d.IdVisita)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Producto>()
                .HasMany(p => p.Categorias)
                .WithMany(c => c.Productos);              

            base.OnModelCreating(modelBuilder);

        }

        // Sobrescribimos SaveChangesAsync para capturar los cambios y crear registros de auditoría
        //public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        //{
        //    // Capturamos los cambios ANTES de guardar
        //    var auditEntries = OnBeforeSaveChanges();
        //    // Guardamos las entidades modificadas
        //    var result = base.SaveChangesAsync(cancellationToken);
        //    // Insertamos los registros de auditoría
        //    if (auditEntries.Any())
        //    {
        //        Auditorias.AddRange(auditEntries);
        //        base.SaveChangesAsync(cancellationToken); // segundo save solo para auditoría
        //    }
        //    return result;
        //}

        //public override int SaveChanges()
        //{
        //    // Capturamos los cambios ANTES de guardar
        //    var auditEntries = OnBeforeSaveChanges();

        //    // Guardamos las entidades modificadas
        //    var result = base.SaveChanges();

        //    // Insertamos los registros de auditoría
        //    if (auditEntries.Any())
        //    {
        //        Auditorias.AddRange(auditEntries);
        //        base.SaveChanges(); // segundo save solo para auditoría
        //    }

        //    return result;
        //}

        //private List<Auditorias> OnBeforeSaveChanges()
        //{
        //    ChangeTracker.DetectChanges();
        //    var auditEntries = new List<Auditorias>();

        //    foreach (var entry in ChangeTracker.Entries())
        //    {
        //        if (entry.Entity is Auditorias || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
        //            continue;

        //        var audit = new Auditorias
        //        {
        //            Tabla = entry.Metadata.GetTableName(),
        //            Accion = entry.State.ToString(),
        //            Timestamp = DateTime.UtcNow,
        //            PK = JsonSerializer.Serialize(entry.Properties
        //                .Where(p => p.Metadata.IsPrimaryKey())
        //                .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue)),
        //            Anterior = entry.State == EntityState.Modified || entry.State == EntityState.Deleted
        //                ? JsonSerializer.Serialize(entry.Properties.ToDictionary(p => p.Metadata.Name, p => entry.OriginalValues[p.Metadata.Name]))
        //                : null,
        //            Posterior = entry.State == EntityState.Added || entry.State == EntityState.Modified
        //                ? JsonSerializer.Serialize(entry.Properties.ToDictionary(p => p.Metadata.Name, p => entry.CurrentValues[p.Metadata.Name]))
        //                : null
        //        };

        //        auditEntries.Add(audit);
        //    }

        //    return auditEntries;
        //}
    }
    public class AppDbContextFactoriy : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            // Dummy connection for EF migration generation ONLY.
            optionsBuilder.UseNpgsql(
                "Host=localhost; Database=test; Username=postgres; Password=123456"
            );

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}

