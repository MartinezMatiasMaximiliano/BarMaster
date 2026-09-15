param([switch]$VerifyOnly)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Import-Module (Join-Path $PSScriptRoot 'QzWindows.Common.psm1') -Force

try {
    $manifest = Get-QzManifest
    $root = Assert-QzRootArtifact -Manifest $manifest
    $architecture = Get-QzArchitecture
    if ($VerifyOnly) {
        Write-Output "Paquete verificado: QZ $($manifest.version), $architecture, raiz $($manifest.rootCertificateSha256)"
        exit 0
    }

    $installed = Get-QzInstalledVersion
    if ($null -eq $installed -or [version]$installed -lt [version]$manifest.version) {
        & (Join-Path $PSScriptRoot 'Install-BarMasterQz.ps1')
    }

    # La operación oficial preinstall cierra QZ antes de cambiar su configuración.
    # Ejecutar la JVM incluida directamente evita que el launcher de consola
    # abra otro proceso con una terminal propia o pierda la redirección de logs.
    $qzDirectory = Get-QzInstallDirectory
    $qzJava = Join-Path $qzDirectory 'runtime/bin/java.exe'
    $qzJar = Join-Path $qzDirectory 'qz-tray.jar'
    $shutdown = Invoke-QzBackgroundProcess -FilePath $qzJava -Arguments ('-Xms512m -Djna.nosys=true --add-exports java.desktop/sun.swing=ALL-UNNAMED -jar "{0}" preinstall' -f $qzJar)
    Write-Output $shutdown.StandardOutput
    Write-Output $shutdown.StandardError
    if ($shutdown.ExitCode -ne 0) { throw 'No se pudo cerrar QZ Tray para configurar el certificado.' }
    Set-QzRootCertificate -Source $root -Manifest $manifest
    Write-Output 'QZ Tray y el certificado de BarMaster quedaron configurados.'
    exit 0
} catch {
    Write-Output $_.Exception.Message
    exit 1
}
