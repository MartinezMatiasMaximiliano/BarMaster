using BackEndAPI.Models.Impresion;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Data.Configuraciones;

public static class ConfiguracionImpresionDistribuida
{
    public static void ConfigurarImpresionDistribuida(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ComandoPedidoVisita>(entity =>
        {
            entity.ToTable("ComandosPedidoVisita");
            entity.HasKey(x => x.IdComando);
            entity.HasIndex(x => x.IdVisita);
            entity.HasOne(x => x.Visita).WithMany().HasForeignKey(x => x.IdVisita).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EstacionImpresion>(entity =>
        {
            entity.Property(x => x.HashCredencial).HasMaxLength(64);
            entity.Property(x => x.UltimaVersionAgente).HasMaxLength(32);
            entity.Property(x => x.UltimaVersionQz).HasMaxLength(32);
        });

        modelBuilder.Entity<Impresora>(entity =>
        {
            entity.ToTable("Impresoras", table => table.HasCheckConstraint(
                "CK_Impresoras_AnchoPapelMm", "\"AnchoPapelMm\" IN (58, 80)"));
            entity.Property(x => x.NombreSistema).HasMaxLength(260).IsRequired();
            entity.Property(x => x.NombreSistemaNormalizado).HasMaxLength(260).IsRequired();
            entity.Property(x => x.NombreVisible).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Formato).HasConversion<string>().HasMaxLength(16);
            entity.Property(x => x.Codificacion).HasMaxLength(32).IsRequired();
            entity.Property(x => x.UltimoEstado).HasMaxLength(64);
            entity.HasIndex(x => new { x.IdEstacion, x.NombreSistemaNormalizado }).IsUnique();
            entity.HasIndex(x => x.IdEstacion);
            entity.HasOne(x => x.Estacion).WithMany(x => x.Impresoras)
                .HasForeignKey(x => x.IdEstacion).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ReglaImpresion>(entity =>
        {
            entity.ToTable("ReglasImpresion");
            entity.Property(x => x.TipoSalida).HasConversion<string>().HasMaxLength(24);
            entity.Property(x => x.Momento).HasConversion<string>().HasMaxLength(32);
            entity.HasIndex(x => x.IdSucursal);
            entity.HasIndex(x => x.IdImpresora);
            entity.HasIndex(x => new { x.IdSucursal, x.IdImpresora, x.TipoSalida, x.Momento }).IsUnique();
            entity.HasOne(x => x.Sucursal).WithMany(x => x.ReglasImpresion)
                .HasForeignKey(x => x.IdSucursal).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Impresora).WithMany(x => x.Reglas)
                .HasForeignKey(x => x.IdImpresora).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TrabajoImpresion>(entity =>
        {
            // Compare-and-swap: every tracked update must still own the state and lease it read.
            entity.Property(x => x.Estado).IsConcurrencyToken();
            entity.Property(x => x.IdEstacion).IsConcurrencyToken();
            entity.Property(x => x.IdReserva).IsConcurrencyToken();
            entity.Property(x => x.ReservaVenceEn).IsConcurrencyToken();
            entity.Property(x => x.VenceEn).IsConcurrencyToken();
            entity.Property(x => x.TipoDocumento).HasConversion<string>().HasMaxLength(32);
            entity.Property(x => x.Formato).HasConversion<string>().HasMaxLength(16);
            entity.Property(x => x.Estado).HasConversion<string>().HasMaxLength(24);
            entity.Property(x => x.ContenidoJson).HasColumnType("jsonb").IsRequired();
            entity.Property(x => x.NombreSistemaImpresora).HasMaxLength(260).IsRequired();
            entity.Property(x => x.NombreVisibleImpresora).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Codificacion).HasMaxLength(32).IsRequired();
            entity.Property(x => x.ClaveIdempotencia).HasMaxLength(220).IsRequired();
            entity.Property(x => x.TipoEntidadOrigen).HasMaxLength(64).IsRequired();
            entity.Property(x => x.IdEntidadOrigen).HasMaxLength(120).IsRequired();
            entity.Property(x => x.UltimoCodigoError).HasMaxLength(80);
            entity.Property(x => x.UltimoDetalleError).HasMaxLength(1000);
            entity.HasIndex(x => new { x.IdSucursal, x.ClaveIdempotencia }).IsUnique();
            entity.HasIndex(x => new { x.IdSucursal, x.IdSolicitud });
            entity.HasIndex(x => x.IdEstacion);
            entity.HasIndex(x => x.IdRegla);
            entity.HasIndex(x => x.IdTrabajoReimpreso);
            entity.HasIndex(x => new { x.IdEstacion, x.Estado, x.DisponibleEn, x.CreadoEn })
                .HasFilter("\"Estado\" IN ('Pendiente', 'ReintentoProgramado')");
            entity.HasIndex(x => new { x.Estado, x.ReservaVenceEn })
                .HasFilter("\"Estado\" IN ('Reservado', 'Enviando')");
            entity.ToTable("TrabajosImpresion", table =>
            {
                table.HasCheckConstraint("CK_TrabajosImpresion_Copias", "\"Copias\" BETWEEN 1 AND 10");
                table.HasCheckConstraint("CK_TrabajosImpresion_AnchoPapelMm", "\"AnchoPapelMm\" IN (58, 80)");
                table.HasCheckConstraint("CK_TrabajosImpresion_Versiones", "\"VersionEsquema\" > 0 AND \"VersionPlantilla\" > 0");
                table.HasCheckConstraint("CK_TrabajosImpresion_CantidadIntentos", "\"CantidadIntentos\" >= 0");
                table.HasCheckConstraint("CK_TrabajosImpresion_Vencimiento", "\"VenceEn\" > \"CreadoEn\"");
            });
            entity.HasOne(x => x.Sucursal).WithMany(x => x.TrabajosImpresion)
                .HasForeignKey(x => x.IdSucursal).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Estacion).WithMany(x => x.TrabajosImpresion)
                .HasForeignKey(x => x.IdEstacion).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Regla).WithMany(x => x.Trabajos)
                .HasForeignKey(x => x.IdRegla).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(x => x.TrabajoReimpreso).WithMany()
                .HasForeignKey(x => x.IdTrabajoReimpreso).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
