[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Import-Module (Join-Path $PSScriptRoot 'QzWindows.Common.psm1') -Force

$manifest = Get-QzManifest
$architecture = Get-QzArchitecture
$rootSource = Assert-QzRootArtifact -Manifest $manifest
$version = Get-QzInstalledVersion

[pscustomobject]@{
    OperatingSystem = [Runtime.InteropServices.RuntimeInformation]::OSDescription
    Architecture = $architecture
    RequiredVersion = $manifest.version
    InstalledVersion = $version
    Installed = $null -ne $version
    VersionMatches = $version -eq $manifest.version
    PublicRootArtifact = $rootSource
    InstalledRootMatches = if ($null -eq $version) { $false } else { Test-QzRootCertificate -Manifest $manifest }
    QzRunning = Test-QzRunning
    AutoStartConfigured = Test-QzAutoStart
    UserLogDirectory = Join-Path $env:APPDATA 'qz'
}
