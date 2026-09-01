[CmdletBinding()]
param(
    [string]$OutputRoot = (Join-Path $env:LOCALAPPDATA 'BarMaster\qz-pki-development'),
    [string]$OpenSslPath = 'D:\Git\usr\bin\openssl.exe',
    [string]$BackendProject = (Join-Path $PSScriptRoot '..\..\BackEndAPI\BackEndAPI.csproj'),
    [string]$PublicRoot = (Join-Path $PSScriptRoot 'public\development')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-OpenSsl {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & $OpenSslPath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "OpenSSL falló con código $LASTEXITCODE."
    }
}

function New-RandomSecret {
    $bytes = [byte[]]::new(32)
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToHexString($bytes)
}

if (-not (Test-Path -LiteralPath $OpenSslPath -PathType Leaf)) {
    throw "No se encontró OpenSSL en '$OpenSslPath'."
}

$resolvedOutput = [IO.Path]::GetFullPath($OutputRoot)
if (Test-Path -LiteralPath $resolvedOutput) {
    throw "La PKI ya existe en '$resolvedOutput'. No se sobrescribirá."
}

$rootDirectory = Join-Path $resolvedOutput 'root'
$issuanceDirectory = Join-Path $resolvedOutput (Join-Path 'issued' (Get-Date -Format 'yyyy-MM-dd_HHmmss'))
$null = New-Item -ItemType Directory -Path $rootDirectory -Force
$null = New-Item -ItemType Directory -Path $issuanceDirectory -Force
$null = New-Item -ItemType Directory -Path $PublicRoot -Force

$rootKey = Join-Path $rootDirectory 'barmaster-qz-root.key.pem'
$rootCertificate = Join-Path $rootDirectory 'barmaster-qz-root.crt.pem'
$serialFile = Join-Path $rootDirectory 'barmaster-qz-root.srl'
$rootPasswordBlob = Join-Path $rootDirectory 'root-password.dpapi'
$leafKey = Join-Path $issuanceDirectory 'barmaster-qz-signing.key.pem'
$leafCsr = Join-Path $issuanceDirectory 'barmaster-qz-signing.csr.pem'
$leafCertificate = Join-Path $issuanceDirectory 'barmaster-qz-signing.crt.pem'
$extensionFile = Join-Path $issuanceDirectory 'qz-signing.ext'
$pfx = Join-Path $issuanceDirectory 'barmaster-qz-signing.pfx'
$digitalCertificate = Join-Path $PublicRoot 'digital-certificate.txt'
$overrideCertificate = Join-Path $PublicRoot 'override.crt'

$rootPassword = New-RandomSecret
$pfxPassword = New-RandomSecret
$env:BM_QZ_ROOT_PASS = $rootPassword
$env:BM_QZ_PFX_PASS = $pfxPassword
$env:MSYS2_ARG_CONV_EXCL = '*'

try {
    $protectedPassword = [Security.Cryptography.ProtectedData]::Protect(
        [Text.Encoding]::UTF8.GetBytes($rootPassword),
        $null,
        [Security.Cryptography.DataProtectionScope]::CurrentUser)
    [IO.File]::WriteAllBytes($rootPasswordBlob, $protectedPassword)

    [IO.File]::WriteAllText(
        $extensionFile,
        "basicConstraints=critical,CA:FALSE`nkeyUsage=critical,digitalSignature`nsubjectKeyIdentifier=hash`nauthorityKeyIdentifier=keyid,issuer`n",
        [Text.UTF8Encoding]::new($false))

    Invoke-OpenSsl @('genpkey', '-algorithm', 'RSA', '-aes-256-cbc', '-pass', 'env:BM_QZ_ROOT_PASS', '-pkeyopt', 'rsa_keygen_bits:2048', '-out', $rootKey)
    Invoke-OpenSsl @('req', '-x509', '-new', '-sha256', '-days', '3650', '-passin', 'env:BM_QZ_ROOT_PASS', '-key', $rootKey, '-out', $rootCertificate, '-subj', '/C=AR/O=BarMaster/OU=Development Printing/CN=BarMaster QZ Development Root CA', '-addext', 'basicConstraints=critical,CA:TRUE,pathlen:0', '-addext', 'keyUsage=critical,keyCertSign,cRLSign', '-addext', 'subjectKeyIdentifier=hash')
    Invoke-OpenSsl @('genpkey', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:2048', '-out', $leafKey)
    Invoke-OpenSsl @('req', '-new', '-sha256', '-key', $leafKey, '-out', $leafCsr, '-subj', '/C=AR/O=BarMaster/OU=Development Printing/CN=BarMaster Development')
    Invoke-OpenSsl @('x509', '-req', '-in', $leafCsr, '-CA', $rootCertificate, '-CAkey', $rootKey, '-passin', 'env:BM_QZ_ROOT_PASS', '-CAserial', $serialFile, '-CAcreateserial', '-out', $leafCertificate, '-days', '365', '-sha256', '-extfile', $extensionFile)
    Invoke-OpenSsl @('verify', '-CAfile', $rootCertificate, $leafCertificate)
    Invoke-OpenSsl @('pkcs12', '-export', '-out', $pfx, '-inkey', $leafKey, '-in', $leafCertificate, '-certfile', $rootCertificate, '-name', 'BarMaster QZ Development Signing', '-passout', 'env:BM_QZ_PFX_PASS')
    Invoke-OpenSsl @('pkcs12', '-in', $pfx, '-passin', 'env:BM_QZ_PFX_PASS', '-info', '-noout')

    Copy-Item -LiteralPath $leafCertificate -Destination $digitalCertificate
    Copy-Item -LiteralPath $rootCertificate -Destination $overrideCertificate

    $leafX509 = [Security.Cryptography.X509Certificates.X509Certificate2]::CreateFromPem(
        [IO.File]::ReadAllText($leafCertificate))
    $rootX509 = [Security.Cryptography.X509Certificates.X509Certificate2]::CreateFromPem(
        [IO.File]::ReadAllText($rootCertificate))
    try {
        $leafHash = $leafX509.GetCertHashString([Security.Cryptography.HashAlgorithmName]::SHA256)
        $rootHash = $rootX509.GetCertHashString([Security.Cryptography.HashAlgorithmName]::SHA256)
    }
    finally {
        $leafX509.Dispose()
        $rootX509.Dispose()
    }

    & dotnet user-secrets set 'QzSigning:PfxPath' $pfx --project $BackendProject | Out-Null
    & dotnet user-secrets set 'QzSigning:PfxPassword' $pfxPassword --project $BackendProject | Out-Null
    & dotnet user-secrets set 'QzSigning:RootCertificatePath' $rootCertificate --project $BackendProject | Out-Null
    & dotnet user-secrets set 'QzSigning:ExpectedCertificateSha256' $leafHash --project $BackendProject | Out-Null
    & dotnet user-secrets set 'QzSigning:ExpectedRootCertificateSha256' $rootHash --project $BackendProject | Out-Null
    & dotnet user-secrets set 'QzSigning:AllowUnregisteredStationsInDevelopment' 'true' --project $BackendProject | Out-Null
    & dotnet user-secrets set 'QzSigning:Enabled' 'true' --project $BackendProject | Out-Null

    [pscustomobject]@{
        PkiRoot = $resolvedOutput
        Issuance = $issuanceDirectory
        PublicArtifacts = [IO.Path]::GetFullPath($PublicRoot)
        CertificateSha256 = $leafHash
        RootCertificateSha256 = $rootHash
    }
}
finally {
    Remove-Item Env:BM_QZ_ROOT_PASS -ErrorAction SilentlyContinue
    Remove-Item Env:BM_QZ_PFX_PASS -ErrorAction SilentlyContinue
    Remove-Item Env:MSYS2_ARG_CONV_EXCL -ErrorAction SilentlyContinue
    $rootPassword = $null
    $pfxPassword = $null
}
