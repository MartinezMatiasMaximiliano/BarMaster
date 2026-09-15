[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'QzWindows.Common.psm1') -Force
$manifest = Get-QzManifest
$root = Assert-QzRootArtifact -Manifest $manifest
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw 'Se necesita el compilador de .NET Framework 4 en Windows para generar el instalador.' }
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$logoDirectory = Join-Path $workspace 'frontendMozo/public/logo'
$favicon = Join-Path $logoDirectory 'favicon.png'
$logo = Join-Path $logoDirectory 'logo_completo.png'
# Windows requiere un contenedor ICO para los recursos del ejecutable.
# Generar sus tamaños desde favicon.png sin modificar el archivo original.
Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path $workspace '.tmp/printing-installer'
$null = New-Item -ItemType Directory -Path $assetDirectory -Force
$iconPath = Join-Path $assetDirectory 'favicon.ico'
$sourceImage = [Drawing.Image]::FromFile($favicon)
$frames = @()
try {
    foreach ($size in @(16, 32, 48, 64, 128, 256)) {
        $bitmap = [Drawing.Bitmap]::new($size, $size)
        $graphics = [Drawing.Graphics]::FromImage($bitmap)
        $stream = [IO.MemoryStream]::new()
        try {
            $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($sourceImage, 0, 0, $size, $size)
            $bitmap.Save($stream, [Drawing.Imaging.ImageFormat]::Png)
            $frames += @{ Size = $size; Bytes = $stream.ToArray() }
        } finally { $stream.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
    }
} finally { $sourceImage.Dispose() }
$iconStream = [IO.File]::Create($iconPath)
$writer = [IO.BinaryWriter]::new($iconStream)
try {
    $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$frames.Count)
    $offset = 6 + 16 * $frames.Count
    foreach ($frame in $frames) {
        $dimension = if ($frame.Size -eq 256) { 0 } else { $frame.Size }
        $writer.Write([byte]$dimension); $writer.Write([byte]$dimension)
        $writer.Write([byte]0); $writer.Write([byte]0)
        $writer.Write([uint16]1); $writer.Write([uint16]32)
        $writer.Write([uint32]$frame.Bytes.Length); $writer.Write([uint32]$offset)
        $offset += $frame.Bytes.Length
    }
    foreach ($frame in $frames) { $writer.Write([byte[]]$frame.Bytes) }
} finally { $writer.Dispose(); $iconStream.Dispose() }
$outputDirectory = Join-Path $workspace 'frontendMozo/public/downloads'
$null = New-Item -ItemType Directory -Path $outputDirectory -Force
$output = Join-Path $outputDirectory 'BarMaster-Impresion-Setup.exe'
$arguments = @('/nologo', '/target:winexe', '/platform:anycpu', '/optimize+', "/out:$output",
    '/reference:System.Windows.Forms.dll', '/reference:System.Drawing.dll',
    "/win32manifest:$(Join-Path $PSScriptRoot 'installer.manifest')", "/win32icon:$iconPath",
    "/resource:$iconPath,barmaster.ico", "/resource:$logo,logo_completo.png")
foreach ($file in @('Setup-Impresion.ps1', 'Install-BarMasterQz.ps1', 'QzWindows.Common.psm1', 'qz-manifest.json')) {
    $arguments += "/resource:$(Join-Path $PSScriptRoot $file),$file"
}
$arguments += "/resource:$root,override.crt"
$arguments += Join-Path $PSScriptRoot 'PrintingSetup.cs'
& $compiler @arguments
if ($LASTEXITCODE -ne 0) { throw 'No se pudo compilar el instalador.' }
$verification = Start-Process -FilePath $output -ArgumentList '--verify' -WindowStyle Hidden -Wait -PassThru
if ($verification.ExitCode -ne 0) { throw 'El ejecutable no pasó la verificación de sus recursos.' }
Get-FileHash -LiteralPath $output -Algorithm SHA256
