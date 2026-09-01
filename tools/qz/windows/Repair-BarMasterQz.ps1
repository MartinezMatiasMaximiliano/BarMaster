[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$BackendUrl,
    [string]$ConfigurationUrl
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Import-Module (Join-Path $PSScriptRoot 'QzWindows.Common.psm1') -Force

$manifest = Get-QzManifest
$rootSource = Assert-QzRootArtifact -Manifest $manifest
$version = Get-QzInstalledVersion
if ($null -eq $version) { throw 'QZ Tray no está instalado.' }
if ($version -ne $manifest.version) { Write-Warning "Versión QZ detectada '$version'; esperada '$($manifest.version)'." }

if (-not (Test-QzRootCertificate -Manifest $manifest)) {
    $destination = Join-Path (Get-QzInstallDirectory) 'override.crt'
    if ($PSCmdlet.ShouldProcess($destination, 'Reponer override.crt')) {
        Copy-Item -LiteralPath $rootSource -Destination $destination -Force
    }
}

if ($BackendUrl) {
    $healthUrl = "$($BackendUrl.TrimEnd('/'))/api/qz/health"
    try {
        $health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 15
        Write-Host "Backend QZ: enabled=$($health.enabled), ready=$($health.ready)"
    } catch {
        Write-Warning "No se pudo consultar '$healthUrl': $($_.Exception.Message)"
    }
}

$logDirectory = Join-Path $env:APPDATA 'qz'
[pscustomobject]@{
    Version = $version
    RunningAsCurrentUser = Test-QzRunning
    AutoStartConfigured = Test-QzAutoStart
    RootCertificateMatches = Test-QzRootCertificate -Manifest $manifest
    UserLogDirectory = $logDirectory
    UserLogDirectoryExists = Test-Path -LiteralPath $logDirectory
}

if ($ConfigurationUrl -and $PSCmdlet.ShouldProcess($ConfigurationUrl, 'Abrir diagnóstico BarMaster')) {
    Start-Process $ConfigurationUrl
}

Write-Host 'Si QZ estaba abierto al reponer la raíz, cerralo mediante el icono de bandeja > Exit y volvé a iniciarlo como usuario de caja.'
