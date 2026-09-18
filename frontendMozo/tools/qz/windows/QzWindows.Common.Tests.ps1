Import-Module (Join-Path $PSScriptRoot 'QzWindows.Common.psm1') -Force

InModuleScope QzWindows.Common {
    Describe 'Procesos auxiliares sin consola' {
        It 'evita crear una consola y conserva stdout, stderr y el codigo de salida' {
            $fixtureDirectory = Join-Path $TestDrive 'proceso con espacios'
            $null = New-Item -ItemType Directory -Path $fixtureDirectory -Force
            $fixture = Join-Path $fixtureDirectory 'ConsoleFixture.exe'
            Add-Type -OutputAssembly $fixture -OutputType ConsoleApplication -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class QzConsoleFixture {
    [DllImport("kernel32.dll")] static extern IntPtr GetConsoleWindow();
    public static int Main() {
        Console.WriteLine("INFO: prueba");
        Console.WriteLine("NO_CONSOLE=" + (GetConsoleWindow() == IntPtr.Zero));
        Console.Error.WriteLine("DEBUG: diagnostico");
        return 7;
    }
}
'@
            $result = Invoke-QzBackgroundProcess -FilePath $fixture
            $result.ExitCode | Should Be 7
            $result.StandardOutput | Should Match 'INFO: prueba'
            $result.StandardOutput | Should Match 'NO_CONSOLE=True'
            $result.StandardError | Should Match 'DEBUG: diagnostico'
        }
    }
    Describe 'Configuracion local del certificado QZ' {
        BeforeEach {
            $script:testInstall = Join-Path $TestDrive 'QZ Tray'
            $null = New-Item -ItemType Directory -Path $script:testInstall -Force
            $script:rootSource = Join-Path $TestDrive 'root.crt'
            Set-Content -LiteralPath $script:rootSource -Value 'raiz publica de prueba'
            $script:testManifest = [pscustomobject]@{
                rootCertificateSha256 = (Get-FileHash $script:rootSource -Algorithm SHA256).Hash
            }
            $script:properties = Join-Path $script:testInstall 'qz-tray.properties'
            Set-Content -LiteralPath $script:properties -Value @('wss.host=localhost', 'authcert.override=antigua.crt')
            Mock Get-QzInstallDirectory { $script:testInstall }
        }

        It 'instala la raiz y conserva las otras propiedades al reparar una instalacion' {
            Set-QzRootCertificate -Source $script:rootSource -Manifest $script:testManifest
            Test-QzRootCertificate -Manifest $script:testManifest | Should Be $true
            ((Get-Content $script:properties) -contains 'wss.host=localhost') | Should Be $true
            ((Get-Content $script:properties) -contains 'authcert.override=antigua.crt') | Should Be $false
        }

        It 'reinstalar no duplica la propiedad del certificado' {
            Set-QzRootCertificate -Source $script:rootSource -Manifest $script:testManifest
            Set-QzRootCertificate -Source $script:rootSource -Manifest $script:testManifest
            @(Get-Content $script:properties | Where-Object { $_ -eq 'authcert.override=override.crt' }).Count | Should Be 1
        }

        It 'detecta un certificado distinto del certificado distribuido' {
            Set-QzRootCertificate -Source $script:rootSource -Manifest $script:testManifest
            Set-Content -LiteralPath (Join-Path $script:testInstall 'override.crt') -Value 'otra raiz'
            Test-QzRootCertificate -Manifest $script:testManifest | Should Be $false
        }

        It 'rechaza el instalador descargado si su hash no coincide' {
            $file = Join-Path $TestDrive 'qz.exe'
            Set-Content -LiteralPath $file -Value 'contenido inesperado'
            $manifest = [pscustomobject]@{ downloads = [pscustomobject]@{ x64 = [pscustomobject]@{ sha256 = 'incorrecto' } } }
            { Test-QzInstaller -InstallerPath $file -Manifest $manifest -Architecture x64 } | Should Throw
        }
    }
}
