[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$DownloadDirectory = (Join-Path $env:TEMP 'BarMaster-Qz-Installer'),
    [switch]$SkipDownload
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Import-Module (Join-Path $PSScriptRoot 'QzWindows.Common.psm1') -Force

$manifest = Get-QzManifest
$architecture = Get-QzArchitecture
$download = $manifest.downloads.$architecture

if ($WhatIfPreference) {
    $rootSource = Assert-QzRootArtifact -Manifest $manifest
    [pscustomobject]@{
        Mode = 'WhatIf'
        Architecture = $architecture
        Version = $manifest.version
        InstallerUrl = $download.url
        InstallerSha256 = $download.sha256
        RootCertificate = $rootSource
        RootCertificateSha256 = $manifest.rootCertificateSha256
    }
    return
}

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Ejecutá este script desde PowerShell como administrador. QZ se iniciará después bajo el usuario de caja.'
}

$null = New-Item -ItemType Directory -Path $DownloadDirectory -Force
$installerPath = Join-Path $DownloadDirectory $download.fileName

if (-not $SkipDownload) {
    if ($PSCmdlet.ShouldProcess($download.url, "Descargar $($download.fileName)")) {
        Invoke-WebRequest -Uri $download.url -OutFile $installerPath -UseBasicParsing
    }
}
if (-not (Test-Path -LiteralPath $installerPath -PathType Leaf)) {
    throw "No se encontró el instalador '$installerPath'."
}

Test-QzInstaller -InstallerPath $installerPath -Manifest $manifest -Architecture $architecture
$rootSource = Assert-QzRootArtifact -Manifest $manifest

if ($PSCmdlet.ShouldProcess($installerPath, 'Instalar QZ Tray silenciosamente')) {
    $process = Start-Process -FilePath $installerPath -ArgumentList '/S' -Wait -PassThru
    if ($process.ExitCode -ne 0) {
        throw "La instalación de QZ Tray falló con código $($process.ExitCode)."
    }
}

$installDirectory = Get-QzInstallDirectory
if (-not (Test-Path -LiteralPath $installDirectory -PathType Container)) {
    throw "QZ Tray no quedó instalado en '$installDirectory'."
}

$overrideDestination = Join-Path $installDirectory 'override.crt'
if ($PSCmdlet.ShouldProcess($overrideDestination, 'Instalar raíz pública BarMaster')) {
    Copy-Item -LiteralPath $rootSource -Destination $overrideDestination -Force
}

$installedVersion = Get-QzInstalledVersion
if ($installedVersion -ne $manifest.version) {
    throw "Versión instalada inesperada: '$installedVersion'; se esperaba '$($manifest.version)'."
}
if (-not (Test-QzRootCertificate -Manifest $manifest)) {
    throw 'La raíz instalada no coincide con el manifiesto.'
}
if (-not (Test-QzAutoStart)) {
    throw 'QZ Tray no registró el acceso directo de inicio automático para las sesiones interactivas.'
}

Write-Host "QZ Tray $installedVersion y override.crt quedaron instalados correctamente."
Write-Host 'Cerrá esta consola elevada. Iniciá QZ desde el menú Inicio como usuario de caja o cerrá y abrí la sesión de Windows.'
