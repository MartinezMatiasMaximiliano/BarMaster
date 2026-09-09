Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-QzManifest {
    param([string]$ManifestPath = (Join-Path $PSScriptRoot 'qz-manifest.json'))
    if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
        throw "No existe el manifiesto '$ManifestPath'."
    }
    return Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
}

function Get-QzArchitecture {
    switch ([Runtime.InteropServices.RuntimeInformation]::OSArchitecture) {
        'X64' { return 'x64' }
        'Arm64' { return 'arm64' }
        default { throw "Arquitectura Windows no soportada: $([Runtime.InteropServices.RuntimeInformation]::OSArchitecture)." }
    }
}

function Test-QzInstaller {
    param(
        [Parameter(Mandatory)][string]$InstallerPath,
        [Parameter(Mandatory)]$Manifest,
        [Parameter(Mandatory)][string]$Architecture
    )

    $download = $Manifest.downloads.$Architecture
    $actualHash = (Get-FileHash -LiteralPath $InstallerPath -Algorithm SHA256).Hash
    if ($actualHash -ne $download.sha256) {
        throw "SHA-256 de instalador inesperado: $actualHash."
    }

    $signature = Get-AuthenticodeSignature -LiteralPath $InstallerPath
    if ($signature.Status -ne 'Valid') {
        throw "Firma Authenticode inválida: $($signature.StatusMessage)."
    }
    if ($signature.SignerCertificate.Subject -notmatch $Manifest.publisherSubjectPattern) {
        throw "Editor Authenticode inesperado: $($signature.SignerCertificate.Subject)."
    }
}

function Get-QzInstallDirectory {
    return Join-Path $env:ProgramFiles 'QZ Tray'
}

function Get-QzConsolePath {
    return Join-Path (Get-QzInstallDirectory) 'qz-tray-console.exe'
}

function Get-QzInstalledVersion {
    $uninstallRoots = @(
        'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
        'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
    )
    $installation = Get-ItemProperty -Path $uninstallRoots -ErrorAction SilentlyContinue |
        Where-Object {
            $_.PSObject.Properties['DisplayName'] -and
            $_.PSObject.Properties['Publisher'] -and
            $_.DisplayName -like 'QZ Tray*' -and
            $_.Publisher -like 'QZ Industries*'
        } |
        Sort-Object DisplayVersion -Descending |
        Select-Object -First 1
    if ($null -eq $installation -or -not (Test-Path -LiteralPath (Get-QzConsolePath) -PathType Leaf)) {
        return $null
    }
    return [string]$installation.DisplayVersion
}

function Test-QzRootCertificate {
    param([Parameter(Mandatory)]$Manifest)
    $installDirectory = Get-QzInstallDirectory
    $installed = Join-Path $installDirectory 'override.crt'
    if (-not (Test-Path -LiteralPath $installed -PathType Leaf)) { return $false }
    if ((Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash -ne $Manifest.rootCertificateSha256) {
        return $false
    }

    $propertiesPath = Join-Path $installDirectory 'qz-tray.properties'
    if (-not (Test-Path -LiteralPath $propertiesPath -PathType Leaf)) { return $false }
    return [bool](Select-String -LiteralPath $propertiesPath -Pattern '^authcert\.override=override\.crt$' -Quiet)
}

function Set-QzRootCertificate {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)]$Manifest
    )

    $installDirectory = Get-QzInstallDirectory
    $destination = Join-Path $installDirectory 'override.crt'
    Copy-Item -LiteralPath $Source -Destination $destination -Force

    $propertiesPath = Join-Path $installDirectory 'qz-tray.properties'
    if (-not (Test-Path -LiteralPath $propertiesPath -PathType Leaf)) {
        throw "No existe la configuración de QZ Tray '$propertiesPath'."
    }

    $property = 'authcert.override=override.crt'
    $lines = @(Get-Content -LiteralPath $propertiesPath)
    $updated = $false
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match '^authcert\.override=') {
            $lines[$index] = $property
            $updated = $true
        }
    }
    if (-not $updated) { $lines += $property }
    [IO.File]::WriteAllLines($propertiesPath, $lines, [Text.UTF8Encoding]::new($false))

    if (-not (Test-QzRootCertificate -Manifest $Manifest)) {
        throw 'La raíz personalizada de QZ no quedó instalada y configurada correctamente.'
    }
}

function Test-QzRunning {
    $runtimeDirectory = Join-Path (Get-QzInstallDirectory) 'runtime'
    return [bool](Get-Process -Name 'javaw' -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -and $_.Path.StartsWith($runtimeDirectory, [StringComparison]::OrdinalIgnoreCase)
    })
}

function Test-QzAutoStart {
    $commonStartup = [Environment]::GetFolderPath([Environment+SpecialFolder]::CommonStartup)
    return Test-Path -LiteralPath (Join-Path $commonStartup 'QZ Tray.lnk') -PathType Leaf
}

function Assert-QzRootArtifact {
    param([Parameter(Mandatory)]$Manifest)
    $source = Join-Path $PSScriptRoot $Manifest.rootCertificate
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "No existe el override público '$source'."
    }
    $hash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
    if ($hash -ne $Manifest.rootCertificateSha256) {
        throw "El SHA-256 del override público no coincide con el manifiesto."
    }
    return $source
}

Export-ModuleMember -Function Get-QzManifest, Get-QzArchitecture, Test-QzInstaller, Get-QzInstallDirectory, Get-QzConsolePath, Get-QzInstalledVersion, Test-QzRootCertificate, Set-QzRootCertificate, Test-QzRunning, Test-QzAutoStart, Assert-QzRootArtifact
