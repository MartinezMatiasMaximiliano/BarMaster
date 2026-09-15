# Instalador descargable de impresión

`/primeros_pasos` (Ayuda → Primeros pasos) ofrece `BarMaster-Impresion-Setup.exe`. Incluye únicamente los scripts,
el manifiesto, los logos y la raíz pública de BarMaster. Descarga QZ Tray del repositorio oficial
por HTTPS cuando falta o cuando la versión instalada es anterior a la del manifiesto;
verifica SHA-256 y firma Authenticode antes de ejecutarlo. Una versión más nueva se
conserva. Se necesita Windows 10/11 de 64 bits (x64 o ARM64).

El usuario abre el ejecutable, elige **Instalar y configurar** y acepta UAC. La fase
elevada instala QZ, cierra sus instancias mediante `preinstall`, coloca `override.crt`
en la carpeta de QZ y configura `authcert.override`. El proceso original abre QZ con
el usuario habitual, sin heredar la elevación. No ejecutar durante impresiones.
Las utilidades auxiliares se ejecutan con `UseShellExecute=false` y
`CreateNoWindow=true`; su salida estándar y de error se captura en el registro
de instalación. `preinstall` usa directamente la JVM incluida en QZ para evitar
que el launcher de consola abra una terminal adicional. El arranque final utiliza
`qz-tray.exe`, la variante gráfica.
No instala la raíz en el almacén general de Windows, ni distribuye claves privadas.

## Generación

Desde la raíz del repositorio en Windows:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/qz/windows/Build-PrintingSetup.ps1
```

Usa el compilador .NET Framework incluido en Windows, sin instalar herramientas.
El ícono del ejecutable y de la ventana se genera desde `frontendMozo/public/logo/favicon.png`
en tamaños de 16 a 256 píxeles. El diálogo incorpora `logo_completo.png` como recurso
embebido y mantiene su proporción. Ninguna de las imágenes depende de conexión al servidor.
`npm run dev` y `npm run build` lo regeneran automáticamente en Windows.
Genera el ejecutable en `frontendMozo/public/downloads`; Vite lo sirve en desarrollo
y lo copia a `dist/downloads` al compilar. Los binarios generados no se versionan.
Ejecutar este paso antes del build del frontend en cada publicación. En CI Linux,
transferir el artefacto generado en Windows antes del build.

Si se cambia la raíz firmante del backend, actualizar `public/override.crt` y su hash
en `qz-manifest.json`, regenerar el instalador y volver a instalarlo en cada equipo.
El certificado del paquete debe corresponder a la raíz usada por el backend.

El build ejecuta `--verify`: extrae y valida los recursos con Windows PowerShell 5.1
sin elevar, descargar ni instalar. Los registros se guardan en una carpeta única
`%TEMP%\BarMaster-Qz-*\instalacion.log`. Esto no sustituye una prueba de instalación
completa en una máquina Windows limpia. El ejecutable BarMaster no está firmado:
Windows o el navegador pueden mostrar una advertencia de editor desconocido.
Para distribución pública, firmar el artefacto generado con el certificado de firma
de código del distribuidor. El instalador oficial QZ conserva su firma y se verifica.

Para revisar el diálogo sin instalar, ejecutar el `.exe` con `--preview` seguido
de una ruta absoluta a un PNG. Renderiza la ventana fuera de pantalla y termina;
no solicita UAC ni inicia el proceso de instalación.

Referencias: https://qz.io/docs/signing y https://qz.io/docs/command-line.
