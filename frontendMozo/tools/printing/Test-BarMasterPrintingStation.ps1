param([string]$QzTrayPath = "$env:ProgramFiles\QZ Tray\qz-tray.exe")

$results = [ordered]@{
    QzTrayInstalled = Test-Path -LiteralPath $QzTrayPath -PathType Leaf
    QzTrayRunning = [bool](Get-Process -Name 'qz-tray' -ErrorAction SilentlyContinue)
    QzWebSocket8181 = Test-NetConnection -ComputerName localhost -Port 8181 -InformationLevel Quiet -WarningAction SilentlyContinue
    QzWebSocket8182 = Test-NetConnection -ComputerName localhost -Port 8182 -InformationLevel Quiet -WarningAction SilentlyContinue
    WindowsPrinterCount = @(Get-Printer -ErrorAction SilentlyContinue).Count
    ComputerWillSleepOnAC = ((powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE | Select-String 'Current AC Power Setting Index: 0x00000000') -eq $null)
}

[pscustomobject]$results | Format-List
if (-not $results.QzTrayInstalled -or -not $results.QzTrayRunning -or $results.WindowsPrinterCount -eq 0) { exit 1 }
