# Script: ConvertirJSX_UTF8NoBOM.ps1
# Recorrer todas las carpetas y convertir archivos .jsx a UTF-8 sin BOM (code page 65001)

Get-ChildItem -Recurse -Filter *.jsx | ForEach-Object {
    Write-Host "Procesando $($_.FullName)..."

    $content = Get-Content $_.FullName -Raw

    # Usar StreamWriter de .NET para guardar como UTF-8 sin BOM
    $utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($_.FullName, $content, $utf8NoBomEncoding)
}

Write-Host "Todos los archivos .jsx fueron convertidos a UTF-8 sin BOM (code page 65001)."