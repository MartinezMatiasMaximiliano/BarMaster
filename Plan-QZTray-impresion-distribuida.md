# Plan de impresión distribuida con QZ Tray en BarMaster

> Estado: implementación de software terminada y verificada; pendiente únicamente el piloto físico multi-PC y, después de aprobarlo, el retiro irreversible del flujo heredado.
>
> Fecha de revisión: 3 de septiembre de 2026.
>
> Documento relacionado: `Instalar-qztray.md` continúa siendo la referencia para certificados, firma, instalación y diagnóstico de QZ Tray. Este documento describe la evolución funcional necesaria para imprimir entre distintas computadoras de una sucursal.

## 1. Objetivo

Permitir que cualquier dispositivo autorizado de una sucursal —aunque no tenga una impresora instalada— solicite una impresión y que el backend la dirija a la computadora que realmente puede acceder a la impresora elegida.

Ejemplo obligatorio:

```text
PC del mozo (sin impresora)
        │
        │ solicita el preticket de la mesa 12
        ▼
Backend de BarMaster
        │
        │ crea y conserva un trabajo para “Ticketera principal”
        ▼
PC de caja
        │
        │ entrega el trabajo a QZ Tray local
        ▼
KP-1025 conectada por USB
```

La solución también debe soportar:

- Varias sucursales completamente aisladas.
- Varias computadoras dentro de una sucursal.
- Cero, una o varias impresoras por computadora.
- Impresoras USB, Bluetooth, Ethernet, Wi-Fi o compartidas, siempre que el sistema operativo de la estación receptora las exponga como una cola de impresión válida.
- Una impresora utilizada por varias acciones.
- Una acción enviada intencionalmente a varias impresoras.
- Impresoras temporalmente desconectadas.
- Reinicios del backend, navegador, estación o QZ Tray sin perder trabajos pendientes.
- Prevención de duplicados dentro de los límites que permite el spooler de impresión.
- Diagnóstico comprensible para el usuario y diagnóstico técnico para soporte.

## 2. Alcance y límites

### 2.1. Incluido

- Inventario de estaciones e impresoras locales.
- Nombres amigables para estaciones e impresoras.
- Reglas de destino por sucursal.
- Solicitudes de preticket desde computadoras sin impresora.
- Comandas separadas por sector de producción, cuando dichos sectores se incorporen al modelo de productos.
- Cola persistente de trabajos.
- Notificaciones en tiempo real y recuperación mediante consulta periódica.
- Ejecución local a través de QZ Tray.
- Estados, reintentos seguros, auditoría, reimpresión y cancelación.
- Instalación operativa en cada computadora que aloje impresoras.
- Pruebas unitarias, de integración, concurrencia, seguridad y piloto físico.

### 2.2. Fuera de alcance

- ARCA y facturación electrónica. Ese circuito pertenece a otra rama; aquí solo se recibe un documento autorizado para imprimir.
- Modificación de drivers o firmware de impresoras.
- Confirmación física universal de que salió papel. QZ puede obtener estados del spooler y de algunos drivers, pero el nivel de detalle depende del hardware y del controlador.
- Impresión cuando la computadora que aloja la impresora está apagada. En ese caso el trabajo permanecerá pendiente o requerirá atención según su vigencia.
- Uso de SignalR como almacenamiento. La fuente de verdad será siempre PostgreSQL.

### 2.3. Definición de “funcional al 100%” para este proyecto

Se considerará terminada la implementación cuando se cumplan todos los criterios de aceptación de la sección 18. En particular:

- El dispositivo que solicita una impresión no necesita QZ Tray.
- Toda computadora que aloje una impresora tiene QZ Tray y BarMaster abiertos y conectados durante la operación.
- Un trabajo online llega a la estación correcta, se entrega a la cola correcta de Windows y deja un estado auditable.
- Un trabajo creado durante una desconexión no se pierde.
- No existe una ruta que permita a una empresa, sucursal o estación consumir trabajos de otra.
- No se muestran términos como QZ, WebSocket, certificado, firma o spooler al usuario final.

Una evolución opcional a un agente nativo permitiría imprimir con el navegador cerrado; se describe en la sección 17, pero no debe mezclarse con la primera implementación sin completar antes el piloto basado en el navegador.

## 3. Estado actual comprobado

Actualmente ya funcionan:

- QZ Tray 2.2.6 con certificado propio.
- Firma RSA/SHA-512 desde el backend.
- Enumeración de impresoras instaladas en la computadora local.
- Registro básico de `PrintingStation`.
- Configuración `PrinterAssignment` por estación y rol.
- Impresión local exclusivamente mediante comandos ESC/POS raw.
- Impresión de preticket desde `MesaModalUnificado`.
- Tests backend y frontend de la integración actual.

Limitaciones actuales que este plan debe resolver:

1. El navegador que pulsa “Imprimir” intenta usar el QZ Tray de esa misma computadora.
2. `PrinterAssignment` mezcla una impresora física con la decisión de negocio sobre qué imprimir.
3. No existe una cola persistente de trabajos.
4. No existe un receptor de trabajos asignados a otra computadora.
5. El `NotificacionesHub` existente usa grupos generales como `Mozos`, no autentica estaciones y no debe reutilizarse para impresión.
6. Los productos y categorías todavía no tienen un sector de producción estructurado, como Cocina o Barra.
7. El preticket se construye actualmente en el navegador solicitante usando información recibida por ese navegador.

## 4. Decisión de arquitectura

Se implementará:

```text
Intención de negocio
        │
        ▼
Backend autoritativo
        │
        ├── valida usuario, tenant, sucursal y documento
        ├── resuelve reglas de destino
        ├── crea trabajos persistentes
        └── avisa que hay trabajo disponible
                 │
                 ▼
        Estación receptora correcta
                 │
                 ├── reclama el trabajo de forma atómica
                 ├── lo convierte en comandos ESC/POS
                 ├── lo entrega a QZ Tray local
                 └── informa el resultado
```

Principios obligatorios:

- Separar inventario, enrutamiento y ejecución.
- La computadora del mozo solicita; no elige nombres de colas de Windows.
- El backend obtiene los datos del documento desde la base y nunca confía en totales o líneas construidos por el cliente.
- SignalR solo notifica “hay trabajo”; el receptor consulta el trabajo mediante una API autenticada.
- El polling periódico recupera notificaciones perdidas.
- Todo trabajo tiene destino y configuración congelados en el momento de su creación.
- Las transiciones de estado son atómicas.
- Después de una entrega ambigua al spooler no se reintenta automáticamente, para evitar duplicados.

## 5. Alternativas evaluadas

### 5.1. Compartir las impresoras mediante Windows

No será la arquitectura principal. Obliga a instalar o descubrir cada cola compartida en cada computadora, distribuye permisos de Windows, dificulta soporte y no aporta auditoría propia de BarMaster.

Puede seguir utilizándose como mecanismo de conectividad: si Windows expone una cola compartida en una estación, BarMaster puede registrarla como cualquier otra. No debe reemplazar la cola central.

### 5.2. Conectar el navegador del mozo directamente al QZ Tray remoto

QZ documenta un modo Print Server que permite cambiar `localhost` por otro host. No se usará como flujo principal porque requeriría:

- Exponer WebSockets de QZ en la red local.
- Direcciones o nombres de red estables.
- Firewall y certificados TLS por servidor de impresión.
- Acceso directo desde cada dispositivo cliente.
- Resolver por separado persistencia, reintentos, auditoría e idempotencia.

La cola central mantiene a QZ escuchando localmente y reduce la superficie de red.

### 5.3. Enviar el trabajo únicamente por SignalR

Descartado. Los grupos de SignalR viven en memoria y no conservan trabajos. Microsoft también indica que la pertenencia a grupos debe restablecerse al crear una nueva conexión. Por eso PostgreSQL será la fuente de verdad y SignalR será una optimización de latencia.

### 5.4. Cola externa como RabbitMQ o Kafka

No es necesaria en la primera implementación. PostgreSQL, índices adecuados, reclamo atómico y SignalR cubren la escala esperada de BarMaster con menos infraestructura. La capa de servicios se diseñará detrás de interfaces para poder cambiar el transporte en el futuro.

## 6. Modelo conceptual definitivo

```text
Sucursal
├── PrintingStation
│   └── PrinterDevice
├── PrintRoute
│   └── PrintRouteDestination ──► PrinterDevice
└── PrintJob
    └── PrintJobAttempt
```

### 6.1. `PrintingStation`

Representa una instalación de BarMaster capaz de alojar impresoras.

Campos nuevos o revisados:

| Campo | Propósito |
|---|---|
| `Id` | Identidad emitida por el backend |
| `IdSucursal` | Aislamiento de sucursal |
| `ClientInstallationId` | UUID estable de esa instalación del navegador |
| `Name` | Nombre amigable, por ejemplo `Caja principal` |
| `Enabled` | Habilitación administrativa |
| `CredentialHash` | Hash de la credencial propia de la estación |
| `CredentialCreatedAt` | Auditoría de emisión |
| `LastSeenAt` | Último heartbeat válido |
| `LastAgentVersion` | Versión del receptor de impresión |
| `LastQzVersion` | Versión técnica, visible solo para soporte |
| `RevokedAt` | Revocación explícita |

No se guardará el secreto en texto plano. El backend generará al menos 256 bits aleatorios, devolverá el secreto solo al enrolar o rotar la estación y almacenará únicamente un hash criptográfico. La comparación será de tiempo constante.

### 6.2. `PrinterDevice`

Representa una cola que una estación puede usar.

| Campo | Propósito |
|---|---|
| `Id` | Identidad estable dentro de BarMaster |
| `StationId` | Computadora que puede acceder a la cola |
| `SystemPrinterName` | Nombre exacto informado por QZ/Windows |
| `DisplayName` | Nombre amigable, por ejemplo `Ticketera cocina` |
| `Format` | `Raw` fijo; el campo persiste sólo por compatibilidad histórica |
| `PaperWidthMm` | Inicialmente 58 u 80 |
| `Encoding` | Inicialmente `CP858` para raw |
| `Enabled` | Puede recibir trabajos |
| `IsPresent` | Apareció en la última sincronización local |
| `LastSeenAt` | Última vez que la cola fue detectada |
| `LastStatus` | Estado normalizado si el driver lo informa |
| `UpdatedAt` | Auditoría |

Restricciones:

- Índice único por `StationId + SystemPrinterName`.
- No borrar automáticamente una impresora ausente; marcarla `IsPresent = false` para conservar rutas e historial.
- Un cambio de nombre de la cola de Windows se tratará como una impresora nueva hasta que un administrador la reasocie.

### 6.3. `PrintRoute`

Representa una regla de negocio, no una impresora.

| Campo | Propósito |
|---|---|
| `Id` | Identidad de la regla |
| `IdSucursal` | Sucursal propietaria |
| `DocumentType` | Preticket, comanda, comprobante, etc. |
| `ProductionAreaId` | Sector opcional para comandas |
| `OfflinePolicy` | `Queue`, `UseFallback` o `Fail` |
| `MaxQueueAgeSeconds` | Vigencia del documento antes de expirar |
| `Enabled` | Habilitación |
| `UpdatedAt` | Auditoría |

### 6.4. `PrintRouteDestination`

Permite uno o varios destinos deliberados para una regla.

| Campo | Propósito |
|---|---|
| `PrintRouteId` | Regla propietaria |
| `PrinterDeviceId` | Impresora de destino |
| `Copies` | Copias para ese destino |
| `Order` | Orden estable de presentación |
| `Mode` | `Primary`, `Additional` o `Fallback` |

Reglas:

- Puede haber varios destinos `Additional` si el negocio quiere copias en lugares diferentes.
- Un destino `Fallback` nunca se activa después de una entrega ambigua. Solo puede usarse si el principal estaba inequívocamente indisponible antes del envío.
- La UI debe advertir explícitamente cuando una acción producirá varias copias físicas.
- `Queue` conserva el trabajo para el destino principal aunque esté offline; `UseFallback` permite elegir el respaldo antes de comenzar el envío; `Fail` rechaza la solicitud si el destino no está disponible. La política se configura por ruta, no queda implícita.

### 6.5. `ProductionArea`

Para comandas se agregará un sector configurable:

```text
Cocina
Barra
Cafetería
Postres
```

La asignación se guarda en `ProductProductionAreaAssignment` con clave `IdSucursal + ProductId`. Así un mismo producto puede pertenecer a Cocina en una sucursal y a Barra en otra. No se decide el sector comparando textos como “bebida” o “cocina”.

Si un producto no tiene sector:

- El backend no lo enviará silenciosamente a una impresora arbitraria.
- Registrará una advertencia de configuración.
- La UI administrativa mostrará los productos sin sector.

### 6.6. `PrintJob`

Representa una impresión concreta e inmutable.

| Campo | Propósito |
|---|---|
| `Id` | Identidad del trabajo |
| `IdSucursal` | Aislamiento |
| `StationId` | Estación receptora congelada |
| `PrinterDeviceId` | Impresora elegida congelada |
| `RouteId` | Regla que originó el trabajo |
| `DocumentType` | Tipo de documento |
| `SchemaVersion` | Versión del payload |
| `TemplateVersion` | Versión del formateador |
| `PayloadJson` | Snapshot autorizado del documento |
| `SystemPrinterNameSnapshot` | Cola exacta al crear el trabajo |
| `FormatSnapshot` | Método de impresión |
| `PaperWidthMmSnapshot` | Ancho congelado |
| `EncodingSnapshot` | Codificación congelada |
| `CopiesSnapshot` | Copias congeladas |
| `Status` | Estado actual |
| `IdempotencyKey` | Prevención de duplicados |
| `SourceEntityType` / `SourceEntityId` | Mesa, visita, factura, pedido, etc. |
| `ReprintOfJobId` | Referencia al trabajo original si es una reimpresión manual |
| `RequestedByPersonaId` | Auditoría del solicitante |
| `CreatedAt`, `AvailableAt`, `ExpiresAt` | Ciclo de vida |
| `LeaseId`, `LeaseExpiresAt` | Reclamo atómico |
| `DispatchStartedAt`, `SpoolAcceptedAt` | Límite de reintento seguro |
| `AttemptCount`, `LastErrorCode` | Diagnóstico |

El payload será un DTO semántico versionado, no HTML libre ni un objeto de Entity Framework serializado. Ejemplo:

```json
{
  "schemaVersion": 1,
  "branchName": "Sucursal Centro",
  "tableName": "Mesa 12",
  "requestedAt": "2026-09-03T18:30:00Z",
  "lines": [
    { "quantity": 2, "description": "Hamburguesa", "unitPrice": 8500, "notes": "Sin cebolla" }
  ],
  "total": 17000,
  "nonFiscalLegend": "DOCUMENTO NO VALIDO COMO FACTURA"
}
```

### 6.7. `PrintJobAttempt`

Registra cada intento sin sobrescribir el anterior:

| Campo | Propósito |
|---|---|
| `Id` | Identidad |
| `PrintJobId` | Trabajo relacionado |
| `StationId` | Estación ejecutora |
| `StartedAt`, `FinishedAt` | Duración |
| `Outcome` | Resultado normalizado |
| `ErrorCode` | Código estable |
| `TechnicalDetail` | Detalle limitado y sin secretos |
| `QzJobStatus` | Estado opcional reportado por QZ/Winspool |

No guardar tokens, credenciales, certificado privado ni payload completo en logs.

## 7. Máquina de estados y política de reintentos

Estados propuestos:

```text
Pending
   │
   ▼
Leased ───────────────► Pending              (lease vencido antes de enviar)
   │
   ▼
Dispatching
   ├──────────────────► SpoolAccepted        (qz.print resolvió)
   ├──────────────────► RetryScheduled       (fallo seguro antes de enviar)
   └──────────────────► NeedsAttention       (resultado ambiguo)

Pending / RetryScheduled ─► Expired
Pending / NeedsAttention ─► Cancelled
NeedsAttention ───────────► New PrintJob      (reimpresión manual confirmada y enlazada)
```

Reglas obligatorias:

1. `Pending → Leased` se realiza atómicamente en PostgreSQL.
2. Varias pestañas o procesos de la misma estación no pueden obtener el mismo lease válido.
3. La estación informa `Dispatching` inmediatamente antes de llamar a `qz.print()`.
4. Si el proceso muere cuando estaba `Leased` pero nunca llegó a `Dispatching`, puede reencolarse automáticamente.
5. Si el proceso muere o vence el tiempo después de `Dispatching`, pasa a `NeedsAttention`; no se reimprime automáticamente.
6. `SpoolAccepted` significa que QZ aceptó o entregó el trabajo al subsistema de impresión. La UI no debe llamarlo “papel confirmado”.
7. Los callbacks de estado de impresora/trabajo de QZ se incorporarán como mejora de observabilidad, sabiendo que dependen de Winspool y del driver.
8. Una reimpresión posterior a un resultado ambiguo crea un trabajo nuevo con `ReprintOfJobId`; no recicla el trabajo original.
9. Toda reimpresión manual genera auditoría con usuario, fecha y motivo.
10. `Cancelled` solo es válido antes de `Dispatching`. Un trabajo entregado al spooler no puede presentarse como cancelado por BarMaster.

## 8. APIs propuestas

Las rutas exactas pueden adaptarse a la convención existente, pero no deben mezclar operaciones administrativas con operaciones de estación.

### 8.1. Estaciones e inventario

```text
POST /api/printing/stations/enroll
POST /api/printing/stations/session
POST /api/printing/stations/{stationId}/rotate-credential
POST /api/printing/stations/{stationId}/revoke
POST /api/printing/stations/{stationId}/heartbeat
PUT  /api/printing/stations/{stationId}/printers/sync
GET  /api/printing/stations/{stationId}/printers
PATCH /api/printing/printers/{printerId}
POST /api/printing/printers/{printerId}/test-jobs
```

- `enroll`, rotación, revocación y edición requieren `Printing.Configure`.
- `session`, heartbeat, sync y consumo de trabajos requieren una credencial de estación válida.
- La sincronización recibe la lista completa detectada y marca ausentes; no elimina historial.

### 8.2. Reglas

```text
GET    /api/printing/routes
POST   /api/printing/routes
PUT    /api/printing/routes/{routeId}
DELETE /api/printing/routes/{routeId}       (borrado lógico)
POST   /api/printing/routes/validate
```

Todos requieren `Printing.Configure`.

La validación debe detectar:

- Acciones sin destino.
- Impresoras deshabilitadas o ausentes.
- Estaciones revocadas.
- Productos sin sector.
- Destinos múltiples potencialmente accidentales.

### 8.3. Intenciones de impresión

```text
POST /api/printing/requests/preticket
POST /api/printing/requests/payment-receipt
GET  /api/printing/requests/{requestId}
```

Ejemplo de solicitud de preticket:

```json
{
  "visitId": "...",
  "productIds": []
}
```

El backend debe ignorar cualquier total enviado por el cliente, consultar la visita, validar pertenencia y construir el snapshot autorizado.

La respuesta normal será `202 Accepted`:

```json
{
  "requestId": "...",
  "jobs": [
    {
      "jobId": "...",
      "destination": "Ticketera principal",
      "station": "Caja principal",
      "status": "Pending"
    }
  ]
}
```

### 8.4. Consumo por estación

```text
POST /api/printing/station/jobs/claim
POST /api/printing/station/jobs/{jobId}/dispatching
POST /api/printing/station/jobs/{jobId}/spool-accepted
POST /api/printing/station/jobs/{jobId}/failed
POST /api/printing/station/jobs/{jobId}/renew-lease
```

El `stationId` se obtiene del JWT de estación, no de un valor libre enviado por el cliente. Las transiciones requieren el `leaseId` vigente.

### 8.5. Administración y soporte

```text
GET  /api/printing/jobs?status=&stationId=&from=&to=
POST /api/printing/jobs/{jobId}/retry
POST /api/printing/jobs/{jobId}/cancel
GET  /api/printing/dashboard
```

## 9. Autenticación y aislamiento

### 9.1. Token de estación

Después del enrolamiento, el receptor intercambiará su identificador y secreto por un JWT corto con claims:

```text
TipoAuth=printing_station
TenantId=<tenant>
IdSucursal=<sucursal>
PrintingStationId=<estación>
jti=<identificador único>
```

Este token autoriza exclusivamente:

- Conexión al `PrintingHub`.
- Heartbeat.
- Sincronización de sus impresoras.
- Firma QZ de esa estación.
- Reclamo y actualización de sus propios trabajos.

No autoriza modificar rutas ni leer operaciones comerciales generales.

### 9.2. Almacenamiento del secreto

- Guardarlo separado por tenant y sucursal.
- Preservarlo al cerrar la sesión de una persona; es identidad del equipo, no del empleado.
- Eliminarlo al revocar o desenrolar la estación.
- Aplicar Content Security Policy y evitar scripts de terceros innecesarios, ya que cualquier secreto accesible a JavaScript depende de la seguridad contra XSS.
- Permitir rotación administrativa sin reinstalar QZ.

### 9.3. SignalR autenticado

Crear `PrintingHub`; no ampliar `NotificacionesHub` para esta función.

Requisitos:

- `[Authorize(Policy = "Printing.Station")]`.
- `accessTokenFactory` en el cliente.
- Configurar `JwtBearerEvents.OnMessageReceived` para aceptar `access_token` únicamente en la ruta del hub de impresión.
- No registrar la query string completa, porque el navegador puede transportar el token por query string en WebSockets/SSE.
- En `OnConnectedAsync`, derivar tenant, sucursal y estación exclusivamente de claims firmados.
- Agregar la conexión a un grupo interno como `printing:{tenant}:{branch}:{station}`.
- No aceptar `connectionId`, tenant, sucursal, grupo o estación elegidos por el cliente.
- Reincorporar la conexión al grupo en cada conexión nueva.
- Los mensajes del hub serán avisos sin payload comercial: `PrintJobsAvailable`.

### 9.4. Multi-tenant

- Todas las entidades nuevas viven en la base tenant correspondiente, siguiendo el diseño actual de `AppDbContext`.
- El tenant del token es autoritativo.
- Si también llega `X-Tenant-ID`, debe coincidir exactamente con el claim.
- Las consultas siempre incluyen sucursal y estación cuando corresponda.
- Se crearán pruebas negativas entre dos tenants, dos sucursales y dos estaciones.

## 10. Receptor de impresión en el frontend

Crear un componente global independiente de las pantallas:

```text
PrintingWorkerProvider
├── StationSessionManager
├── PrintingHubConnection
├── PrintJobPoller
├── PrintJobProcessor
└── QzPrinterAdapter
```

### 10.1. Cuándo se activa

Solo se activa si:

- Existe una estación enrolada para ese tenant/sucursal.
- La estación está habilitada.
- Tiene por lo menos una `PrinterDevice` habilitada.

Una computadora de mozo sin impresoras no conecta a QZ y no ejecuta el worker.

### 10.2. Ciclo

1. Obtener o renovar token de estación.
2. Conectar con el backend y enviar heartbeat.
3. Conectar con QZ Tray local.
4. Sincronizar impresoras locales.
5. Abrir el hub autenticado.
6. Consultar inmediatamente trabajos pendientes.
7. Ante `PrintJobsAvailable`, volver a consultar.
8. Si SignalR falla, continuar mediante polling con backoff.
9. Reclamar un trabajo.
10. Verificar que la cola exacta siga presente.
11. Informar `Dispatching`.
12. Formatear el payload versionado.
13. Ejecutar `qz.print()`.
14. Informar `SpoolAccepted` o el fallo normalizado.
15. Reclamar el siguiente trabajo.

### 10.3. Una sola pestaña activa

Usar Web Locks API para elegir una pestaña líder por estación. Las demás pueden mostrar estado, pero no consumen trabajos. Como defensa adicional, el lease del backend seguirá siendo obligatorio; nunca depender únicamente del lock del navegador.

### 10.4. Polling y heartbeat

Valores iniciales configurables:

- Heartbeat: cada 30 segundos.
- Estación considerada offline: 90 segundos sin heartbeat.
- Polling normal: cada 15 segundos.
- Polling después de notificación: inmediato.
- Backoff ante error: 2, 5, 10, 30 y máximo 60 segundos con jitter.
- Lease inicial: 60 segundos, renovable antes de vencer.

No utilizar `setInterval` para ejecutar impresiones concurrentes. Programar el siguiente ciclo después de completar el anterior.

## 11. Formateadores y compatibilidad

Crear una interfaz por tipo y versión:

```text
IPrintDocumentFormatter
├── PreticketEscPosFormatterV1
├── KitchenOrderEscPosFormatterV1
├── PaymentReceiptEscPosFormatterV1
└── ImageFormatterV1
```

En frontend puede expresarse como un registro de funciones puras por `documentType + schemaVersion + format`.

Reglas:

- No cambiar retroactivamente el significado de una versión.
- Si el worker recibe una versión desconocida, marca fallo no reintentable `UNSUPPORTED_PAYLOAD_VERSION`.
- Mantener fixtures de bytes o snapshots para 58 y 80 mm.
- Centralizar comandos ESC/POS, corte, encoding, ancho de línea y normalización de texto.
- No asumir que todas las térmicas implementan el mismo comando de corte; convertirlo en capacidad configurable si el piloto encuentra diferencias.

## 12. Interfaces de usuario

### 12.1. `/configuracion_impresion`: impresoras de este equipo

La pantalla actual debe dejar de asignar roles y convertirse en inventario local:

1. Nombre del equipo.
2. Estado sencillo: listo, necesita atención o desconectado.
3. Botón `Buscar impresoras`.
4. Lista de colas encontradas.
5. Activar las que usará BarMaster.
6. Nombre amigable.
7. Perfil técnico de impresión asignado automáticamente; tipo y ancho no se exponen al usuario final.
8. Prueba local.
9. Estado y última detección.
10. Diagnóstico técnico dentro de una sección colapsada de soporte.

No mostrar al usuario final QZ Tray, WebSocket, certificados, firma, raw, hashes o GUID.

### 12.2. Nueva pantalla `Destinos de impresión`

Solo para administradores.

Debe mostrar reglas con selectores agrupados por estación:

```text
Cuenta de la mesa
└── Caja principal
    └── Ticketera principal — Disponible

Comandas de cocina
└── Cocina
    └── Ticketera cocina — Equipo desconectado
```

Debe permitir:

- Elegir acción o documento.
- Elegir sector cuando corresponda.
- Elegir uno o varios destinos explícitos.
- Configurar copias.
- Elegir qué hacer si el destino está offline: esperar, usar respaldo o informar error.
- Configurar cuánto tiempo sigue siendo útil ese documento.
- Habilitar/deshabilitar.
- Validar la configuración completa.
- Probar una ruta generando un trabajo real de prueba, no imprimiendo desde la PC administradora.

### 12.3. Experiencia del mozo

Al solicitar un preticket:

```text
Enviando a Ticketera principal…
```

Después:

- `Enviado a la impresora de caja` si llegó a `SpoolAccepted` dentro de un tiempo corto.
- `La impresión quedó pendiente porque la caja está desconectada` si se creó pero la estación está offline.
- `No hay una impresora configurada para cuentas` si falta la ruta.
- `La impresión necesita revisión` si el resultado fue ambiguo.

El botón no debe bloquearse esperando indefinidamente. El request devuelve el identificador y la UI observa el estado durante un tiempo acotado.

### 12.4. Panel de operaciones

Para encargados:

- Estaciones online/offline.
- Impresoras presentes/ausentes.
- Trabajos pendientes y antigüedad.
- Trabajos que necesitan atención.
- Reintentar, reimprimir o cancelar con confirmación.
- Historial filtrable por mesa, estación, impresora y fecha.

## 13. Integración con el negocio

### 13.1. Preticket

Reemplazar el llamado local de `printingOrchestrator.printPreticket()` por una intención al backend.

Flujo:

1. El frontend envía `visitId` y, si corresponde, IDs de productos seleccionados.
2. El backend valida que la visita pertenezca a la sucursal autenticada.
3. Consulta productos y pagos vigentes.
4. Calcula totales.
5. Construye el snapshot de preticket.
6. Resuelve la ruta `Preticket`.
7. Crea uno o varios trabajos con idempotencia.
8. Confirma la transacción.
9. Notifica a las estaciones.
10. Devuelve `202 Accepted`.

### 13.2. Comandas

La creación de comandas se integrará en `VisitasServices.AgregarProductosCoreAsync` o en un servicio de dominio llamado desde esa misma transacción.

No hacer una segunda solicitud desde React después de guardar productos: si se guardan los productos pero falla esa segunda llamada, se perdería la comanda.

Dentro de la transacción actual:

1. Crear los `ProductosPorVisita`.
2. Obtener sus sectores de producción.
3. Agrupar exclusivamente los productos recién agregados.
4. Construir una comanda por sector.
5. Resolver rutas.
6. Crear `PrintJob` e idempotency keys.
7. Confirmar productos, stock y trabajos juntos.
8. Enviar SignalR solamente después del commit.

Si la notificación falla, los trabajos permanecen y el polling los recupera.

### 13.3. Idempotencia

Ejemplos:

```text
Preticket:{VisitId}:{RequestedRevision}:{PrinterDeviceId}
KitchenOrder:{VisitId}:{AddedProductsBatchId}:{ProductionAreaId}:{PrinterDeviceId}
PaymentReceipt:{PaymentId}:{PrinterDeviceId}
```

Crear índice único por sucursal e `IdempotencyKey`.

El batch de productos agregados debe tener una identidad estable generada en el backend o aceptada como command ID del cliente y validada. No construir idempotencia con timestamps de milisegundos.

## 14. Migración desde el modelo actual

No eliminar `PrinterAssignment` al comienzo.

Secuencia segura:

1. Crear tablas nuevas en una migración aditiva.
2. Desplegar backend capaz de leer modelo nuevo y mantener compatibilidad temporal.
3. Convertir cada combinación única `StationId + QzPrinterName` en `PrinterDevice`.
4. Si en una sucursal existe exactamente una asignación habilitada para un rol, crear la ruta equivalente.
5. Si existen varias asignaciones para el mismo rol, no elegir automáticamente: registrar una tarea de configuración para el administrador.
6. Mostrar un reporte dry-run antes de aplicar el backfill.
7. Validar cantidades por tenant y sucursal.
8. Activar el nuevo flujo mediante feature flags.
9. Mantener temporalmente el flujo local como rollback.
10. Eliminar `PrinterAssignment` y código heredado únicamente después del piloto y de una versión estable.

La herramienta `tools/BarMaster.MigrationTool` debe:

- Detectar migraciones pendientes por tenant.
- Exigir backup verificable antes de aplicar.
- Ejecutar el backfill de manera idempotente.
- Emitir reporte sin secretos ni payloads completos.
- Detenerse ante configuraciones ambiguas.

## 15. Estructura de código prevista

### 15.1. Backend

```text
BackEndAPI/
├── Models/Printing/
│   ├── PrinterDevice.cs
│   ├── PrintRoute.cs
│   ├── PrintRouteDestination.cs
│   ├── PrintJob.cs
│   ├── PrintJobAttempt.cs
│   ├── ProductionArea.cs
│   └── Enums/
├── Printing/
│   ├── Stations/
│   ├── Devices/
│   ├── Routing/
│   ├── Jobs/
│   ├── Documents/
│   ├── Security/
│   └── Notifications/
├── Controllers/
│   ├── PrintingStationsController.cs
│   ├── PrintingRoutesController.cs
│   ├── PrintingRequestsController.cs
│   └── PrintingJobsController.cs
└── Hubs/
    └── PrintingHub.cs
```

Interfaces mínimas:

```text
IPrinterDeviceService
IPrintRouteService
IPrintRouteResolver
IPrintJobService
IPrintJobLeaseService
IPrintDocumentFactory
IPrintingNotifier
IStationCredentialService
```

Controladores delgados; reglas y transiciones en servicios. No crear un único `PrintingService` con todas las responsabilidades.

### 15.2. Frontend

```text
frontendMozo/src/
├── contexts/
│   └── PrintingWorkerContext.jsx
├── services/printing/
│   ├── stationSession.js
│   ├── printerInventoryApi.js
│   ├── printRoutesApi.js
│   ├── printJobsApi.js
│   ├── printingHub.js
│   ├── printJobWorker.js
│   ├── printJobStateMachine.js
│   ├── formatterRegistry.js
│   ├── qzClient.js
│   ├── qzConnection.js
│   ├── qzPrinters.js
│   └── qzPrint.js
└── pages/
    ├── ConfiguracionImpresion/
    ├── DestinosImpresion/
    └── EstadoImpresion/
```

Mantener QZ encapsulado. Los componentes de negocio solo llaman APIs de intención y nunca importan `qz-tray`.

## 16. Fases de implementación

Cada fase debe actualizar esta tabla y sus criterios en el mismo commit.

| Fase | Entregable | Estado inicial |
|---|---|---|
| 0 | Baseline, flags y pruebas actuales | Implementada |
| 1 | Modelo aditivo y migración dry-run | Implementada; aplicar por tenant al desplegar |
| 2 | Credencial y sesión de estación | Implementada y probada |
| 3 | Inventario local `PrinterDevice` | Implementada y probada |
| 4 | Reglas y pantalla de destinos | Implementada |
| 5 | Cola, leases y estados | Implementada; concurrencia probada en PostgreSQL real |
| 6 | `PrintingHub` seguro y polling | Implementada |
| 7 | Worker global de estación | Implementada |
| 8 | Preticket distribuido | Implementada |
| 9 | Sectores y comandas distribuidas | Implementada |
| 10 | Observabilidad y recuperación | Implementada |
| 11 | Instalación operativa por estación | Herramientas implementadas; falta ejecutar checklist en cada PC |
| 12 | Piloto multi-PC y despliegue gradual | Pendiente de infraestructura física/usuario |
| 13 | Retiro del flujo heredado | Bloqueada deliberadamente hasta aprobar el piloto |

### Fase 0 — Baseline y seguridad de cambio

- Ejecutar y registrar tests backend/frontend, builds y prueba física actual.
- Crear feature flags:
  - `DistributedPrinting:Enabled`.
  - `DistributedPrinting:JobWorkerEnabled`.
  - `VITE_DISTRIBUTED_PRINTING_ENABLED`.
- Mantener el flujo local como rollback durante el piloto.
- Crear fixtures del preticket actual de 58 y 80 mm.

Criterio: con flags apagados, el comportamiento actual permanece idéntico.

### Fase 1 — Modelo y migración

- Agregar entidades, mappings, constraints e índices.
- Agregar migración aditiva.
- Implementar dry-run y backfill conservador.
- Definir retención inicial: payloads 30 días e historial resumido según necesidad del negocio.

Criterio: migración y rollback verificados sobre una copia de cada tipo de tenant; ninguna asignación ambigua se transforma silenciosamente.

### Fase 2 — Identidad de estación

- Enrolamiento administrativo.
- Credencial aleatoria, hash, rotación y revocación.
- JWT corto `printing_station`.
- Política `Printing.Station`.
- Adaptar `/api/qz/sign` para aceptar la identidad de estación sin ampliar permisos.

Criterio: una estación no puede usar ID, secreto, trabajo o firmador de otra sucursal.

### Fase 3 — Inventario de impresoras

- Sincronización completa desde QZ.
- `PrinterDevice` separado de rutas.
- Adaptar `/configuracion_impresion` para configurar solo impresoras locales.
- Mantener prueba local y nombres amigables.

Criterio: conectar/desconectar USB o Bluetooth cambia presencia sin borrar configuración ni historial.

### Fase 4 — Reglas

- CRUD y validación de rutas.
- Pantalla administrativa agrupada por estación.
- Trabajo de prueba que recorre backend y estación destino.

Criterio: un administrador puede enviar una prueba desde PC A a una impresora instalada únicamente en PC B.

### Fase 5 — Cola persistente

- Crear servicios de trabajos y transiciones.
- Reclamo atómico con lease.
- Reclamo mediante una única operación PostgreSQL (`FOR UPDATE SKIP LOCKED`/`UPDATE ... RETURNING` o equivalente probado), no mediante `SELECT` y `UPDATE` separados.
- Índices de consumo por `StationId + Status + AvailableAt`.
- Idempotencia y attempts.
- Reaper de leases seguros: solo reencola si no comenzó dispatch.

Criterio: dos consumidores concurrentes no imprimen el mismo trabajo; reiniciar el backend no pierde pendientes.

### Fase 6 — Notificaciones

- Crear `PrintingHub` autenticado.
- Configurar bearer token para el hub.
- Grupos derivados del JWT.
- Notificación post-commit.
- Polling de respaldo.
- Documentar que, si el backend se ejecuta en varias instancias sin backplane de SignalR, una notificación puede no llegar a una conexión alojada en otra instancia; el polling mantiene la corrección. Incorporar Redis/Azure SignalR solamente si se necesita baja latencia consistente en despliegue multi-instancia.

Criterio: eliminar una notificación o reiniciar SignalR no pierde el trabajo; otra sucursal no observa el aviso.

### Fase 7 — Worker global

- Implementar leader election, ciclo secuencial y backoff.
- Sincronizar inventario y heartbeat.
- Procesar payloads versionados.
- Informar estados precisos.
- Detenerse limpiamente al cambiar de tenant/sucursal o revocar estación.

Criterio: funciona desde cualquier pantalla de BarMaster en la estación receptora y se recupera tras recargar el navegador.

### Fase 8 — Preticket remoto

- Crear endpoint de intención.
- Construir snapshot en backend.
- Reemplazar impresión local desde `MesaModalUnificado`.
- Mostrar estado amigable al mozo.

Criterio principal: una PC sin QZ ni impresora solicita un preticket y la KP-1025 conectada exclusivamente a la PC de caja recibe el trabajo.

### Fase 9 — Comandas

- Agregar sectores configurables.
- Asignar productos/criterio de herencia explícito.
- Integrar creación de jobs en la transacción de `AgregarProductos`.
- Formateador de comanda sin precios salvo configuración explícita.

Criterio: un pedido mixto genera únicamente los ítems correctos en Cocina y Barra, una vez por batch.

### Fase 10 — Operación

- Dashboard.
- Estado de estación e impresora.
- Reintento/cancelación/reimpresión auditados.
- Alertas por cola atrasada y `NeedsAttention`.
- Limpieza por retención mediante servicio programado idempotente.

Criterio: soporte puede explicar dónde quedó un trabajo usando su ID sin leer secretos.

### Fase 11 — Instalación

- Extender instalador y diagnóstico existentes.
- QZ al inicio de sesión del usuario de impresión.
- Certificado y allowlist verificados.
- Acceso directo para abrir BarMaster en modo estación.
- Checklist de energía, suspensión, driver y página de prueba Windows.

Criterio: reiniciar una PC de impresión y abrir BarMaster restablece estación, QZ, hub, inventario y pendientes sin reconfigurarla.

### Fase 12 — Piloto y rollout

Piloto mínimo:

```text
PC Mozo       sin QZ
PC Caja       QZ + KP-1025 USB
PC Cocina     QZ + térmica USB/Bluetooth
```

- Activar una sucursal mediante flag.
- Observar al menos un servicio real completo.
- Verificar matriz de fallos.
- Documentar rollback.
- Ampliar gradualmente.

### Fase 13 — Limpieza

- Apagar el orquestador local heredado.
- Eliminar `PrinterAssignment` solo después de comprobar el backfill.
- Retirar endpoints y cachés obsoletos.
- Actualizar `Instalar-qztray.md` con la operación final.

### 16.1. Registro de implementación y verificación

Implementado y verificado entre el 3 y el 4 de septiembre de 2026:

- Migración aditiva `20260903200842_AddDistributedPrinting`, incluido su SQL de subida y un `Down` completo generado por EF Core.
- Herramienta segura de diagnóstico/aplicación por tenant en `tools/BarMaster.MigrationTool`; el modo por defecto no modifica bases y `--apply` exige crear y validar un backup de cada tenant.
- Credencial de estación de 256 bits, hash SHA-256, comparación constante, rotación, revocación, JWT corto y rate limit de sesión.
- Inventario completo, presencia sin borrado y nombres amigables en `/configuracion_impresion`; el perfil térmico y el ancho permanecen como configuración interna.
- Rutas primarias, adicionales y de respaldo, políticas offline, sectores por sucursal y validación administrativa en `/destinos_impresion`.
- Cola PostgreSQL, snapshot inmutable, claves idempotentes, `FOR UPDATE SKIP LOCKED`, leases, attempts, expiración, retención de payload y tratamiento conservador de fallos ambiguos.
- Hub exclusivo autenticado y polling de respaldo. SignalR solo despierta al worker; PostgreSQL conserva la verdad.
- Worker global con Web Locks para una pestaña líder, heartbeat/inventario, renovación de lease, backoff y formateadores ESC/POS.
- Preticket autoritativo desde base de datos y comandas creadas dentro de la transacción del alta de productos. `VisitOrderCommand` impide repetir un batch concurrente.
- Dashboard, cancelación, reimpresión enlazada y prueba remota por impresora.
- Mantenimiento multi-tenant tolerante al rollout: omite de forma segura bases que aún no tengan la migración distribuida.
- Configuración operativa autorizada tanto con administrador de la sucursal como con su credencial de sucursal; fallback controlado cuando un token personal antiguo no contiene una sucursal válida.
- Errores de permisos diferenciados de los errores de conexión local para evitar indicar incorrectamente que el servicio de impresión está cerrado.
- Formato único ESC/POS: APIs sin selector de formato, enum limitado a `Raw`, trabajos normalizados a `Raw` y único payload QZ `raw/command/plain`.
- Scripts operativos en `tools/printing` para inicio de QZ, acceso directo y diagnóstico de la estación.

Verificaciones ejecutadas:

```text
Backend Release: compilación correcta
Backend: 30 tests correctos en la ejecución completa
Backend: arranque real en puerto alternativo y respuesta HTTP 200 correctos
PostgreSQL real: migraciones completas y claim concurrente SKIP LOCKED incluidos y correctos
Frontend: 12 tests correctos
Frontend: build de producción correcto
Frontend modificado: ESLint sin errores (3 advertencias preexistentes de Fast Refresh en App.jsx)
Migración: modelo y snapshot sincronizados; SQL ascendente y descendente generados correctamente
Herramienta de migración: build Release y guardas de conexión/backup/redacción correctos
Scripts operativos PowerShell: sintaxis validada
```

No se marca como ejecutado lo que requiere hardware o decisión humana: aplicar la migración sobre cada tenant real, reiniciar cada PC física, simular fallos de papel/tapa/Bluetooth/red y completar el piloto de tres equipos. Tampoco se elimina aún `PrinterAssignment` ni el rollback local; hacerlo antes de aprobar el piloto contradiría esta misma estrategia de despliegue seguro.

## 17. Evolución opcional: BarMaster Print Agent

La primera implementación exige que BarMaster permanezca abierto en las computadoras que alojan impresoras. Esto normalmente es válido para caja, barra y cocina durante el servicio.

Si se requiere impresión con el navegador completamente cerrado, crear un proyecto separado `BarMaster.PrintAgent` después del piloto:

- Proceso local con inicio automático.
- Usa la misma identidad de estación, APIs, leases y estados.
- Se conecta a QZ Tray local.
- Reutiliza el protocolo de payloads versionados.
- Incluye actualizaciones firmadas y rollback.
- Expone una UI mínima de estado, no configuración comercial.

No instalar QZ como servicio Windows en el primer despliegue. La documentación de QZ indica que esa modalidad utiliza NSSM y no está oficialmente soportada, aunque se reporta como funcional. Si se evalúa, requiere un piloto separado, cuenta de servicio, allowlist a nivel sistema y pruebas de acceso a las colas.

## 18. Criterios de aceptación finales

### Funcionales

- PC de mozo sin QZ imprime remotamente en caja.
- Un preticket nunca se dirige por “primera impresora encontrada”.
- Cocina y barra reciben solo sus productos.
- Una misma impresora puede cubrir varios documentos.
- Una regla puede tener múltiples destinos deliberados.
- Cambiar la regla no requiere modificar el botón de negocio.
- Una impresora ausente queda visible y no desaparece del historial.

### Persistencia y concurrencia

- Reiniciar backend no pierde trabajos.
- Cerrar y reabrir la estación recupera pendientes vigentes.
- Dos pestañas no imprimen el mismo lease.
- Dos requests con la misma idempotency key generan un único trabajo por destino.
- Un fallo ambiguo después de `Dispatching` no se reintenta solo.

### Seguridad

- Hub protegido y autenticado.
- Grupos derivados de claims.
- Tenant A no accede a trabajos de tenant B.
- Sucursal A no accede a estación de sucursal B.
- Estación A no reclama trabajos de estación B.
- Credenciales revocadas dejan de renovar tokens.
- Logs sin secretos, JWT completos ni payloads personales innecesarios.

### UX

- Sin términos técnicos para el usuario final.
- Estados diferenciados: solicitado, pendiente, enviado al sistema de impresión, necesita revisión.
- La configuración local y las reglas globales están en pantallas separadas.
- Errores indican una acción concreta: abrir servicio, encender estación, revisar papel o contactar soporte.

### Operación física

- Raw 58 mm y 80 mm.
- Acentos, `ñ`, símbolos monetarios y corte.
- Driver USB.
- Driver Bluetooth disponible para el piloto.
- Papel agotado, tapa abierta, impresora apagada, cola pausada.
- QZ cerrado y reiniciado.
- Red caída y recuperada.
- Backend reiniciado.
- Navegador recargado.
- Sin diálogos de impresión ni confianza durante operación normal.

## 19. Matriz mínima de pruebas

| Caso | Resultado esperado |
|---|---|
| Mozo solicita con caja online | `SpoolAccepted` en destino correcto |
| Mozo solicita con caja offline | `Pending`, aviso amigable y recuperación posterior |
| Dos pestañas de caja | Un único consumo |
| QZ cerrado antes de claim | Reintento seguro con backoff |
| Cola desaparece antes de dispatch | `RetryScheduled` o atención según política |
| Proceso muere después de dispatch | `NeedsAttention`, sin reimpresión automática |
| Request duplicado | Mismos jobs existentes, sin copia nueva |
| Estación revocada | Hub y APIs rechazados |
| Impresora renombrada en Windows | Antigua ausente; requiere reasociación |
| Bluetooth fuera de alcance | Estado/fallo registrado; trabajo conservado |
| SignalR caído | Polling consume el trabajo |
| Tenant incorrecto | 403/404 sin filtrar existencia |
| Regla sin destino | Solicitud rechazada con mensaje de configuración |
| Ruta con dos destinos | Un job por destino, ambos auditados |

Tests automatizados obligatorios:

- Unitarios de resolución de rutas, payloads, formatters y máquina de estados.
- Integración real con PostgreSQL para índices, transacciones y claims concurrentes; no usar solamente EF InMemory.
- Tests de autorización de controllers y hub.
- Tests de reconexión y polling con timers falsos.
- Tests del adaptador QZ mediante mocks.
- E2E con dos contextos de navegador que representen mozo y caja.
- Pruebas manuales físicas firmadas en una checklist por modelo de impresora.

## 20. Observabilidad y soporte

Logs estructurados con:

```text
TenantId
SucursalId
StationId
PrinterDeviceId
PrintJobId
DocumentType
PreviousStatus
NewStatus
ErrorCode
DurationMs
```

Métricas iniciales:

- Trabajos creados por tipo.
- Tiempo desde creación hasta claim.
- Tiempo desde claim hasta spool accepted.
- Pendientes por estación y antigüedad máxima.
- Cantidad en `NeedsAttention`.
- Estaciones offline.
- Impresoras ausentes.
- Tasa de fallos por cola/driver.

Los códigos de error deben ser estables y traducirse a mensajes amigables en frontend. El detalle técnico queda disponible para soporte, no en la vista principal.

## 21. Rollout y rollback

1. Desplegar tablas y servicios con flags apagados.
2. Ejecutar backfill dry-run.
3. Configurar estaciones e inventario.
4. Crear rutas.
5. Activar worker solo en la PC piloto.
6. Probar trabajos administrativos.
7. Activar preticket distribuido solo en la sucursal piloto.
8. Mantener botón/flag de retorno al flujo local durante el período acordado.
9. Activar comandas después de validar sectores de todos los productos.
10. Retirar compatibilidad solo después de observar métricas estables.

Rollback:

- Desactivar `DistributedPrinting:Enabled` y `VITE_DISTRIBUTED_PRINTING_ENABLED`.
- Detener nuevos jobs sin eliminar los existentes.
- Volver temporalmente al flujo local.
- No revertir destructivamente las tablas en producción; conservarlas para diagnóstico.
- Resolver o cancelar jobs pendientes antes de una reactivación.

## 22. Orden recomendado de commits

Cada commit debe ser pequeño, compilable y con sus tests:

1. `test(printing): freeze current preticket fixtures`
2. `feat(printing): add distributed printing feature flags`
3. `feat(printing): add printer device domain model`
4. `feat(printing): add route domain model`
5. `feat(printing): add print job state model`
6. `feat(migrations): add distributed printing schema`
7. `feat(printing): add station credentials and tokens`
8. `feat(printing): add printer inventory sync api`
9. `refactor(ui): separate local printers from routes`
10. `feat(printing): add route administration api`
11. `feat(ui): add print destination configuration`
12. `feat(printing): add atomic job claiming`
13. `feat(printing): add secure printing hub`
14. `feat(printing): add station worker and polling`
15. `feat(printing): add versioned document formatters`
16. `feat(printing): enqueue authoritative pretickets`
17. `refactor(ui): request pretickets through backend`
18. `feat(printing): add production areas`
19. `feat(printing): enqueue kitchen and bar orders transactionally`
20. `feat(printing): add operations dashboard`
21. `ops(printing): extend install and diagnostic scripts`
22. `test(printing): add multi-station end-to-end suite`
23. `refactor(printing): remove legacy assignments after rollout`

## 23. Fuentes técnicas verificadas

- [QZ Tray: Print Server](https://qz.io/docs/print-server): confirma que QZ puede aceptar conexiones desde otro host, alternativa evaluada y descartada como arquitectura principal.
- [QZ Tray: Headless](https://qz.io/docs/headless): documenta allowlist y ejecución sin interfaz.
- [QZ Tray: Windows Service](https://qz.io/docs/windows-service): advierte que la instalación como servicio usa NSSM y no está oficialmente soportada.
- [QZ Tray: Signing](https://qz.io/docs/signing): confirma firma SHA-512 y firma automática por operación para eliminar diálogos.
- [QZ Tray: Printer Status](https://qz.io/docs/printer-status): documenta callbacks y estados obtenidos de CUPS/Winspool, sujetos a capacidad del driver.
- [Microsoft: usuarios y grupos en ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/groups): confirma que los grupos están en memoria y que su pertenencia no persiste ante una conexión nueva.
- [Microsoft: autenticación y autorización en SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz): documenta `accessTokenFactory` y el transporte del bearer token por query string cuando el navegador usa WebSockets o Server-Sent Events.

## 24. Decisión final

La implementación debe evolucionar desde “el navegador imprime en su impresora local” hacia “el backend crea trabajos y cada estación imprime únicamente los suyos”.

La topología definitiva de la primera versión será:

```text
Dispositivos solicitantes
├── PC mozo sin QZ
├── Tablet sin QZ
└── Caja, si origina una solicitud
          │
          ▼
Backend + PostgreSQL
├── autorización
├── reglas
├── snapshots
├── cola persistente
└── notificación SignalR
          │
          ▼
Estaciones receptoras
├── PC caja + QZ + impresora principal
├── PC cocina + QZ + impresora cocina
└── PC barra + QZ + impresora barra
```

Este modelo resuelve el escenario real planteado sin exigir que la computadora del mozo conozca, instale o alcance directamente la ticketera de caja.
