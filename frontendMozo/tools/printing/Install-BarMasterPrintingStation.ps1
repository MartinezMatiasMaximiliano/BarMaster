param(
    [Parameter(Mandatory = $true)][ValidatePattern('^https?://')][string]$BarMasterUrl,
    [string]$QzTrayPath = "$env:ProgramFiles\QZ Tray\qz-tray.exe"
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $QzTrayPath -PathType Leaf)) {
    throw "No se encontró QZ Tray en '$QzTrayPath'. Instalalo y volvé a ejecutar este script."
}

$shell = New-Object -ComObject WScript.Shell
$startup = [Environment]::GetFolderPath('Startup')
$qzShortcut = $shell.CreateShortcut((Join-Path $startup 'QZ Tray.lnk'))
$qzShortcut.TargetPath = $QzTrayPath
$qzShortcut.WorkingDirectory = Split-Path -Parent $QzTrayPath
$qzShortcut.Save()

$desktop = [Environment]::GetFolderPath('Desktop')
$appShortcut = $shell.CreateShortcut((Join-Path $desktop 'BarMaster - Impresión.lnk'))
$appShortcut.TargetPath = $BarMasterUrl
$appShortcut.Save()

Write-Host 'Accesos creados correctamente.' -ForegroundColor Green
Write-Host 'Pendiente manual: desactivar suspensión, comprobar el driver y realizar una página de prueba de Windows.' -ForegroundColor Yellow
Write-Host 'Abrí BarMaster, ingresá como administrador y usá Configuración > Impresoras para habilitar este equipo.'
