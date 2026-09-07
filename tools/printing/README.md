# Preparación de una computadora de impresión

1. Instalá el driver oficial y confirmá una página de prueba desde Windows.
2. Instalá QZ Tray 2.2.6 y el certificado/allowlist según `Instalar-qztray.md` de la rama correspondiente.
3. Ejecutá PowerShell como el mismo usuario que operará BarMaster:

   ```powershell
   .\tools\printing\Install-BarMasterPrintingStation.ps1 -BarMasterUrl "https://URL-DE-BARMASTER/"
   .\tools\printing\Test-BarMasterPrintingStation.ps1
   ```

4. Desactivá la suspensión automática del equipo, abrí BarMaster y entrá en **Configuración > Impresoras**.
5. Nombrá el equipo, buscá las impresoras y probá cada una.
6. Desde **Configuración > Destinos de impresión**, asigná cuentas y comandas y ejecutá la prueba remota.

El navegador debe permanecer abierto en esta primera versión. El worker funciona desde cualquier pantalla y se recupera mediante SignalR y consulta periódica.
