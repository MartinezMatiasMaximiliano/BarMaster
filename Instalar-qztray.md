# Instalación e integración de QZ Tray con certificado propio en BarMaster

> Estado del documento: revisión técnica finalizada el 28 de agosto de 2026 contra QZ Tray 2.2.6, su documentación y código fuente oficiales, OpenSSL 3.5.4 y el estado actual del repositorio BarMaster.
>
> Alcance: conectar `frontendMozo` con las impresoras instaladas en cada PC mediante QZ Tray y permitir impresiones directas, firmadas y sin mostrar el diálogo de impresión del navegador.

## 1. Aclaración de alcance

Todo lo relacionado con ARCA y facturación electrónica fue implementado en otra rama y queda expresamente fuera de este documento.

Este procedimiento no modifica ni vuelve a diseñar ese circuito. La integración QZ recibe un documento o comandos ya preparados por BarMaster y se limita a enviarlos a la impresora configurada en la estación.

Este documento cubre únicamente:

- Creación y mantenimiento de una autoridad certificadora propia para QZ.
- Firma segura de solicitudes QZ desde el backend .NET.
- Integración de `qz-tray` en `frontendMozo`.
- Conexión con QZ Tray desde Chrome o Edge.
- Enumeración y configuración de impresoras instaladas en Windows.
- Impresión raw ESC/POS y pixel PDF/PNG.
- Eliminación de los diálogos propios de QZ mediante mensajes firmados.
- Tratamiento del permiso Local Network Access del navegador.
- Instalación, reparación, diagnóstico, actualización y rotación.
- Pruebas con la PC, usuario, driver e impresora reales.

## 2. Resultado esperado

Al completar todas las fases:

1. QZ Tray se ejecutará en la sesión interactiva del usuario de caja.
2. BarMaster se conectará al WebSocket local seguro de QZ.
3. El backend entregará el certificado público y firmará cada digest QZ.
4. QZ confiará en la autoridad raíz propia instalada como `override.crt`.
5. El usuario configurará una impresora concreta, no la primera encontrada.
6. BarMaster enviará el trabajo directamente a esa impresora sin abrir `window.print()` ni el diálogo de impresión del navegador.
7. Una impresión firmada y autorizada no mostrará el diálogo de confianza de QZ.
8. La aplicación mostrará causas probables y pasos de recuperación. En QZ Tray 2.2.6 una conexión WebSocket fallida no permite distinguir con certeza entre QZ cerrado, QZ no instalado, LNA bloqueado o un problema TLS/proxy.

`qz.print()` confirma que QZ aceptó o remitió el trabajo al subsistema de impresión. No garantiza por sí solo que el papel haya salido físicamente; esa confirmación depende del driver y del hardware.

## 3. Seguimiento de implementación

Esta tabla debe actualizarse en el mismo commit en que se complete cada fase.

| Fase | Entregable | Estado |
|---|---|---|
| 0 | Documento con alcance exclusivo QZ | Implementada |
| 1 | Seguridad mínima de backend para el firmador | En curso |
| 2 | PKI de desarrollo y artefactos públicos QZ | Implementada |
| 3 | Registro de estación y asignación de impresoras | En curso |
| 4 | Servicio y endpoints de firma .NET | Implementada |
| 5 | Cliente QZ singleton en `frontendMozo` | Implementada |
| 6 | Pantalla de configuración y diagnóstico | Implementada |
| 7 | Impresión de prueba raw y pixel | En curso |
| 8 | Instalador/reparador Windows | Implementada |
| 9 | Piloto físico y matriz de fallos | Bloqueada: falta URL HTTPS definitiva, una impresora física compatible y validación interactiva del navegador |
| 10 | PKI de producción y despliegue gradual | Pendiente |

Estados permitidos:

```text
Pendiente
En curso
Implementada
Bloqueada: <motivo concreto>
```

No marcar una fase como `Implementada` solo porque compiló. Cada fase debe cumplir sus criterios de aceptación y pruebas indicados en este documento.

### 3.1. Registro de implementación al 28 de agosto de 2026

Implementado y verificado:

- JWT de sucursal y persona vinculado a tenant/sucursal; rechazo `TENANT_MISMATCH`; políticas `Printing.Use`, `Printing.Configure` y `Printing.Diagnostics`; rate limiting del firmador; CORS configurable y endpoints de prueba fuera de producción.
- PKI de desarrollo reproducible fuera del repositorio, contraseña PFX en User Secrets, raíz pública y hoja pública separadas, verificación OpenSSL, cadena privada disponible solo para el backend y pins SHA-256 del certificado DER.
- Entidades, restricciones, migración tenant, servicios y endpoints de estaciones/asignaciones. El UUID de instalación local está separado del ID de estación emitido por el backend para permitir que una PC opere en distintas sucursales sin colisiones.
- Herramienta administrativa multi-tenant con dry-run, backup obligatorio mediante `pg_dump`, validación del dump mediante `pg_restore --list`, migración y log JSONL sin secretos. El dry-run detectó una migración pendiente en `c` y diecisiete —incluidas migraciones históricas ajenas a QZ— en `probando-nueva-empresa`; por eso no se aplicó nada sin backup.
- Firmador RSA/SHA-512, validación de PFX/raíz/cadena/extensiones/vigencia/pins, health público y detallado, certificado público sin caché y firma limitada a estaciones autorizadas.
- Cliente QZ singleton, registro previo a conexión, selección exacta de impresora, asignaciones autoritativas con caché namespaced, logout selectivo, pantalla de configuración y envío de preticket raw más pruebas raw/PDF.
- QZ Tray 2.2.6 instalado en esta PC x64, firma Authenticode válida, `override.crt` con hash exacto, CA BarMaster cargada, runtime iniciado bajo el usuario normal y puertos locales 8181/8182 activos.
- Scripts PowerShell de PKI, instalación, diagnóstico y reparación parseados y ejecutados. La detección de versión usa el registro de Windows para no iniciar accidentalmente otra instancia de QZ.
- Prueba end-to-end real correcta: cliente `qz-tray` → WebSocket 8182 → certificado del backend → firma autenticada con tenant/estación → QZ Tray 2.2.6 → enumeración de `Microsoft Print to PDF` → desconexión limpia.
- `dotnet build` de la solución: correcto, sin errores; 17 tests backend correctos; 7 tests frontend correctos; build Vite de producción correcto; lint dirigido de archivos QZ: cero errores.

Pendiente por depender del ambiente operativo:

- Definir el origen HTTPS real del frontend y la URL HTTPS real del backend; luego configurar `Cors:AllowedOrigins` y `VITE_BASE_URL` con esos valores.
- Instalar/localizar `pg_dump`, elegir directorio de backups y revisar las dieciséis migraciones históricas adicionales antes de aplicar la migración QZ a `probando-nueva-empresa`.
- Conectar una impresora física soportada, confirmar su nombre/driver y ejecutar toda la matriz raw, PDF, errores, reinicios y ausencia de diálogos.
- Crear la CA de producción mediante ceremonia realmente offline; no se genera deliberadamente una raíz productiva en esta PC conectada.
- La validación visual automatizada quedó impedida por una inconsistencia local del plugin de navegador de Codex; no afecta al código ni sustituye la prueba manual obligatoria.

## 4. Decisiones técnicas aprobadas

- QZ Tray Desktop: `2.2.6`.
- Paquete NPM: `qz-tray@2.2.6`, fijado con `--save-exact`.
- Sistemas piloto: Windows 10/11 x64 o ARM64, seleccionando obligatoriamente el instalador correspondiente a la arquitectura.
- Navegadores: Chrome o Edge actualizados.
- QZ ejecutándose como aplicación de bandeja en la sesión del cajero.
- Aplicación BarMaster publicada por HTTPS.
- Autoridad raíz propia separada por ambiente.
- Certificado firmante RSA de 2048 bits.
- Firma RSA/SHA-512 con padding PKCS#1 v1.5.
- Clave privada firmante almacenada exclusivamente en el backend.
- `digital-certificate.txt` con un único certificado: la hoja firmante.
- `override.crt` con un único certificado: la autoridad raíz pública.
- Configuración QZ centralizada una sola vez por carga del frontend.
- Impresora elegida explícitamente y validada nuevamente antes de imprimir.
- No usar QZ como servicio Windows, headless o Print Server en el primer despliegue.

Fuentes base:

- [QZ Tray 2.2.6](https://github.com/qzind/tray/releases/tag/v2.2.6)
- [QZ: firma de mensajes](https://qz.io/docs/signing)
- [QZ: comandos](https://qz.io/docs/command-line)
- [QZ: despliegue](https://qz.io/docs/deployment)

### 4.1. Evidencia de esta revisión

Además de revisar la documentación, se realizaron estas validaciones:

- Se ejecutó de principio a fin la secuencia raíz → CSR → hoja → cadena → PFX con OpenSSL 3.5.4.
- `openssl verify` devolvió `OK`.
- La hoja resultante fue RSA 2048, `CA:FALSE` y `Digital Signature`.
- `digital-certificate.txt` y `override.crt` quedaron con un único bloque PEM cada uno.
- El PFX resultante pudo abrirse y contenía la clave privada y la cadena.
- Se descargaron ambos instaladores Windows desde el release oficial 2.2.6.
- Ambos instaladores devolvieron Authenticode `Valid` y firmante `QZ Industries LLC`.
- Los SHA-256 obtenidos coincidieron con los digests publicados por la API oficial del release de GitHub.
- Se inspeccionó el código de la etiqueta `v2.2.6`, commit `4be94301797d04684f4d70c6bbbff5d9acc36987`, para verificar `--version`, `--allow`, `--block`, la desactivación de revocación PKIX y la limitación Windows de `forceRaw`.

Estas validaciones prueban los comandos y artefactos. No sustituyen la prueba posterior con QZ, el navegador, el driver y la impresora física.

## 5. Arquitectura

```text
frontendMozo HTTPS
│
├── GET /api/qz/certificate
│   └── obtiene la hoja pública del certificado firmante
│
├── POST /api/qz/sign
│   └── envía el digest QZ y recibe una firma Base64
│
└── WebSocket seguro local
    └── QZ Tray en la PC de caja
        └── impresora Windows configurada

PKI BarMaster
├── autoridad raíz offline
│   └── clave raíz crítica, nunca instalada en servidores o cajas
└── certificado firmante
    └── PFX y contraseña disponibles solo para el backend

Cada PC de caja
└── C:\Program Files\QZ Tray\override.crt
    └── copia pública de la autoridad raíz
```

QZ crea internamente una estructura con `call`, `params` y `timestamp`, calcula un SHA-256 y entrega al callback de firma un texto hexadecimal de 64 caracteres. El backend firma exactamente esos caracteres usando RSA/SHA-512.

El endpoint de firma no recibe el documento ni el nombre de la impresora. Por eso la autorización de usuarios, estaciones y configuración debe realizarse antes de conceder acceso al firmador.

## 6. Prerrequisitos

### 6.1. Desarrollo

- Node.js y NPM compatibles con el proyecto.
- .NET SDK compatible con `net8.0`.
- OpenSSL 3.x; como mínimo OpenSSL 1.1.1.
- HTTPS funcional para backend y frontend.
- Una ubicación fuera del repositorio para la PKI privada.
- Un administrador de secretos para contraseñas.

### 6.2. PC piloto

- Windows 10 u 11 de 64 bits.
- Acceso administrativo para instalar QZ y copiar `override.crt`.
- Usuario Windows real que utilizará la caja.
- Chrome o Edge actualizado.
- QZ Tray 2.2.6.
- Impresora y driver instalados en Windows.
- Papel y acceso físico para confirmar el resultado.
- Acceso HTTPS al frontend y al backend BarMaster.

No validar inicialmente por escritorio remoto con impresoras redireccionadas. Esa modalidad puede alterar los nombres y la disponibilidad de las colas.

QZ 2.2.6 incluye su propio runtime Java. No instalar un JRE o JDK adicional en la caja.

## 7. Seguridad previa al firmador

El endpoint `/api/qz/sign` autoriza operaciones privilegiadas de QZ. No debe publicarse como un firmador anónimo.

Antes de habilitarlo fuera de `Development`:

1. El JWT debe incluir un identificador de tenant verificable.
2. El tenant del JWT debe coincidir con el tenant resuelto por el backend.
3. La autenticación debe ejecutarse antes de validar la selección de base tenant.
4. Debe existir una política específica, por ejemplo `Printing.Use`.
5. CORS debe restringirse a los orígenes HTTPS de BarMaster.
6. Debe existir rate limiting dedicado al endpoint de firma, particionado por tenant, sucursal, estación, `jti` del JWT e IP.
7. La estación debe pertenecer a la sucursal autenticada.
8. El firmador debe poder deshabilitarse mediante configuración sin recompilar.

El estado actual del repositorio todavía presenta:

- CORS con `AllowAnyOrigin`.
- Selección de tenant mediante `X-Tenant-ID` antes de autenticar.
- JWT sin claim común de tenant.
- Ausencia de una política `Printing.Use`.

Para un POC local, el firmador puede habilitarse temporalmente solo en `Development`, con autenticación y acceso restringido a la red de pruebas. No exponer esa excepción en Internet.

### 7.1. Identidad efectiva del frontend

`frontendMozo/src/services/axiosInstance.js` utiliza actualmente `localStorage.token`, correspondiente a la sesión de empresa/sucursal. El login de persona guarda otro JWT en `USER_token`, pero ese token no se envía en las llamadas normales.

La decisión para esta integración es:

- `Printing.Use` y `/api/qz/sign`: sesión de sucursal, vinculada a tenant, `IdSucursal` y una estación registrada. Esto permite imprimir aunque no haya una sesión de empleado activa.
- `Printing.Configure`: sesión de persona administradora mediante un cliente HTTP específico que envíe `USER_token`.
- El JWT de persona debe ampliarse con tenant, sucursal, identificador de persona y permisos antes de usarlo para configurar impresoras.
- La autorización backend es obligatoria; ocultar botones o rutas en React es solo una ayuda visual.

No sustituir globalmente el token del `axiosInstance`, porque las APIs existentes dependen de la sesión de sucursal. `printingApi.js` debe elegir explícitamente el token apropiado según la operación.

### 7.2. Modo POC y modo producción

- En `Development`, el POC puede aceptar un `stationId` local no registrado, siempre que QZ Signing esté expresamente en modo POC y el backend no sea accesible desde Internet.
- Fuera de `Development`, `/api/qz/sign` debe exigir una estación existente, habilitada y perteneciente a la sucursal del JWT.
- Un GUID guardado en localStorage identifica una instalación, pero no es por sí solo una credencial. La seguridad principal sigue siendo JWT, tenant/sucursal, políticas, HTTPS y rate limiting.

### 7.3. Límite inevitable del firmador

El backend recibe un digest irreversible, no la llamada QZ original. Un sujeto autorizado para usar `/api/qz/sign` puede solicitar la firma de cualquier llamada privilegiada QZ representada por un digest válido; el backend no puede inferir impresora, payload u operación desde esos 64 caracteres.

Las políticas y límites reducen quién puede acceder al oráculo de firma. La autorización de documentos y asignaciones protege los datos de BarMaster, pero no amplía la información visible dentro del digest.

## 8. Crear la PKI propia

### 8.1. Reglas de almacenamiento

Crear dos jerarquías completamente separadas:

```text
qz-pki-development/
qz-pki-production/
```

La PKI no debe generarse dentro del repositorio.

Cada emisión debe guardarse en un directorio inmutable; no sobrescribir certificados anteriores:

```text
issued/
└── 2027-07-01_<serial-o-sha256>/
    ├── signing.csr.pem
    ├── signing.crt.pem
    ├── signing.pfx
    ├── digital-certificate.txt
    └── metadata.txt
```

Esto conserva la hoja antigua necesaria para auditoría o `--block` si una clave se compromete.

Archivos:

| Archivo | Contenido | Secreto |
|---|---|---:|
| `barmaster-qz-root.key.pem` | Clave privada raíz | Sí, crítico |
| `barmaster-qz-root.crt.pem` | Certificado raíz | No |
| `barmaster-qz-root.srl` | Estado de seriales emitidos | Sensible operacionalmente |
| `barmaster-qz-signing.key.pem` | Clave privada firmante | Sí |
| `barmaster-qz-signing.crt.pem` | Certificado firmante | No |
| `barmaster-qz-signing.pfx` | Hoja y clave firmante para .NET | Sí |
| `digital-certificate.txt` | Copia de la hoja firmante | No |
| `override.crt` | Copia de la raíz | No |

### 8.2. Crear la clave raíz

Los comandos siguientes están escritos para Bash, Git Bash o WSL:

```bash
umask 077

openssl genpkey \
  -algorithm RSA \
  -aes-256-cbc \
  -pkeyopt rsa_keygen_bits:2048 \
  -out barmaster-qz-root.key.pem
```

Usar una contraseña aleatoria extensa y guardarla separadamente.

`umask 077` protege permisos en Linux/WSL. Git Bash sobre NTFS no garantiza por sí solo ACL seguras: usar un volumen cifrado, restringir las ACL de Windows y verificar el acceso efectivo. En Git Bash, si MSYS transforma el argumento `/C=AR/...` como una ruta, ejecutar los comandos `openssl req` con `MSYS2_ARG_CONV_EXCL='*'` o utilizar WSL.

### 8.3. Crear la raíz

```bash
openssl req \
  -x509 \
  -new \
  -sha256 \
  -days 3650 \
  -key barmaster-qz-root.key.pem \
  -out barmaster-qz-root.crt.pem \
  -subj "/C=AR/O=BarMaster/OU=Printing/CN=BarMaster QZ Root CA" \
  -addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
  -addext "keyUsage=critical,keyCertSign,cRLSign" \
  -addext "subjectKeyIdentifier=hash"
```

RSA 2048 y diez años de vigencia para la raíz son decisiones operativas de BarMaster compatibles con QZ. QZ exige expresamente RSA 2048 para la clave firmante; no documenta ese tamaño de raíz como una obligación propia.

Validar:

```bash
openssl x509 \
  -in barmaster-qz-root.crt.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -fingerprint \
  -sha256

openssl x509 \
  -in barmaster-qz-root.crt.pem \
  -noout \
  -text
```

Comprobar:

- `Subject` e `Issuer` iguales.
- `CA:TRUE` y `pathlen:0`.
- `Certificate Sign` y `CRL Sign`.
- CN no vacío.
- Fechas correctas.

### 8.4. Crear la clave y CSR firmante

```bash
openssl genpkey \
  -algorithm RSA \
  -aes-256-cbc \
  -pkeyopt rsa_keygen_bits:2048 \
  -out barmaster-qz-signing.key.pem

openssl req \
  -new \
  -sha256 \
  -key barmaster-qz-signing.key.pem \
  -out barmaster-qz-signing.csr.pem \
  -subj "/C=AR/O=BarMaster/OU=Development Printing/CN=BarMaster Development"
```

En producción usar:

```text
OU=Production Printing
CN=BarMaster
```

QZ rechaza certificados con CN vacío.

### 8.5. Extensiones de la hoja

Crear `qz-signing.ext`:

```ini
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer
```

No agregar `extendedKeyUsage=codeSigning`. QZ no lo requiere.

### 8.6. Emitir la hoja

Primera emisión:

```bash
openssl x509 \
  -req \
  -in barmaster-qz-signing.csr.pem \
  -CA barmaster-qz-root.crt.pem \
  -CAkey barmaster-qz-root.key.pem \
  -CAserial barmaster-qz-root.srl \
  -CAcreateserial \
  -out barmaster-qz-signing.crt.pem \
  -days 365 \
  -sha256 \
  -extfile qz-signing.ext
```

Renovaciones:

```bash
openssl x509 \
  -req \
  -in barmaster-qz-signing.csr.pem \
  -CA barmaster-qz-root.crt.pem \
  -CAkey barmaster-qz-root.key.pem \
  -CAserial barmaster-qz-root.srl \
  -out barmaster-qz-signing.crt.pem \
  -days 365 \
  -sha256 \
  -extfile qz-signing.ext
```

No borrar ni recrear `barmaster-qz-root.srl` durante una renovación.

El archivo `.srl` se conserva para trazabilidad. Debe existir un único operador de emisión, sin emisiones concurrentes; respaldarlo después de cada emisión y nunca restaurar una copia antigua. No es un requisito QZ: es una decisión operacional de esta PKI.

### 8.7. Validar la cadena

```bash
openssl verify \
  -CAfile barmaster-qz-root.crt.pem \
  barmaster-qz-signing.crt.pem
```

Resultado esperado:

```text
barmaster-qz-signing.crt.pem: OK
```

Verificar además:

- `CA:FALSE`.
- `Digital Signature`.
- Clave RSA de 2048 bits.
- `Issuer` igual al `Subject` de la raíz.
- Certificado vigente.
- Vencimiento de la hoja dentro de la vigencia de la raíz.

Comandos de verificación reproducibles:

```bash
openssl x509 \
  -in barmaster-qz-signing.crt.pem \
  -noout \
  -ext basicConstraints,keyUsage,subjectKeyIdentifier,authorityKeyIdentifier

openssl x509 \
  -in barmaster-qz-signing.crt.pem \
  -noout \
  -pubkey |
openssl pkey -pubin -text -noout

# Falla si la hoja vence dentro de 60 días.
openssl x509 \
  -in barmaster-qz-signing.crt.pem \
  -noout \
  -checkend 5184000
```

### 8.8. Crear artefactos QZ

```bash
cp barmaster-qz-signing.crt.pem digital-certificate.txt
cp barmaster-qz-root.crt.pem override.crt
```

Validar:

```bash
grep -c "BEGIN CERTIFICATE" digital-certificate.txt
grep -c "BEGIN CERTIFICATE" override.crt
```

Ambos comandos deben devolver `1`.

La raíz no se concatena en `digital-certificate.txt`. La jerarquía propuesta no tiene CA intermedia y no usa el marcador `--START INTERMEDIATE CERT--`.

Aunque el backend servirá la hoja directamente desde el PFX, conservar `digital-certificate.txt` como artefacto público versionado de la emisión es útil para diagnóstico y para bloquear esa hoja en el futuro.

### 8.9. Crear el PFX

```bash
openssl pkcs12 \
  -export \
  -out barmaster-qz-signing.pfx \
  -inkey barmaster-qz-signing.key.pem \
  -in barmaster-qz-signing.crt.pem \
  -certfile barmaster-qz-root.crt.pem \
  -name "BarMaster QZ Signing"
```

Verificar sin exponer la clave:

```bash
openssl pkcs12 \
  -in barmaster-qz-signing.pfx \
  -info \
  -noout
```

### 8.10. Retirar la raíz

Guardar offline:

- Clave y certificado raíz.
- Archivo serial.
- Contraseña raíz.
- Archivo de extensiones.
- Registro de emisiones, seriales y fingerprints SHA-256.

Mantener al menos dos respaldos cifrados en ubicaciones diferentes. Retirar la clave raíz del equipo de uso diario.

Archivar también todas las emisiones, incluso las vencidas o reemplazadas. La clave PEM firmante, si se conserva, debe permanecer cifrada y offline; el backend recibe únicamente el PFX. No dejar `barmaster-qz-signing.key.pem` en una PC de trabajo cotidiana.

## 9. Protección de secretos

El `.gitignore` debe cubrir:

```gitignore
*.pfx
*.p12
*.key
*.key.pem
*.csr
*.csr.pem
*.srl
*.pass
**/secrets/**
**/qz-pki-private/**
```

No ignorar todos los `.pem`: algunos certificados públicos pueden ser artefactos de despliegue.

Reglas:

- Nunca guardar claves o contraseñas en Git.
- Nunca incluir el PFX en frontend, instalador o imagen pública.
- Cargar la contraseña mediante User Secrets en desarrollo.
- Cargar ruta y contraseña desde variables o secret manager en producción.
- Conceder lectura del PFX únicamente a la identidad del backend.
- No enviar ni registrar el PFX, la contraseña o firmas en logs.
- Versionar `override.crt` únicamente como artefacto público, acompañado de su SHA-256.

Configuración sugerida sin secretos:

```json
{
  "QzSigning": {
    "Enabled": false,
    "PfxPath": "",
    "PfxPassword": "",
    "RootCertificatePath": "",
    "ExpectedCertificateSha256": "",
    "ExpectedRootCertificateSha256": "",
    "MinimumRemainingDays": 30
  }
}
```

Desarrollo:

```powershell
dotnet user-secrets set "QzSigning:PfxPath" "C:\RutaPrivada\barmaster-qz-signing.pfx"
dotnet user-secrets set "QzSigning:PfxPassword" "<contraseña>"
dotnet user-secrets set "QzSigning:RootCertificatePath" "C:\RutaPublica\barmaster-qz-root.crt.pem"
dotnet user-secrets set "QzSigning:ExpectedCertificateSha256" "<SHA256-SIN-DOS-PUNTOS>"
dotnet user-secrets set "QzSigning:ExpectedRootCertificateSha256" "<SHA256-SIN-DOS-PUNTOS>"
dotnet user-secrets set "QzSigning:Enabled" "true"
```

El proyecto todavía no tiene `UserSecretsId`. Antes de esos comandos ejecutar desde la raíz:

```powershell
dotnet user-secrets init --project BackEndAPI/BackEndAPI.csproj
```

Usar siempre SHA-256 normalizado en mayúsculas y sin `:` para los pins de BarMaster. No usar `X509Certificate2.Thumbprint`, que normalmente representa SHA-1, ni confundirlo con el fingerprint SHA-1 que QZ utiliza internamente en sus listas `allowed.dat`/`blocked.dat`.

No copiar contraseñas reales en documentación, scripts o capturas.

## 10. Backend .NET

### 10.1. Componentes

Crear:

```text
BackEndAPI/
├── Printing/Qz/
│   ├── QzSigningOptions.cs
│   ├── QzSigningOptionsValidator.cs
│   ├── IQzSigningService.cs
│   ├── QzSigningService.cs
│   └── QzSignRequest.cs
└── Controllers/
    └── QzController.cs
```

Registrar Options con validación al inicio y el servicio de firma como singleton.

Si `QzSigning:Enabled=true`, el backend debe fallar al iniciar cuando:

- El PFX no existe.
- La contraseña es incorrecta.
- No tiene clave privada.
- La clave no es RSA de 2048 bits.
- El certificado está vencido o todavía no es válido.
- El CN está vacío.
- El SHA-256 esperado de la hoja o raíz no coincide.
- La hoja no encadena a la raíz configurada.
- La hoja no es `CA:FALSE` con `Digital Signature`.
- La raíz no es `CA:TRUE`.

Validar la cadena con `X509Chain`, `TrustMode=CustomRootTrust`, la raíz en `CustomTrustStore` y `RevocationMode=NoCheck`, reproduciendo el modelo de confianza local de QZ. `MinimumRemainingDays` genera warning y estado degradado; no debe impedir el arranque mientras el certificado siga vigente.

Si `Enabled=false`, la validación es condicional: no se carga el PFX, `certificate/sign` responden `503 QZ_SIGNING_DISABLED` y el health público informa `{ enabled: false, ready: false }`. Deshabilitar QZ no debe provocar un fallo de arranque ni un `500` accidental.

### 10.2. Servicio de firma

Referencia:

```csharp
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

public sealed class QzSigningService : IDisposable
{
    private readonly X509Certificate2 certificate;

    public QzSigningService(string pfxPath, string password)
    {
        certificate = new X509Certificate2(
            pfxPath,
            password,
            X509KeyStorageFlags.EphemeralKeySet);

        if (!certificate.HasPrivateKey)
            throw new InvalidOperationException("El PFX QZ no contiene clave privada.");
    }

    public string GetPublicCertificatePem()
        => certificate.ExportCertificatePem();

    public string SignDigest(string digest)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(
                digest,
                "^[0-9a-f]{64}$"))
            throw new ArgumentException("Digest QZ inválido.", nameof(digest));

        using RSA? rsa = certificate.GetRSAPrivateKey();
        if (rsa is null)
            throw new InvalidOperationException("La clave privada QZ no es RSA.");

        byte[] data = Encoding.UTF8.GetBytes(digest);
        byte[] signature = rsa.SignData(
            data,
            HashAlgorithmName.SHA512,
            RSASignaturePadding.Pkcs1);

        return Convert.ToBase64String(signature);
    }

    public void Dispose() => certificate.Dispose();
}
```

Servir la hoja pública directamente desde el PFX cargado evita desplegar por error un `digital-certificate.txt` que no corresponda a la clave privada.

No aplicar `Trim()`, conversión a mayúsculas/minúsculas ni otro SHA-256. QZ 2.2.6 entrega un digest hexadecimal lowercase y deben firmarse exactamente sus 64 bytes ASCII/UTF-8.

### 10.3. Endpoints

```text
GET  /api/qz/certificate
POST /api/qz/sign
GET  /api/qz/health
GET  /api/qz/health/details
```

Fijar la ruta mediante `[Route("api/qz")]`; BarMaster no posee un prefijo `/api` global. Con el `VITE_BASE_URL` actual, el frontend usa rutas relativas `api/qz/...` y no debe agregar `/api` también al valor de `VITE_BASE_URL`.

`GET /api/qz/certificate`:

- Puede ser anónimo.
- Responde `text/plain; charset=utf-8`.
- Responde `Cache-Control: no-store`.
- Devuelve exactamente un PEM de la hoja firmante.
- Debe devolverse como texto crudo: `return Content(pem, "text/plain; charset=utf-8")`; no usar un objeto JSON ni envolverlo entre comillas.

`POST /api/qz/sign`:

- Requiere `[Authorize(Policy = "Printing.Use")]`.
- Acepta `{ "request": "64-caracteres-hexadecimales", "stationId": "guid" }`.
- Rechaza bodies sobredimensionados.
- Valida exactamente 64 caracteres `[0-9a-f]` y un GUID de estación.
- Fuera de `Development`, comprueba que la estación está habilitada y pertenece a la sucursal del JWT.
- Responde texto crudo mediante `return Content(signature, "text/plain; charset=utf-8")`; nunca `{ signature: ... }` ni un string JSON.
- Tiene rate limiting por tenant, sucursal, estación, `jti` e IP.
- No registra el digest o firma en logs normales.

`GET /api/qz/health` público:

- Devuelve únicamente `enabled` y `ready`.
- No expone rutas, fechas, pins ni inventario criptográfico.

`GET /api/qz/health/details` requiere `Printing.Diagnostics` y puede informar vencimiento, días restantes, versión de emisión y SHA-256 abreviado. Nunca expone rutas, contraseñas, claves ni el certificado completo.

### 10.4. Despliegue backend coordinado

El certificado servido y la clave firmante deben ser siempre el mismo par. En un backend con varias instancias, una actualización gradual podría hacer que `/certificate` responda desde una instancia nueva y `/sign` desde una vieja.

Para la primera versión productiva se usará una ventana coordinada: deshabilitar nuevas conexiones QZ, drenar o detener todas las instancias, desplegar el mismo artefacto PFX/configuración en todas, iniciarlas, verificar health y después forzar reconexión del frontend. No realizar rolling deploy con dos emisiones activas bajo las mismas rutas.

## 11. Integración en `frontendMozo`

### 11.1. Dependencia

```powershell
cd frontendMozo
npm install qz-tray@2.2.6 --save-exact
```

Versionar `package.json` y el lockfile actualizado.

### 11.2. Estructura

```text
frontendMozo/src/services/printing/
├── qzClient.js
├── qzConnection.js
├── qzPrinters.js
├── qzPrint.js
├── qzErrors.js
├── printingApi.js
└── stationStorage.js
```

QZ no debe guardarse en Redux ni Redux Persist. WebSockets, Promises y errores nativos son estado efímero.

Responsabilidades:

- `qzClient.js`: única importación de `qz-tray` y configuración de certificado/firma.
- `qzConnection.js`: única `connectPromise`, conexión, desconexión y versión.
- `qzPrinters.js`: enumeración y validación de nombres.
- `qzPrint.js`: configuración y envío raw/pixel.
- `printingApi.js`: endpoints QZ, estaciones y asignaciones; elige el JWT apropiado.
- `stationStorage.js`: identidad local y caché namespaced.
- `qzErrors.js`: normalización de errores para la UI.

Ningún componente React debe importar `qz-tray` directamente.

Crear un `PrintingProvider` con:

```text
idle
connecting
connected
unavailable
error
```

Montarlo únicamente en la rama `authType === 'sucursal'` de `App.jsx`, envolviendo el layout operativo. No montarlo en `/ticket/:tenant/:id`, login, panel de empresa ni antes de conocer `authType`. El Provider no autoconecta: solo administra estado y expone acciones.

### 11.3. Configurar seguridad una sola vez

```javascript
import qz from 'qz-tray';
import api from '../axiosInstance';
import { requireRegisteredStationId } from './stationStorage';

let configured = false;

export function configureQzSecurity() {
    if (configured) return;

    qz.security.setCertificatePromise((resolve, reject) => {
        api.get('api/qz/certificate', {
            responseType: 'text',
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then((response) => resolve(response.data))
            .catch(reject);
    });

    qz.security.setSignatureAlgorithm('SHA512');

    qz.security.setSignaturePromise((toSign) => {
        return (resolve, reject) => {
            api.post('api/qz/sign', {
                request: toSign,
                stationId: requireRegisteredStationId()
            }, {
                responseType: 'text',
                headers: { 'X-Printing-Station-ID': requireRegisteredStationId() }
            })
                .then((response) => resolve(response.data))
                .catch(reject);
        };
    });

    configured = true;
}
```

`VITE_BASE_URL` debe terminar en la raíz HTTPS del backend, por ejemplo `https://api.example.com/`. Las rutas QZ incluyen una sola vez `api/qz`; no configurar `VITE_BASE_URL` con `/api/` al final.

### 11.4. Conexión idempotente

Usar una Promise compartida para impedir que varios componentes abran conexiones simultáneas:

```javascript
let connectPromise = null;

export async function connectQz() {
    configureQzSecurity();

    if (qz.websocket.isActive()) return;
    if (connectPromise) return connectPromise;

    connectPromise = qz.websocket.connect({
        retries: 3,
        delay: 1
    }).finally(() => {
        connectPromise = null;
    });

    return connectPromise;
}

export async function disconnectQz() {
    if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
    }
}
```

No autoconectar desde el login. Conectar desde la pantalla de diagnóstico, una acción de impresión o un consumidor habilitado.

### 11.5. Impresoras

```javascript
await connectQz();
const printers = await qz.printers.find();
```

Reglas:

- No elegir automáticamente la primera impresora.
- Mostrar el nombre exacto reportado por QZ/Windows.
- Guardar asignaciones separadas por tenant, sucursal y estación.
- Antes de imprimir, confirmar que el nombre configurado sigue existiendo.
- Si desapareció, detener la impresión y mostrar `Impresora configurada no encontrada`.
- No cambiar silenciosamente a otra impresora.

### 11.6. Identidad local de estación

Identidades persistidas:

```text
barmaster.printing.stationId                                      # UUID estable de instalación/navegador
barmaster.printing.<tenantId>.<idSucursal>.stationId              # ID de estación emitido por backend
barmaster.printing.<tenantId>.<idSucursal>.<stationId>.assignments # caché local
```

Generar `ClientInstallationId` una sola vez con `crypto.randomUUID()`. No reutilizarlo como PK de `PrintingStation`: una misma instalación puede registrar estaciones independientes en sucursales diferentes. La respuesta idempotente de `POST /register` entrega el `stationId` autoritativo usado al firmar, consultar asignaciones y enviar heartbeat.

El logout general actual usa `localStorage.clear()`. No debe reemplazarse simplemente por quitar tokens, porque Redux Persist guarda datos operativos en `persist:root`.

Crear un único helper de logout que:

1. Desconecte QZ si está activo.
2. Elimine tokens, tenant, sucursal, usuario y todas las claves `USER_*`.
3. Purgue Redux Persist o elimine `persist:root` para impedir filtración de datos entre tenants.
4. Reinicie el estado React/Redux de sesión.
5. Preserve únicamente `barmaster.printing.stationId` y, si el backend ya es autoritativo, la caché namespaced de asignaciones.

El logout de persona y el interceptor `401` deben reutilizar la misma política de limpieza que les corresponda. Actualmente el interceptor deja datos auxiliares y Redux Persist sin purgar.

En producción, el backend será la fuente autoritativa de asignaciones; localStorage será solamente una caché de dispositivo.

## 12. Pantalla de configuración y diagnóstico

Crear una ruta protegida:

```text
/configuracion_impresion
```

La pantalla debe incluir:

- QZ conectado/alcanzable o conexión no disponible; no afirmar concluyentemente “no instalado” basándose solo en el error WebSocket.
- Estado de conexión.
- Versión QZ detectada y versión requerida.
- Estado del certificado del backend.
- Vencimiento y SHA-256 abreviado desde el health protegido.
- Identidad de estación.
- Lista y actualización de impresoras.
- Asignación por rol de impresión.
- Formato raw o pixel.
- Ancho 58/80 mm.
- Cantidad de copias.
- Botón de prueba raw.
- Botón de prueba PDF/PNG.
- Botón reconectar.
- Último error normalizado.
- Instrucciones de Local Network Access.
- Copia de diagnóstico sin secretos.

Ocultar el enlace de configuración no sustituye autorización backend. La reasignación debe requerir permiso administrativo; un cajero puede tener acceso solo a diagnóstico, reconexión y prueba.

Crear `frontendMozo/src/pages/ConfiguracionImpresion/ConfiguracionImpresion.jsx`, agregar la ruta en la rama de sucursal y el enlace en `NavBar_Botones.jsx`. El `Control_Login` actual no restaura `logeadoUsuario` al recargar: antes de reutilizarlo, inicializar ese estado desde un `USER_token` válido o crear un `RoleGuard` equivalente. La política `Printing.Configure` del backend sigue siendo la autoridad final.

## 13. Persistencia de estaciones e impresoras

La configuración productiva se almacena en cada base tenant.

```text
PrintingStation
- Id: Guid
- IdSucursal: Guid
- ClientInstallationId: Guid
- Name: string
- Enabled: bool
- CreatedAt: DateTime UTC
- LastSeenAt: DateTime UTC nullable
- RevokedAt: DateTime UTC nullable

PrinterAssignment
- Id: Guid
- StationId: Guid
- Role: Preticket | PaymentReceipt | Kitchen | Bar
- QzPrinterName: string
- Format: Raw | Pdf | Png
- PaperWidthMm: 58 | 80
- Copies: short
- Enabled: bool
- UpdatedAt: DateTime UTC
```

Restricciones:

- FK estación → sucursal con borrado `Restrict`.
- FK asignación → estación con borrado `Cascade`.
- Unique `(IdSucursal, ClientInstallationId)`.
- Unique `(StationId, Role)`.
- `Copies` entre 1 y un máximo configurado.
- `PaperWidthMm` limitado a los anchos soportados.
- El backend deriva tenant y sucursal desde claims; no confía en un `IdSucursal` del body.

Endpoints:

```text
POST  /api/printing/stations/register
POST  /api/printing/stations/{id}/heartbeat
GET   /api/printing/stations/current
GET   /api/printing/stations/{id}/assignments
PUT   /api/printing/stations/{id}/assignments/{role}
PATCH /api/printing/stations/{id}/enabled
```

`register` es idempotente por sucursal e instalación. Consultar y reportar heartbeat requiere `Printing.Use`; modificar o habilitar requiere `Printing.Configure`.

Agregar entidades, configuraciones EF, `DbSet` e índices a `AppDbContext`, y generar una migración tenant. Aplicarla a todas las bases existentes mediante una herramienta administrativa con dry-run, backup y log por tenant. No utilizar el endpoint público `/migrar` de `Controllers/Test.cs`; debe eliminarse de producción o compilarse únicamente en `Development`.

## 14. Impresión

### 14.1. Raw mínima

```javascript
const config = qz.configs.create(printerName, {
    copies: 1,
    jobName: 'BarMaster QZ Test'
});

const data = [{
    type: 'raw',
    format: 'command',
    flavor: 'plain',
    data: 'BARMASTER QZ TEST\n\n\n'
}];

await qz.print(config, data);
```

Primero validar texto ASCII. Después probar:

- Codificación y caracteres `áéíóúñ`.
- Avance de papel.
- Corte.
- Apertura de cajón, si aplica.
- Comandos ESC/POS del modelo real.

### 14.2. Pixel

Para PDF/PNG usar el driver oficial del fabricante y las opciones de tamaño QZ acordes al rollo.

Ejemplo PDF Base64, evitando que QZ tenga que descargar un recurso protegido por Bearer:

```javascript
const config = qz.configs.create(printerName, {
    copies: 1,
    jobName: 'BarMaster PDF Test',
    units: 'mm',
    margins: 0,
    scaleContent: true
});

const data = [{
    type: 'pixel',
    format: 'pdf',
    flavor: 'base64',
    data: pdfBase64
}];

await qz.print(config, data);
```

El PDF debe generarse previamente con el ancho y alto de página correctos. No fijar una altura genérica en QZ sin probar el driver: el papel continuo, los márgenes no imprimibles y el corte varían por modelo.

No usar `Generic / Text Only` para PDF, HTML o imágenes. Esa cola es apropiada para raw, no para contenido pixel.

Preferencia:

1. Driver oficial con soporte adecuado para raw y pixel.
2. Si no existe modo dual, crear dos colas lógicas:
   - `BarMaster Caja Pixel`.
   - `BarMaster Caja Raw`.

En Windows, QZ Tray 2.2.6 documenta y aplica que `forceRaw` no está soportado como bypass: si se solicita, QZ lo desactiva. Usar una cola o driver compatible con raw.

### 14.3. Integración inicial en la interfaz

El botón `Imprimir Preticket` existente y actualmente inerte es el punto recomendado para el primer POC.

Para el POC imprimirá un snapshot de los productos no pagados de la visita, agrupados por nombre, precio e indicaciones, con sucursal, mesa, fecha/hora, cantidades, subtotales y total. Debe usar `PrecioDelMomento`, no el precio actual del catálogo.

Cambios concretos:

1. Agregar `onPrintPreticket` y `printing` a `MesaModalActions`.
2. Asignar `onClick={onPrintPreticket}` y deshabilitar el botón si no hay productos imprimibles o ya hay una impresión en curso.
3. Crear `handlePrintPreticket` en `MesaModalUnificado`.
4. Entregar al generador un snapshot de `visitaMesa.productosConsumidos`, no solo IDs.
5. Informar resultado mediante el mecanismo de notificaciones existente.

Secuencia:

1. Verificar sesión, estación y productos imprimibles.
2. Conectar QZ.
3. Resolver la impresora asignada al rol `Preticket`.
4. Confirmar que todavía existe.
5. Preparar el payload.
6. Ejecutar `qz.print()`.
7. Mostrar `Enviado a la impresora`.
8. Registrar o mostrar el error si QZ rechaza el trabajo.

No abrir una pestaña nueva, no usar `window.print()` y no invocar el endpoint deprecado `Pedidos/GenerarTicketPDF`.

## 15. Instalar QZ en la PC piloto

### 15.1. Verificar el instalador

Descargar QZ Tray 2.2.6 desde la release oficial, eligiendo el artefacto según la arquitectura:

| Arquitectura Windows | Archivo | SHA-256 verificado |
|---|---|---|
| x64 Intel/AMD | `qz-tray-2.2.6-x86_64.exe` | `AEB93A601C27F5FA6BB464F63471E7ACD43052BA384FEF49DCEEC8290D4F7587` |
| ARM64 | `qz-tray-2.2.6-arm64.exe` | `EC08EEE87768753651C9F3E1EF0E83A297A0B9E8950793875D686931228A7069` |

URLs fijadas:

```text
https://github.com/qzind/tray/releases/download/v2.2.6/qz-tray-2.2.6-x86_64.exe
https://github.com/qzind/tray/releases/download/v2.2.6/qz-tray-2.2.6-arm64.exe
```

No usar `latest` ni intentar instalar el binario de otra arquitectura.

```powershell
$installerPath = '.\qz-tray-2.2.6-x86_64.exe'
$expectedSha256 = 'AEB93A601C27F5FA6BB464F63471E7ACD43052BA384FEF49DCEEC8290D4F7587'

$signature = Get-AuthenticodeSignature -LiteralPath $installerPath
if ($signature.Status -ne 'Valid') {
    throw "Firma Authenticode inválida: $($signature.StatusMessage)"
}

if ($signature.SignerCertificate.Subject -notmatch 'CN=QZ Industries LLC(?:,|$)') {
    throw "Editor inesperado: $($signature.SignerCertificate.Subject)"
}

$actualSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $installerPath).Hash
if ($actualSha256 -ne $expectedSha256) {
    throw "SHA-256 inesperado: $actualSha256"
}
```

Para ARM64 cambiar simultáneamente archivo y SHA-256. Authenticode autentica el editor; el hash fija exactamente el artefacto probado. El hash por sí solo no autentica la procedencia si se obtiene del mismo canal que un archivo manipulado.

### 15.2. Instalación interactiva

1. Instalar QZ como administrador.
2. Iniciar sesión como el usuario real de caja.
3. Verificar el icono QZ en la bandeja.
4. Verificar inicio automático con esa sesión.
5. Probar `https://demo.qz.io`.
6. Enumerar impresoras.
7. Ejecutar una prueba antes de aplicar la raíz BarMaster.

QZ 2.1+ configura el inicio automático al iniciar sesión. No confundirlo con un servicio al arrancar Windows.

### 15.3. Aplicar la raíz

Usar una única alternativa. Para el piloto:

1. Cerrar QZ desde el icono de bandeja → `Exit` bajo el usuario de caja.
2. Ejecutar solamente la copia de la raíz con PowerShell elevado.
3. No usar `Stop-Process java*`, porque podría finalizar otras aplicaciones Java.

Copiar:

```powershell
Copy-Item `
    -LiteralPath 'C:\RutaSegura\barmaster-qz-root.crt.pem' `
    -Destination 'C:\Program Files\QZ Tray\override.crt' `
    -Force
```

El archivo debe contener solamente la raíz pública. No iniciar QZ desde la consola elevada: podría ejecutarse como administrador, usar otro perfil y ver otras colas. Terminar la fase administrativa y después abrir QZ desde el menú Inicio bajo el usuario de caja, o cerrar sesión y volver a iniciarla.

Alternativa:

```properties
authcert.override=C:\ProgramData\BarMaster\qz\barmaster-qz-root.crt.pem
```

Para localizar `qz-tray.properties`: QZ Tray → `Advanced` → `Diagnostic` → `Browse App Folder`.

No usar `override.crt` y `authcert.override` simultáneamente.

No instalar la raíz BarMaster en el almacén general `Trusted Root` de Windows para este uso. La raíz autentica mensajes QZ y no reemplaza los certificados TLS locales que QZ administra para su WebSocket.

### 15.4. Whitelist

Con una CA propia válida, la hoja encadenada a `override.crt` debe ser confiable. La whitelist no forma parte del camino principal y no repara una cadena inválida.

Usarla solo como diagnóstico si una instalación concreta sigue mostrando el diálogo QZ:

```cmd
"C:\Program Files\QZ Tray\qz-tray-console.exe" --allow "C:\ruta\digital-certificate.txt"
```

Ejecutar bajo el usuario Windows que operará QZ. No editar manualmente `allowed.dat`.

Antes de usar este fallback, confirmar en los logs que QZ cargó la raíz correcta y corregir primero ruta, PEM, permisos, fechas y cadena.

## 16. Diálogos y permisos

### 16.1. Diálogo QZ

Desaparece cuando:

- QZ recibe la hoja pública correcta.
- La hoja encadena a la raíz configurada.
- La hoja está vigente.
- El backend firma el digest exacto.
- El algoritmo es SHA-512.
- La firma se devuelve como Base64.
- La operación no está bloqueada en QZ.

Si aparece, revisar en este orden:

1. Certificado cargado por el navegador.
2. SHA-256 de la hoja servida y, por separado, fingerprint SHA-1 que QZ muestra internamente.
3. PFX y hoja correspondientes.
4. `override.crt` correcto.
5. Fecha/hora de la PC.
6. Logs QZ.
7. Firma y algoritmo.
8. `blocked.dat` o Site Manager.

### 16.2. Diálogo de impresión del navegador

BarMaster no debe llamar `window.print()`. El envío debe hacerse mediante `qz.print(config, data)`, que dirige el trabajo a la cola configurada sin abrir el diálogo estándar del navegador.

### 16.3. Local Network Access

Chrome y Edge pueden mostrar un permiso similar a:

```text
Permitir que este sitio acceda a aplicaciones y servicios en este dispositivo
```

Este permiso:

- Es independiente del certificado y la firma QZ.
- No desaparece instalando `override.crt`.
- Debe concederse al origen HTTPS de BarMaster en cada perfil y navegador utilizado, o preautorizarse mediante política empresarial por dominio.
- Puede reaparecer si cambian dominio, puerto, perfil o permisos del sitio.
- Ignorarlo tres veces equivale a bloquearlo según la documentación QZ.

BarMaster debe explicar el permiso antes del primer intento y ofrecer instrucciones para corregirlo desde los permisos del sitio. QZ Tray 2.2.6 no ofrece una detección LNA concluyente: un fallo de conexión debe presentarse como causa probable, junto con comprobaciones de QZ abierto, HTTPS, proxy/antivirus y permiso del sitio.

En entornos administrados puede utilizarse una política del navegador como `LocalNetworkAccessAllowedForUrls` o su equivalente vigente. Verificar el nombre y soporte en la versión exacta de Chrome/Edge antes de incorporarla al instalador; no existe una whitelist LNA universal que QZ gratuito pueda aplicar por aplicación.

Fuente: [QZ: Local Network Access](https://qz.io/docs/lna)

## 17. HTTPS

El frontend actual utiliza una URL HTTP en la red local. Eso debe corregirse antes de aprobar QZ en Chrome/Edge actuales.

Requisitos:

- Frontend servido mediante HTTPS.
- Backend accesible mediante HTTPS.
- Certificado TLS válido para el nombre usado por las cajas.
- `VITE_BASE_URL` apuntando al backend HTTPS.
- CORS limitado al origen HTTPS del frontend.
- Sin contenido mixto HTTP dentro de la aplicación.

No confundir:

- Certificado TLS del sitio BarMaster.
- Certificados locales administrados por QZ para WebSocket.
- Autoridad propia usada para firmar mensajes QZ.

Son tres funciones independientes.

## 18. Instalador y reparación Windows

Crear una carpeta versionada sin secretos:

```text
tools/qz/windows/
├── Install-BarMasterQz.ps1
├── Repair-BarMasterQz.ps1
├── Test-BarMasterQz.ps1
├── qz-manifest.json
└── public/
    └── override.crt
```

El instalador debe:

1. Validar Windows y arquitectura.
2. Solicitar elevación únicamente para instalar QZ y copiar archivos bajo `Program Files`.
3. Descargar o utilizar el instalador oficial fijado.
4. Verificar Authenticode y SHA-256.
5. Instalar silenciosamente QZ desde PowerShell y comprobar el código de salida:

```powershell
$process = Start-Process `
  -FilePath $installerPath `
  -ArgumentList '/S' `
  -Wait `
  -PassThru

if ($process.ExitCode -ne 0) {
  throw "La instalación de QZ Tray falló con código $($process.ExitCode)."
}
```

No usar `start /wait` dentro de un script PowerShell: `start` es un alias de `Start-Process` y no acepta la sintaxis de `cmd.exe`. El nombre del archivo debe salir del manifiesto según la arquitectura, no estar escrito a mano.

6. Comprobar la versión instalada con `qz-tray-console.exe --version` y rechazar una versión distinta de la fijada.
7. Pedir al usuario que cierre QZ desde el icono de bandeja mediante **Exit** antes de copiar la raíz. No finalizar procesos `java*`, porque podrían pertenecer a otra aplicación.
8. Copiar y verificar `override.crt`.
9. Terminar la fase elevada.
10. Iniciar QZ sin elevación dentro de la sesión interactiva del cajero y comprobar que queda en la bandeja.
11. Abrir `/configuracion_impresion` en el mismo usuario y perfil de navegador que se usarán en producción.
12. Guiar el permiso Local Network Access.
13. Ejecutar pruebas raw y pixel.
14. Guardar logs sin secretos.

La separación entre las fases elevada e interactiva es obligatoria. Si el instalador inicia QZ como administrador, puede crear estado en otro contexto y no valida el funcionamiento real del usuario de caja.

El manifiesto debe contener una entrada independiente por arquitectura:

| Arquitectura | Archivo | URL oficial | SHA-256 |
|---|---|---|---|
| x64 | `qz-tray-2.2.6-x86_64.exe` | `https://github.com/qzind/tray/releases/download/v2.2.6/qz-tray-2.2.6-x86_64.exe` | `AEB93A601C27F5FA6BB464F63471E7ACD43052BA384FEF49DCEEC8290D4F7587` |
| ARM64 | `qz-tray-2.2.6-arm64.exe` | `https://github.com/qzind/tray/releases/download/v2.2.6/qz-tray-2.2.6-arm64.exe` | `EC08EEE87768753651C9F3E1EF0E83A297A0B9E8950793875D686931228A7069` |

Además debe registrar `version`, el sujeto Authenticode esperado que contenga `CN=QZ Industries LLC` y el SHA-256 esperado de `public/override.crt`. Validar primero `Status -eq 'Valid'`, después el sujeto y por último los dos hashes. El nombre del firmante por sí solo no prueba la integridad.

El modo reparación debe:

- Detectar instalación y versión.
- Verificar QZ en ejecución.
- Comparar el SHA-256 de `override.crt`.
- Reponer la raíz si falta o no coincide.
- Verificar accesibilidad del backend HTTPS.
- Abrir el diagnóstico BarMaster.
- No borrar configuraciones o listas QZ sin respaldo.
- Recopilar, bajo el usuario real de caja, la versión, arquitectura, estado de firma, URL/origen, impresoras visibles y los logs de `%APPDATA%\qz`.
- Permitir generar el ZIP de diagnóstico desde **Advanced → Troubleshooting → Zip Logs** y ejecutar `qz-tray-console.exe` cuando se necesite observar el arranque.

No versionar el instalador `.exe` de QZ dentro del repositorio. Mantener versión, URLs, hashes, firmante y SHA-256 de la raíz en `qz-manifest.json`.

### 18.1. Actualización controlada de QZ

QZ no debe actualizarse automáticamente sin validar la aplicación. Para adoptar una versión nueva:

1. Crear un nuevo manifiesto fijando versión, archivos por arquitectura, URLs, SHA-256 y firmante.
2. Descargar desde el release oficial y repetir la validación Authenticode/hash.
3. Validar en laboratorio la conexión, firma, Local Network Access, raw, pixel, corte y cajón que estén en uso.
4. Instalar sobre la versión existente en una caja piloto; no desinstalar primero salvo que la documentación de esa versión lo exija.
5. Confirmar que `override.crt` sigue presente y coincide, que el inicio de sesión funciona y que QZ reporta la versión esperada.
6. Observar el piloto antes de desplegar por lotes.

Conservar el instalador y manifiesto previamente aprobados en el repositorio interno de artefactos para una contingencia. Antes de afirmar que existe rollback, ensayar en una VM si el instalador anterior admite el downgrade y si preserva la configuración. Si no está probado, la recuperación soportada es restaurar el snapshot/imagen de la estación o reinstalar de manera controlada; no prometer un downgrade automático.

## 19. Rotación e incidentes

### 19.1. Renovación normal de la hoja

Renovar 60 días antes del vencimiento:

1. Crear una nueva carpeta de emisión inmutable; no sobrescribir la emisión anterior.
2. Generar nueva clave firmante RSA 2048.
3. Crear CSR.
4. Firmar con la misma raíz offline.
5. Validar extensiones, cadena, correspondencia de claves y vigencia.
6. Crear PFX.
7. Desplegar PFX y configuración como una unidad versionada y coordinada en todas las instancias.
8. Reiniciar ordenadamente el backend.
9. Forzar una reconexión QZ controlada.
10. Ejecutar impresión de prueba.

Con la misma raíz no debe ser necesario reemplazar `override.crt` en cada caja. Mantener archivados el certificado público, serial y metadatos de la emisión anterior; la clave anterior solo se conserva cifrada offline si la política de auditoría lo requiere.

### 19.2. Hoja comprometida

Si solo se abusó del endpoint pero no se extrajo la clave, revocar credenciales/tokens, cerrar la exposición y revisar auditoría puede ser suficiente. Si la clave privada de la hoja fue o pudo haber sido extraída:

1. Deshabilitar inmediatamente el endpoint de firma.
2. Conservar evidencia y el certificado público anterior; no reutilizar la clave.
3. Crear nueva clave y hoja.
4. Desplegar el nuevo PFX de manera coordinada.
5. Bloquear la hoja anterior en cada caja:

```cmd
"C:\Program Files\QZ Tray\qz-tray-console.exe" --block "C:\ruta\old-digital-certificate.txt"
```

6. Verificar el bloqueo desde Site Manager o logs.
7. Revisar accesos y rotar secretos relacionados.
8. Reactivar el firmador y ejecutar una impresión controlada.

QZ 2.2.6 deshabilita la comprobación de revocación PKIX en este flujo. Emitir una hoja nueva no invalida automáticamente la anterior: el bloqueo debe llegar a todas las estaciones afectadas.

### 19.3. Raíz comprometida

La sustitución debe realizarse en una ventana coordinada; no asumir que QZ admite simultáneamente dos raíces personalizadas mediante `override.crt`.

1. Deshabilitar el firmador anterior.
2. Crear offline una raíz y una hoja nuevas.
3. Distribuir el nuevo `override.crt` con QZ cerrado en cada caja.
4. Desplegar coordinadamente el nuevo PFX en todas las instancias backend.
5. Iniciar QZ, reconectar y verificar certificado/firma en cada estación.
6. Bloquear los certificados anteriores y verificar toda la flota.
7. Reactivar el servicio por lotes controlados.

La pérdida de la clave raíz sin indicios de copia no vuelve inválidos de inmediato los certificados ya emitidos, pero impide renovarlos. Se debe crear una raíz nueva y migrar todas las estaciones antes de que venza la hoja activa. Si hay sospecha de compromiso, aplicar el procedimiento urgente anterior.

## 20. Pruebas automatizadas

### 20.1. Backend

Crear `BackEndAPI.Tests` con xUnit.

Crear el proyecto con el SDK .NET que usa la solución, agregarlo al `.sln` y referenciar `BackEndAPI`. Incluir paquetes de prueba (`Microsoft.NET.Test.Sdk`, `xunit`, `xunit.runner.visualstudio`) en versiones compatibles con ese SDK. Ejecutar al menos `dotnet test` desde la raíz de la solución.

Casos mínimos:

- Digest hexadecimal de 64 caracteres.
- Digest en minúsculas aceptado y en mayúsculas rechazado, de acuerdo con el contrato canónico.
- Longitud incorrecta.
- Caracteres no hexadecimales.
- PFX sin clave privada.
- Clave no RSA.
- Clave con tamaño incorrecto.
- Certificado vencido o todavía no vigente.
- Cadena no válida, raíz distinta y extensiones de CA/hoja incorrectas.
- SHA-256 de hoja o raíz distinto del configurado.
- Contraseña incorrecta.
- Firma verificable con RSA/SHA-512/PKCS#1.
- Endpoint certificado con un único PEM y `no-store`.
- Endpoints de certificado y firma con cuerpo `text/plain`, no una cadena JSON entre comillas.
- Servicio deshabilitado: `503` estable y health público mínimo con `enabled:false` y `ready:false`.
- `401` sin autenticación.
- `403` sin política.
- `400` para digest inválido.
- `429` por rate limit.
- `200` y firma Base64 verificable.
- Estación inexistente, deshabilitada, de otra sucursal o tenant.
- Diferencia entre JWT de sucursal y credencial administrativa de persona.
- Despliegue con dos instancias: certificado y clave deben corresponder a la misma versión.

Los certificados de prueba deben generarse con `CertificateRequest`. Cuando la API que se prueba requiera una ruta PFX, exportarlo a un directorio temporal exclusivo del test y eliminarlo en `Dispose`/`finally`. Nunca versionar un PFX de prueba.

### 20.2. Frontend

Incorporar Vitest y mockear QZ.

Agregar scripts `test`/`test:run`, un entorno DOM compatible con React y las librerías de test necesarias, fijando versiones compatibles con el Vite/React existentes. El comando no interactivo debe ejecutarse en CI.

Casos:

- Seguridad configurada una sola vez.
- Conexión idempotente.
- Reintentos limitados.
- Certificado obtenido desde el endpoint correcto.
- Digest enviado sin modificar.
- Listado de impresoras.
- Impresora configurada ausente.
- Impresión raw correcta.
- Impresión pixel correcta.
- Error de firma `401`, `403` y `429`.
- QZ no disponible.
- Reconexión después de cierre de QZ.
- Persistencia namespaced de estación/asignación.
- Logout preserva `stationId`.
- Logout elimina tokens, usuario y Redux Persist sensible, desconecta QZ y conserva solo las claves locales de estación permitidas.
- Una asignación de otra estación, sucursal o tenant no se reutiliza.

### 20.3. Scripts Windows

- Análisis estático.
- Modo `-WhatIf` o dry-run.
- Instalación en VM limpia con snapshot.
- Reparación con raíz ausente.
- Reparación con raíz incorrecta.
- Actualización sobre una versión existente.
- Validación de ambos manifiestos x64/ARM64 y rechazo de arquitectura no soportada.
- Código de salida no cero, Authenticode inválido, hash incorrecto y versión instalada distinta.
- Ejecución bajo usuario de caja.

## 21. Matriz física obligatoria

### QZ y navegador

- QZ instalado y abierto.
- QZ cerrado.
- QZ no instalado.
- Certificado válido.
- Certificado incorrecto.
- Firma inválida.
- Local Network Access pendiente, permitido y bloqueado.
- Reinicio de navegador.
- Reinicio de Windows.
- Usuario Windows diferente.
- Dos pestañas abiertas.
- Pérdida temporal del backend.

### Impresora

- Impresora encontrada.
- Nombre cambiado.
- Apagada.
- Sin papel.
- Tapa abierta.
- Cola pausada.
- USB desconectado o red caída.
- Driver oficial.
- Cola Generic/Text.
- Texto raw.
- PDF/PNG.
- Acentos y `ñ`.
- Ticket largo.
- Papel 58 y 80 mm según alcance del modelo.
- Corte y cajón si se utilizan.

### Operación

- Doble clic en imprimir.
- Impresión simultánea desde dos pestañas.
- Cambio de impresora configurada.
- Reinicio mientras hay una impresión en curso.
- Reintento del mismo documento.
- Usuario sin permiso de impresión.
- Estación deshabilitada.

## 22. Criterios de aceptación

### Integración técnica

- `qz-tray@2.2.6` fijado.
- Backend sirve un certificado válido y firma correctamente.
- Health detallado reporta los SHA-256 esperados sin exponer secretos.
- Frontend conecta y enumera impresoras.
- La impresora se elige explícitamente.
- El cliente no utiliza `window.print()`.
- No aparece el diálogo estándar de impresión del navegador.
- No aparece el diálogo QZ en operaciones firmadas.
- Local Network Access está documentado y diagnosticado.

### Seguridad

- Tenant vinculado al JWT.
- Política `Printing.Use` activa.
- CORS restringido en producción.
- Rate limiting activo.
- PFX fuera del repositorio.
- Contraseña en secret manager/User Secrets.
- Firmador deshabilitable.
- Estación y sucursal validadas.
- La estación está registrada, activa y sus asignaciones pertenecen al mismo tenant/sucursal.

### Windows y hardware

- QZ inicia con el usuario de caja.
- `override.crt` sobrevive reinicios.
- Driver y nombre de impresora validados.
- Raw y pixel probados según uso.
- Errores principales distinguibles.
- Reinicio de Windows no rompe la configuración.
- Impresión física confirmada por un operador.

## 23. Orden de implementación

1. Actualizar la tabla de fases a `En curso` para la fase que se inicia.
2. Corregir seguridad tenant/JWT, CORS y política de impresión.
3. Ampliar `.gitignore` y agregar validaciones de secretos.
4. Crear PKI de desarrollo fuera del repositorio.
5. Implementar el modelo y registro de estaciones/asignaciones.
6. Implementar Options, validación y servicio de firma.
7. Implementar endpoints QZ y tests backend; mantener el firmador deshabilitado fuera de desarrollo hasta validar estaciones.
8. Instalar `qz-tray@2.2.6`.
9. Implementar cliente singleton y tests frontend.
10. Crear identidad local de estación y corregir logout selectivo.
11. Crear pantalla de configuración y diagnóstico.
12. Conectar el botón de preticket a la impresión raw.
13. Probar impresión pixel.
14. Instalar QZ en la PC piloto.
15. Aplicar la raíz de desarrollo.
16. Resolver Local Network Access.
17. Ejecutar matriz física.
18. Crear y validar el instalador/reparador.
19. Crear PKI de producción mediante ceremonia offline.
20. Desplegar una estación piloto.
21. Observar jornadas reales.
22. Desplegar gradualmente.

## 24. Fuentes técnicas primarias

- [QZ: firma de mensajes](https://qz.io/docs/signing)
- [QZ: ejemplos de firma](https://qz.io/docs/signing-examples)
- [QZ: provisionamiento](https://qz.io/docs/provisioning)
- [QZ: despliegue desatendido](https://qz.io/docs/deployment)
- [QZ: comandos](https://qz.io/docs/command-line)
- [QZ: Local Network Access](https://qz.io/docs/lna)
- [QZ: impresión raw](https://qz.io/docs/raw)
- [QZ: impresión pixel/PDF](https://qz.io/docs/pixel)
- [QZ: estado de impresoras](https://qz.io/docs/printer-status)
- [QZ 2.2.6: parser/validador X.509](https://github.com/qzind/tray/blob/4be94301797d04684f4d70c6bbbff5d9acc36987/src/qz/auth/Certificate.java)
- [QZ 2.2.6: opciones de impresión](https://github.com/qzind/tray/blob/4be94301797d04684f4d70c6bbbff5d9acc36987/src/qz/printer/PrintOptions.java)
- [QZ 2.2.6: comandos disponibles](https://github.com/qzind/tray/blob/4be94301797d04684f4d70c6bbbff5d9acc36987/src/qz/utils/ArgValue.java)
- [QZ 2.2.6: cliente JavaScript](https://github.com/qzind/tray/blob/4be94301797d04684f4d70c6bbbff5d9acc36987/js/qz-tray.js)
- [QZ 2.2.6: ejemplo oficial .NET](https://github.com/qzind/tray/blob/4be94301797d04684f4d70c6bbbff5d9acc36987/assets/signing/sign-message.core.cs)
- [OpenSSL: `genpkey`](https://docs.openssl.org/3.0/man1/openssl-genpkey/)
- [OpenSSL: `req`](https://docs.openssl.org/3.0/man1/openssl-req/)
- [OpenSSL: `x509`](https://docs.openssl.org/3.0/man1/openssl-x509/)
- [OpenSSL: `pkcs12`](https://docs.openssl.org/3.0/man1/openssl-pkcs12/)
- [Release oficial QZ Tray 2.2.6](https://github.com/qzind/tray/releases/tag/v2.2.6)
- [Registro oficial NPM: `qz-tray` 2.2.6](https://registry.npmjs.org/qz-tray/2.2.6)

## 25. Nota de aprobación

El alcance de este documento termina cuando BarMaster puede conectarse a QZ Tray, seleccionar una impresora Windows, enviar trabajos raw o pixel sin usar el diálogo de impresión del navegador y operar sin diálogos QZ gracias a la firma con certificado propio.

Este documento queda técnicamente aprobado como base de implementación: sus versiones, comandos PKI, artefactos, contratos, límites de seguridad y procedimiento Windows fueron contrastados con las fuentes primarias citadas y con las pruebas reproducibles enumeradas en 4.1.

La aprobación operativa final queda necesariamente condicionada a una prueba en la PC, sesión de Windows, navegador, driver e impresora que se utilizarán realmente. La documentación y los tests automatizados no sustituyen la confirmación física del papel, corte, márgenes y comportamiento del dispositivo.
