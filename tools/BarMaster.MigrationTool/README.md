# Migraciones de bases por empresa

La herramienta está dentro de `tools` porque es una utilidad operativa y no forma parte del servidor web. Por defecto realiza un diagnóstico: consulta y registra las migraciones pendientes, pero no modifica bases de datos.

## 1. Diagnóstico seguro

```powershell
$env:BARMASTER_MASTER_CONNECTION='Host=...;Database=...;Username=...;Password=...'
dotnet run --project .\tools\BarMaster.MigrationTool --configuration Release
```

Para limitar el diagnóstico a una empresa:

```powershell
dotnet run --project .\tools\BarMaster.MigrationTool --configuration Release -- --tenant "Nombre exacto"
```

## 2. Aplicación con backup obligatorio

`--apply` exige la ubicación de `pg_dump.exe` y un directorio de backups. Antes de migrar cada empresa, crea un dump en formato custom y lo valida ejecutando `pg_restore.exe --list`. Si el backup falla o no puede validarse, esa base no se migra.

```powershell
dotnet run --project .\tools\BarMaster.MigrationTool --configuration Release -- `
  --apply `
  --pg-dump "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" `
  --backup-directory "D:\Backups\BarMaster"
```

Se puede combinar con `--tenant "Nombre exacto"`. El parámetro opcional `--log "ruta\registro.jsonl"` permite elegir dónde guardar el registro; de lo contrario queda en el directorio de backups al aplicar o en el directorio actual durante el diagnóstico.

La herramienta nunca escribe cadenas de conexión ni contraseñas en la salida o el registro. Conservá los dumps fuera del repositorio y probá la restauración en un entorno aislado antes del despliegue productivo.
