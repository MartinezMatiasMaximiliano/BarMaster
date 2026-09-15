# Impresión distribuida de comandas, cuentas previas y comprobantes de pago

Actualizado el **15 de septiembre de 2026** a partir del código del workspace, incluidos los cambios locales. Describe la implementación del repositorio; no acredita que esta versión o sus migraciones estén desplegadas en producción.

## 1. Objetivo y principio arquitectónico

El módulo se diseñó alrededor de una única fuente de verdad: **el backend decide qué se imprime, en qué impresora y con qué contenido**. El navegador que está físicamente conectado a la impresora no decide el destino ni reconstruye una solicitud comercial por su cuenta. Su responsabilidad es mucho más acotada: identificarse como estación, recibir o reservar un trabajo ya resuelto por el servidor, convertir el contenido versionado a ESC/POS y entregarlo a QZ Tray.

Una regla representa exactamente un destino:

`una impresora + un tipo de salida + un momento`

Por eso cada regla referencia una sola impresora. Una misma impresora sí puede tener muchas reglas. Por ejemplo:

- `KP-1025 (Cocina) + Comanda + AlCargarProductosMesa`.
- `KP-1025 (Caja) + Ticket + AlCobrarProductosSinFacturar`.

SignalR no transporta el ticket completo ni sustituye la persistencia. Sólo avisa que hay trabajos disponibles. La base de datos sigue siendo la fuente durable: el trabajador consulta periódicamente el backend aunque no reciba una señal. Recupera los trabajos pendientes que todavía no vencieron; no existe entrega automática indefinida.

## 2. Componentes principales

El módulo está dividido en estas capas:

1. Los productores de eventos comerciales, como `VisitasServices`, informan que ocurrió algo imprimible.
2. `ServicioDocumentoImpresion` valida el hecho comercial y crea un contenido versionado.
3. `ServicioReglaImpresion` resuelve todas las reglas habilitadas que coinciden con el documento y el momento.
4. `ServicioTrabajoImpresion` crea un trabajo durable por cada regla encontrada.
5. `NotificadorHubImpresion` avisa por SignalR a las estaciones afectadas.
6. El trabajador del front reserva sus trabajos, los imprime con QZ Tray y confirma el resultado.
7. La API administrativa consulta, cancela o genera reimpresiones. El componente de seguimiento se conserva en el front, pero actualmente no está montado en la página de Impresiones.

No se agregó una capa de repositorios específica para impresión. Los servicios usan `ICurrentDbContext` y `AppDbContext` directamente. Esta decisión evita repositorios que sólo repetirían las operaciones de Entity Framework y, sobre todo, permite que la reserva concurrente use SQL PostgreSQL con `FOR UPDATE SKIP LOCKED` dentro del servicio que conoce la transición de estados. Los repositorios existentes del resto del sistema no fueron reemplazados.

## 3. Modelo de dominio

### 3.1 Tipos de salida configurables

`TipoSalidaImpresion` tiene dos valores:

- `Comanda`: salida operativa para cocina, barra u otra zona de producción.
- `Ticket`: salida legible para el cliente; incluye la cuenta previa (preticket) y el comprobante de pago no fiscal.

### 3.2 Momentos configurables

`MomentoImpresion` tiene cuatro valores:

- `AlCargarProductosMesa`.
- `AlCobrarProductosFacturados`.
- `AlGenerarPreticket`.
- `AlCobrarProductosSinFacturar`.

El enum conserva los cuatro valores, pero el backend y la interfaz actuales sólo admiten estas combinaciones:

| Acción de la interfaz | Tipo de salida | Momento | Productor |
|---|---|---|---|
| Comandas | `Comanda` | `AlCargarProductosMesa` | `VisitasServices.AgregarProductos`. |
| Cuenta previa | `Ticket` | `AlGenerarPreticket` | Solicitud explícita desde «Imprimir cuenta». |
| Comprobante de pago | `Ticket` | `AlCobrarProductosSinFacturar` | `PagosServices.PagarProductos`, después del pago confirmado. |

`AlCobrarProductosFacturados` permanece por compatibilidad con el modelo anterior, pero no tiene productor de impresión fiscal ni se admite para crear/reactivar reglas. Las configuraciones anteriores incompatibles se pueden listar, desactivar conservando su combinación original o eliminar.

### 3.3 Tipos de documento internos

`TipoDocumentoImpresion` diferencia el contenido real del trabajo:

- `Comanda`.
- `Preticket`.
- `ComprobantePago`.

Al resolver reglas, una `Comanda` se asocia con la salida `Comanda`; cualquier documento orientado al cliente se asocia con la salida `Ticket`. Así la interfaz conserva las dos opciones simples solicitadas sin perder la capacidad interna de distinguir preticket de comprobante.

### 3.4 Estados de un trabajo

`EstadoTrabajoImpresion` modela el ciclo completo:

- `Pendiente`: creado y listo para ser reservado.
- `Reservado`: asignado temporalmente a una estación mediante `IdReserva`.
- `Enviando`: el front informó que está por entregarlo a QZ Tray.
- `AceptadoPorCola`: QZ Tray aceptó el trabajo. No significa que exista confirmación física de papel impreso.
- `ReintentoProgramado`: falló antes de comenzar un envío ambiguo y puede volver a intentarse automáticamente.
- `RequiereAtencion`: pudo haberse enviado; repetirlo automáticamente podría duplicar una impresión.
- `Vencido`: superó `VenceEn`.
- `Cancelado`: un operador lo canceló antes de que entrara en una fase no cancelable.

La distinción entre fallo anterior y posterior a `Enviando` es intencional. Antes de enviar es seguro reintentar; después de iniciar el envío no siempre puede saberse si Windows aceptó el trabajo, por lo que se exige intervención humana.

## 4. Tablas y columnas

### 4.1 `EstacionesImpresion`

Representa un equipo o instalación del navegador que puede acceder a impresoras locales.

| Columna | Finalidad |
|---|---|
| `Id` | Identificador único de la estación. |
| `IdSucursal` | Sucursal propietaria. Impide que una estación opere impresoras de otra sucursal. |
| `IdInstalacionCliente` | Identidad estable generada en el navegador. Permite reencontrar la estación para la misma instalación. |
| `Nombre` | Nombre humano, por ejemplo `Caja principal` o `Cocina`. |
| `Habilitada` | Autoriza o bloquea la operación de la estación. |
| `CreadoEn` | Fecha UTC de alta inicial. |
| `VistaPorUltimaVezEn` | Último latido o sincronización. Se usa para determinar si está en línea. |
| `RevocadaEn` | Fecha UTC de revocación. Si tiene valor, la estación no puede operar. |
| `HashCredencial` | SHA-256 de la credencial local. La credencial en texto claro nunca se guarda en la base. |
| `CredencialCreadaEn` | Fecha UTC de emisión o rotación de la credencial. |
| `UltimaVersionAgente` | Última versión informada por el trabajador web. |
| `UltimaVersionQz` | Última versión detectada de QZ Tray. |

La combinación `IdSucursal + IdInstalacionCliente` es única. La eliminación de una sucursal queda restringida por las relaciones del módulo; una estación elimina en cascada únicamente su inventario de impresoras.

### 4.2 `Impresoras`

Es el inventario que cada estación descubre a través de QZ Tray.

| Columna | Finalidad |
|---|---|
| `Id` | Identificador interno de la impresora. |
| `IdEstacion` | Estación a la que está físicamente asociada. |
| `NombreSistema` | Nombre exacto informado por Windows/QZ, usado para imprimir. |
| `NombreSistemaNormalizado` | Variante normalizada para comparar sin duplicar una cola por diferencias de mayúsculas. |
| `NombreVisible` | Nombre asignado por el usuario, por ejemplo `Cocina`. |
| `Formato` | Formato de envío. Actualmente siempre `Crudo`, es decir ESC/POS. |
| `AnchoPapelMm` | Ancho lógico, limitado por restricción a 58 u 80 mm; el modelo usa 58 mm por defecto. |
| `Codificacion` | Codificación de caracteres para QZ/ESC-POS; por defecto `CP858`. |
| `Habilitada` | Permite usar la impresora como destino. |
| `EliminadaEn` | Fecha UTC de baja lógica explícita; oculta el registro de los listados ordinarios. |
| `Presente` | Indica si apareció en la sincronización más reciente. |
| `VistaPorUltimaVezEn` | Última detección UTC de esa cola. |
| `UltimoEstado` | Estado opcional informado por el agente o QZ. |
| `ActualizadoEn` | Última modificación de inventario o configuración. |

`IdEstacion + NombreSistemaNormalizado` es único. No detectar una cola marca `Presente = false`; eliminarla explícitamente marca `EliminadaEn`, la deshabilita y la oculta. La sincronización periódica puede detectarla físicamente, pero no la restaura. Una búsqueda manual puede devolverla como encontrada; guardarla con `Restaurar = true` recupera el mismo registro. La baja exige quitar primero todas sus reglas, incluso las deshabilitadas.

### 4.3 `ReglasImpresion`

Define la decisión de enrutamiento. No existe una tabla intermedia de destinos porque cada regla apunta a una sola impresora.

| Columna | Finalidad |
|---|---|
| `Id` | Identificador de la regla. |
| `IdSucursal` | Sucursal propietaria y límite de seguridad. |
| `IdImpresora` | Único destino de esta regla. |
| `TipoSalida` | `Comanda` o `Ticket`. Se almacena como texto en español. |
| `Momento` | Uno de los cuatro momentos configurables. Se almacena como texto en español. |
| `Habilitada` | Determina si participa en la resolución. |
| `CreadoEn` | Fecha UTC de creación. |
| `ActualizadoEn` | Fecha UTC del último cambio. |

La combinación `IdSucursal + IdImpresora + TipoSalida + Momento` es única. Esto evita duplicar accidentalmente la misma regla, pero permite crear muchas reglas para una impresora si cambia el tipo o el momento. También permite que un mismo evento produzca varios trabajos cuando existen reglas coincidentes para impresoras diferentes.

### 4.4 `TrabajosImpresion`

Es la cola durable y la evidencia operativa de cada impresión decidida por el backend.

| Columna | Finalidad |
|---|---|
| `Id` | Identificador del trabajo individual. |
| `IdSolicitud` | Agrupa todos los trabajos originados por una misma solicitud. |
| `IdSucursal` | Sucursal propietaria. |
| `IdEstacion` | Estación que debe ejecutar el trabajo. |
| `IdRegla` | Regla que produjo el trabajo. Puede quedar nula si la regla se desvincula, sin borrar el historial. |
| `IdPersonaSolicitante` | Persona que originó la impresión, cuando existe. |
| `IdTrabajoReimpreso` | Trabajo original del que nació una reimpresión. |
| `TipoDocumento` | `Comanda`, `Preticket` o `ComprobantePago`. |
| `VersionEsquema` | Versión de la estructura JSON del contenido. |
| `VersionPlantilla` | Versión de la interpretación visual/ESC-POS. |
| `ContenidoJson` | Instantánea `jsonb` del contenido decidido por el backend. |
| `NombreSistemaImpresora` | Instantánea del nombre físico de destino. Evita que renombrar una impresora altere un trabajo existente. |
| `NombreVisibleImpresora` | Instantánea del nombre visible del destino al crear el trabajo. |
| `Formato` | Instantánea del formato, actualmente `Crudo`. |
| `AnchoPapelMm` | Instantánea del ancho de papel. |
| `Codificacion` | Instantánea de la codificación. |
| `Copias` | Cantidad de copias, restringida entre 1 y 10. |
| `Estado` | Estado actual de la máquina de estados. |
| `ClaveIdempotencia` | Clave única por sucursal que evita duplicar trabajos ante reintentos HTTP o transaccionales. |
| `TipoEntidadOrigen` | Tipo lógico de la entidad que produjo la impresión, por ejemplo `Visita`. |
| `IdEntidadOrigen` | Identificador de esa entidad en forma textual. |
| `CreadoEn` | Fecha UTC de creación. |
| `DisponibleEn` | Momento desde el que puede reservarse; permite programar un reintento. |
| `VenceEn` | Límite después del cual ya no debe imprimirse automáticamente. |
| `IdReserva` | Token aleatorio de la reserva vigente. La estación debe devolverlo en cada transición. |
| `ReservaVenceEn` | Límite temporal de propiedad de la reserva. |
| `EnvioIniciadoEn` | Momento en que se pasó a `Enviando`. |
| `AceptadoPorColaEn` | Momento en que QZ confirmó la aceptación. |
| `CantidadIntentos` | Cantidad de reservas/intentos realizados. Nunca puede ser negativa. |
| `UltimoCodigoError` | Código estable y en español del último fallo. |
| `UltimoDetalleError` | Detalle técnico acotado para diagnóstico. |

Los índices parciales aceleran dos consultas críticas: trabajos `Pendiente/ReintentoProgramado` por estación y reservas `Reservado/Enviando` próximas a vencer. La clave de idempotencia es única dentro de la sucursal. `Estado`, `IdEstacion`, `IdReserva`, `ReservaVenceEn` y `VenceEn` son tokens de concurrencia EF para impedir que una actualización sobrescriba una reserva modificada por otro proceso.

**El trabajo ya no contiene `IdImpresora` ni una relación con el inventario.** Conserva su estación, contenido y opciones de destino como instantáneas. Renombrar/eliminar una impresora o quitar su regla no recalcula ni elimina los trabajos existentes. Al reservar no se vuelve a resolver la regla: el trabajador verifica que el nombre exacto de cola guardado exista localmente.

### 4.5 `ComandosPedidoVisita`

Registra comandos de carga de productos para que repetir una solicitud no vuelva a agregar productos ni genere comandas duplicadas.

| Columna | Finalidad |
|---|---|
| `IdComando` | Identificador idempotente enviado por el front; es la clave primaria. |
| `IdVisita` | Visita o mesa sobre la que se ejecutó el comando. |
| `CreadoEn` | Fecha UTC de registro. |

Además, `ProductosPorVisita.IdComandoAgregado` guarda en cada renglón el comando que lo agregó. La combinación de registro de comando y marca en el producto permite reconocer tanto un reintento concurrente como uno posterior.

## 5. Backend en detalle

### 5.1 Configuración y contexto

`ConfiguracionImpresionDistribuida.ConfigurarImpresionDistribuida` configura nombres de tabla, conversiones de enums a texto, longitudes, relaciones, restricciones e índices. `AppDbContext` expone `EstacionesImpresion`, `Impresoras`, `ReglasImpresion`, `TrabajosImpresion` y `ComandosPedidoVisita`.

`Program.cs` registra todos los servicios, SignalR, el trabajador de mantenimiento, las opciones `ImpresionDistribuida` y `FirmaQz`, las políticas `Impresion.*`, los límites de frecuencia y el hub `/hubs/impresion`.

### 5.2 `EstacionesImpresionController`

- `Registrar`: registra o actualiza la estación para una instalación y sucursal.
- `ObtenerActual`: recupera la estación asociada al identificador estable del navegador.
- `RegistrarLatido`: actualiza la actividad de una estación autorizada.
- `EstablecerHabilitada`: habilita o deshabilita administrativamente.
- `Revocar`: deshabilita y marca la estación como revocada.

Delega la lógica en `IServicioEstacionImpresion`/`ServicioEstacionImpresion`. El servicio siempre filtra por `IdSucursal`, valida que una credencial de estación no opere otra estación y calcula la respuesta sin confiar en identificadores provenientes sólo del cliente.

### 5.3 `SeguridadEstacionesImpresionController`

- `DarAlta`: operación administrativa que registra la estación y emite la primera credencial si todavía no existe.
- `CrearSesion`: intercambia la credencial por un JWT corto de estación. Es anónimo a nivel HTTP porque la propia credencial es el factor de autenticación, pero tiene límite de frecuencia.
- `RotarCredencial`: invalida la credencial anterior, emite otra y reactiva la estación.

`ServicioCredencialEstacion` genera 32 bytes aleatorios, entrega la credencial una sola vez y persiste únicamente su SHA-256. La comparación usa tiempo constante. El JWT contiene sucursal, inquilino, estación y `TipoAuth = estacion_impresion` y vence según `HorasTokenEstacion`.

### 5.4 `ImpresorasController`

- `Sincronizar`: una estación autenticada informa las colas que QZ detectó.
- `ObtenerParaEstacion`: devuelve su propio inventario.
- `ObtenerParaSucursal`: devuelve todas las impresoras para administración y reglas.
- `Actualizar`: cambia nombre visible, ancho, codificación y habilitación.
- `Eliminar`: baja lógica; exige quitar antes todas las reglas asociadas.
- `Probar`: crea un trabajo remoto real; no imprime directamente desde la petición administrativa.

`ServicioImpresora` normaliza nombres, crea impresoras nuevas, actualiza las existentes y marca como ausentes las que no aparecieron. Fuerza `Formato = Crudo`, ya que el usuario no debe elegir accidentalmente un protocolo incompatible desde el formulario.

### 5.5 `ReglasImpresionController`

- `ObtenerTodas`: lista reglas con nombres de impresora/estación y disponibilidad.
- `Guardar`: crea o actualiza una regla.
- `Eliminar`: elimina la regla y deja nula su referencia en los trabajos históricos. Desactivar una regla se realiza mediante `Guardar` con `Habilitada = false`.
- `Validar`: informa impresoras ausentes, deshabilitadas o estaciones desconectadas.

`ServicioReglaImpresion.ResolverAsync` convierte el tipo documental en `Comanda` o `Ticket` y devuelve las reglas habilitadas compatibles cuyo momento coincide y cuya impresora no está eliminada. Valida pertenencia a sucursal y rechaza duplicados. Cada destino recibe el documento completo: no hay filtros por producto, categoría o sector de producción.

`ProteccionConfiguracionImpresion` devuelve 409 con `CONFIGURACION_IMPRESION_BLOQUEADA_CAJA_ACTIVA` si hay una caja sin cierre en la sucursal. Se aplica a actualizar/restaurar o eliminar una impresora y a eliminar una regla. **Guardar reglas, cambiar su destino o activarlas/desactivarlas no está protegido por esa comprobación en el servicio actual.** Tampoco se bloquean búsqueda/sincronización, pruebas o nombre del equipo.

### 5.6 `SolicitudesImpresionController` y `ServicioDocumentoImpresion`

`SolicitudesImpresionController.Preticket` recibe `IdComando`, `IdVisita` e IDs opcionales de productos. `ServicioDocumentoImpresion.SolicitarPreticketAsync`:

1. Carga la visita dentro de la sucursal actual.
2. Sólo acepta productos de esa visita que aún no estén pagados.
3. Agrupa renglones equivalentes.
4. Calcula el total en el backend.
5. Crea `PreticketContenido` versión 1 con la leyenda no fiscal.
6. Solicita trabajos para `TipoDocumento = Preticket` y `Momento = AlGenerarPreticket`.

`EncolarComandasAsync` recibe exclusivamente los productos recién agregados, arma `ComandaContenido` y solicita trabajos para `Comanda + AlCargarProductosMesa`. Si no hay una regla configurada, la venta no falla: se registra una advertencia y no se crea la comanda.

La comanda agrupa por nombre y notas, ordena por descripción y no incluye precios. `AreaProduccion` contiene actualmente «Comanda»; no corresponde a un enrutamiento por área. Los errores controlados de impresión permiten continuar sin comanda; otros errores no tienen esa misma garantía.

`EncolarComprobantePagoAsync` construye el comprobante no fiscal desde los productos cobrados y el movimiento confirmado. Incluye cantidades, precios y notas, sucursal, mesa/origen, fecha UTC del movimiento, total, abonado, vuelto, medio de pago e ID del movimiento. Agrega los datos disponibles de empresa, CUIT, dirección, teléfono y email, además del subtotal de productos, ajuste del pedido, descuento y recargo. El ajuste se calcula como `total + descuento - recargo - subtotal`, para representar la diferencia con el total comercial del pedido. Usa versiones de esquema/plantilla 1 y la clave base `payment:{idPago}`.

### 5.7 Integración con `VisitasServices`

`AgregarProductos` recibe `idComando`. Dentro de la transacción, `RegistrarComandoAsync` usa `INSERT ... ON CONFLICT DO NOTHING`; luego agrega productos marcándolos con `IdComandoAgregado` y llama a `EncolarComandasAsync`. La notificación SignalR se realiza después de terminar la transacción. Repetir el mismo comando devuelve la visita existente y no descuenta stock, agrega productos ni imprime otra vez.

`useAgregarPedidos` conserva el UUID del envío y lo pasa a `AgregarProductosAVisita` por HTTP. Si un cliente omite `idComando`, el controlador genera uno nuevo, por lo que ese cliente no obtiene idempotencia entre solicitudes independientes. Las notificaciones comerciales de `NotificacionesHub` son un circuito distinto del hub de impresión.

#### 5.7.1 Integración con pagos, Delivery/Takeaway y ticket virtual

`PagosServices.PagarProductos` llama a `EncolarComprobantePagoAsync` después de guardar el pago. En mesa utiliza los productos cobrados, tanto para cobro completo como por partes. En Delivery/Takeaway cobra los productos del pedido completo y usa su total comercial como base, incluyendo descuentos y recargos.

La llamada no se condiciona a `GenerarFactura`: aunque el circuito comercial genere una factura electrónica, esta salida sigue siendo un comprobante no fiscal en `AlCobrarProductosSinFacturar`. El módulo no imprime el documento fiscal de ARCA.

Los errores de encolado se capturan y registran sin convertir un pago confirmado en fallido. **El guardado del pago y el encolado no comparten una transacción:** un fallo puede dejar un pago confirmado sin trabajo de impresión y no existe reconstrucción automática de esos comprobantes desde pagos sin encolar.

La creación/modificación de Delivery/Takeaway usa su propio flujo de productos en `DeliveryTakeawayServices`, sin llamar a `EncolarComandasAsync`. La comanda automática de mesa no debe darse por implementada en esos flujos.

El ticket virtual (`/ticket/:tenant/:id`) consulta `GET /Ticket/{id}` con el ámbito del inquilino y muestra los productos vinculados al movimiento, importes, fecha, empresa/sucursal, mesa, mozo y medio de pago. No consume trabajos de impresión ni ejecuta QZ. El trabajador y la configuración distribuida se implementan en `frontendMozo`; `FrontEndCliente` no incorpora esas funciones.

### 5.8 `TrabajosImpresionController` y `ServicioTrabajoImpresion`

La API de estación expone:

- `Reservar`: obtiene un lote de trabajos mediante reserva exclusiva.
- `MarcarEnviando`: registra el comienzo del envío a QZ.
- `RenovarReserva`: extiende una impresión que está tardando.
- `MarcarAceptadoPorCola`: cierra exitosamente el trabajo.
- `MarcarFallido`: registra código, detalle, posibilidad de reintento y ambigüedad.

La consulta `ObtenerPorSolicitud` está disponible con `Impresion.Usar` (identidad de sucursal). Las operaciones administrativas con `Impresion.Configurar` exponen:

- `Consultar`.
- `Reintentar`, sólo para `RequiereAtencion` y contenido todavía retenido: crea otro trabajo con solicitud y clave nuevas, enlazado por `IdTrabajoReimpreso`, copiando contenido y destino históricos. El original conserva su estado y recibe el motivo en su detalle; no se redirige a otra impresora ni se revalida el inventario actual.
- `Cancelar`, rechaza `Enviando` y `AceptadoPorCola`; para `Cancelado/Vencido` no realiza otro cambio. Admite pendientes, reservas, reintentos y atención. Cancelar un trabajo ambiguo no retira lo que ya pudo enviarse a la cola local.
- `ObtenerPanel`, que agrega pendientes, trabajos con atención, aceptados del día, estaciones fuera de línea e impresoras ausentes.

`CrearEnrutadosAsync` resuelve reglas, toma una instantánea del destino y crea un trabajo por regla. La clave se compone a partir de la clave comercial y el ID de regla. Si dos solicitudes concurrentes intentan crear lo mismo, el índice único conserva una sola copia y el servicio recupera el conjunto ya existente.

`ReservarUnoAsync` usa `FOR UPDATE SKIP LOCKED`. Dos trabajadores concurrentes no reciben el mismo trabajo: uno bloquea y actualiza el renglón; el otro lo omite. Cada transición valida `IdEstacion`, `IdReserva`, estado y vencimiento.

Los trabajos comerciales y las reimpresiones vencen a los 30 minutos; las pruebas remotas, a los 10 minutos. Los fallos reintentables previos al envío programan una espera de `2^min(intentos, 5)` segundos. Las consultas permiten estado, estación y fechas, con límite predeterminado 100 y máximo 500. Los aceptados del día del panel se cuentan desde el inicio del día UTC.

### 5.9 SignalR

`HubImpresion` requiere una identidad de estación válida. Al conectarse valida la sucursal/estación y agrega la conexión al grupo `impresion:{inquilino}:{sucursal}:{estacion}`.

`NotificadorHubImpresion.TrabajosDisponiblesAsync` publica `TrabajosImpresionDisponibles` únicamente en los grupos afectados. El mensaje no contiene datos sensibles ni reemplaza la cola; sólo despierta al trabajador para que llame a `Reservar`.

### 5.10 Mantenimiento

`ServicioMantenimientoImpresion` recorre las conexiones de `MasterDbContext.Tenants` cuando el módulo está habilitado y sólo mantiene bases que registran `20260907175031_EspanolizarModuloImpresion` como aplicada. Un error en una base se registra y permite continuar con las demás:

- vence trabajos `Pendiente/ReintentoProgramado` cuya fecha límite terminó;
- recupera reservas vencidas anteriores al envío como `ReintentoProgramado`, o `Vencido` si agotaron su plazo;
- lleva reservas vencidas posteriores al inicio de envío a `RequiereAtencion`;
- reemplaza contenido histórico antiguo por `{}` según `DiasRetencionContenido`, conservando metadatos y trazabilidad.

Una reserva abandonada en `Enviando` pasa a atención incluso si agotó el vencimiento comercial, para conservar la advertencia de una posible impresión efectiva. Las actualizaciones respetan la concurrencia de reservas renovadas o modificadas por otros procesos. Consultar el panel también realiza vencimiento, recuperación y retención de la sucursal; reservar realiza vencimiento y recuperación de la estación. El contenido eliminado por retención no puede reimprimirse desde ese trabajo.

### 5.11 QZ Tray y firma

`QzController` entrega el certificado público, firma resúmenes SHA-512, informa salud básica y ofrece diagnóstico protegido. `ServicioFirmaQz` carga el PFX y la raíz, valida fechas, extensiones, cadena y huellas configuradas, y firma sin exponer la clave privada. `ValidadorOpcionesFirmaQz` impide iniciar una configuración habilitada pero inválida.

`MiddlewareExcepcionesImpresion` convierte excepciones controladas en respuestas con `error.codigo` y `error.mensaje`, y evita exponer detalles internos ante fallos inesperados.

Los nombres `Controller`, `InvokeAsync`, `ExecuteAsync`, `OnConnectedAsync`, `Validate` y `Dispose`, además de claves como `status`, `data`, `copies`, `encoding` y `jobName`, se mantienen cuando son contratos obligatorios de ASP.NET, .NET, Axios o QZ Tray. No son nombres de dominio pendientes de traducción; cambiarlos impediría que esas bibliotecas invoquen el código.

## 6. Frontend en detalle

### 6.1 Página única

`Impresiones.jsx` monta `EstadoQz` y dos apartados en orden:

1. Encontrar impresoras y asignarles un nombre.
2. Definir destinos de impresión automática para Comandas, Cuenta previa y Comprobante de pago.

Los apartados son componentes internos de `pages/Impresiones/componentes`. `/configuracion_impresion`, `/destinos_impresion` y `/estado_impresion` redirigen a `/impresiones`. **`EstadoImpresiones.jsx` y sus clientes HTTP se conservan, pero el componente no está importado ni montado en la página actual:** no hay una tercera sección accesible de seguimiento, cancelación o reimpresión en esas rutas. Esas operaciones permanecen disponibles por API.

La página consulta la caja activa al montarse y bloquea guardar/editar/eliminar impresoras y quitar reglas mientras carga, si hay caja activa o si la consulta falla. Los selectores e interruptores de reglas siguen disponibles. El estado de caja no se vuelve a consultar automáticamente desde esa página; las operaciones protegidas siguen verificándose en el backend.

La edición del nombre del equipo y de las impresoras también permite guardar con Enter. `AtajosTeclado`, montado en ambos frontends, activa el envío del formulario o la acción principal declarada mediante `data-enter-action="true"`; las ediciones en línea delimitan su ámbito con `data-enter-scope="true"`. Respeta validaciones, acciones deshabilitadas y el modal visible superior. Los campos de varias líneas, selectores y botones/enlaces enfocados conservan su comportamiento propio; mantener Enter presionado no repite la acción.

Escape ejecuta Cancelar/Cerrar del modal visible superior mediante `data-escape-action="true"`, conservando la limpieza y comprobaciones de su callback. La escucha en captura evita que el cierre nativo de MUI/Bootstrap se ejecute además y cierre otro modal. Si un menú o selector está desplegado, primero se conserva su cierre nativo. Un cierre deshabilitado o en un ámbito ocupado no se ejecuta; mantener Escape presionado no cierra los modales inferiores. Sin una acción de cierre declarada se mantiene el comportamiento de la biblioteca.

### 6.2 Identificación y descubrimiento

`ContextoImpresion` centraliza la conexión a QZ, su versión, impresoras detectadas y último error. Su proveedor inicia/detiene el trabajador al montarse/desmontarse. `EncontrarImpresoras` da de alta la estación, permite editar el nombre del equipo, conecta QZ, descubre colas y sincroniza inventario. Excluye explícitamente `Microsoft Print to PDF`; esto no certifica que todas las demás colas sean ticketeras ESC/POS.

Los resultados distinguen nuevas, ya guardadas y eliminadas que pueden restaurarse. La tabla de guardadas muestra las impresoras de todos los equipos de la sucursal, con cola, equipo, presencia y cantidad de reglas. Permite editar nombre visible, eliminar y solicitar una prueba remota durable. Las tarjetas de búsqueda realizan una prueba directa en QZ local. Ancho, codificación y habilitación son opciones de la API, pero no tienen controles de selección en la pantalla actual: al guardar se mantienen los valores del registro o sus valores de respaldo.

`ReglasImpresion` guarda automáticamente al seleccionar un destino o cambiar el interruptor, permite agregar varias impresoras para una acción y ofrece desactivar/quitar configuraciones anteriores incompatibles. `EstadoQz` comprueba la conexión local y permite reintentar: «Esta PC está lista para imprimir» no confirma reglas, disponibilidad de todas las impresoras ni salida física de papel.

El botón «Imprimir cuenta» de `MesaModalUnificado` solicita todo lo pendiente por `solicitarPreticket(idVisita)` y comunica que la solicitud fue recibida para el equipo configurado. No requiere una conexión QZ local en el equipo solicitante. La API admite selección de productos, aunque ese botón no la utiliza.

`almacenamientoEstacion.js` conserva:

- `barmaster.impresion.idInstalacionCliente`, estable para el navegador;
- el ID de estación por inquilino y sucursal;
- la credencial por inquilino y sucursal;
- el JWT de estación sólo en `sessionStorage` y únicamente mientras no esté próximo a vencer.

La limpieza de sesión elimina datos sensibles generales, pero preserva la identidad local necesaria para no registrar un equipo nuevo en cada ingreso.

La identidad pertenece al navegador/perfil y origen web, no a toda la PC. Otro navegador, perfil u origen puede representar otra instalación. El alta reutiliza la credencial guardada y, si falta o quedó obsoleta, solicita una rotación administrativa antes de crear la sesión de estación.

### 6.3 API del front

`apiImpresion.js` separa tres clientes:

- el cliente normal de la aplicación para acciones del usuario;
- el cliente administrativo para configuración;
- el cliente de estación con su JWT propio para inventario y trabajos.

Todas las funciones de dominio tienen nombres en español: `guardarReglaImpresion`, `reservarTrabajosImpresion`, `marcarTrabajoEnviando`, `marcarTrabajoAceptado`, `fallarTrabajoImpresion`, etc.

Los clientes administrativo y de estación adjuntan `X-Tenant-ID` y sus tokens correspondientes. Ante un 403 administrativo se permite un solo intento adicional con el otro token disponible de sucursal/usuario. `Impresion.Configurar` admite identidad de sucursal o identidad `admin` con `RequestedRole = Admin`, ambas con inquilino y sucursal válidos; el JWT de estación no autoriza configuración.

### 6.4 Trabajador de impresión

`trabajadorImpresion.js`:

1. Comprueba las banderas de funcionalidad y credenciales.
2. Usa `navigator.locks` con el bloqueo exclusivo `barmaster-printing-worker` por origen/perfil; si la API no existe, arranca igualmente y la exclusión depende de las reservas del backend.
3. Renueva la sesión de estación y conecta QZ.
4. Sincroniza impresoras y abre SignalR.
5. Reserva hasta tres trabajos y los procesa secuencialmente.
6. Valida/formatea el documento y verifica el nombre exacto de cola local antes de marcar el envío.
7. Marca `Enviando`, renueva la reserva mientras imprime y entrega ESC/POS a QZ.
8. Marca `AceptadoPorCola` o informa un fallo estructurado.
9. Consulta periódicamente aunque SignalR no entregue una señal.

El ciclo espera 300 ms después de recibir trabajos; sin trabajos espera 15 segundos o 5 segundos si el hub está desconectado. La señal interrumpe la espera y un contador evita perder notificaciones recibidas durante reserva/procesamiento. `crearEsperaTrabajador` limpia temporizadores y escucha la cancelación. Se reintenta iniciar el hub desconectado, además de su reconexión automática. Cada 30 segundos, cuando el ciclo llega a ese punto, se sincroniza inventario como actividad/latido. Las reservas se renuevan cada 15 segundos durante la entrega a QZ. Errores generales reinician el trabajador a los 5 segundos; credencial inválida o estación deshabilitada lo detienen.

`formateadoresTrabajos.js` sólo interpreta versiones de esquema y plantilla 1. Valida JSON, líneas no vacías, cantidades enteras positivas, descripción, fecha, notas e importes finitos. Un documento inválido o incompatible pasa a atención sin reintento automático. El formateo ocurre antes de `Enviando`, para evitar clasificar un error de contenido como una entrega ambigua.

`formateadorPreticket.js` agrupa líneas y recalcula subtotales/total desde los datos del backend. Los formateadores también generan comanda y comprobante de pago, usando 32 columnas lógicas para 58 mm y 48 para 80 mm. El comprobante envuelve textos largos, formatea CUIT e ID de pago, muestra ajustes/importes y datos opcionales y fija la fecha a `America/Argentina/Buenos_Aires`; comanda y preticket usan la zona local del navegador con formato `es-AR`.

`limpiarTextoEscPos` elimina caracteres de control del texto comercial, conserva saltos de línea y convierte tabulaciones en espacios, para impedir que nombres/notas introduzcan instrucciones ESC/POS. No se aplica a las instrucciones de la plantilla. `impresionQz.js` traduce opciones a `copies`, `encoding` y `jobName`. El trabajador omite la segunda comprobación de impresora en ese adaptador porque ya la realizó antes del envío.

El diagnóstico registra etapas y tiempos de pedido, encolado, señal, reserva, formato y aceptación QZ. El front conserva hasta 1000 entradas en `barmaster_impresion_diagnostico`, escribe en consola y ofrece utilidades de limpieza/descarga NDJSON; no implica que exista un botón de descarga en la pantalla vigente. El backend correlaciona etapas con `[IMPRESION_DIAGNOSTICO]` e IDs.

## 7. Migraciones vigentes

| Migración | Cambio observado en el archivo actual |
|---|---|
| `20260828132818_AddQzPrintingStations` | Antecedente de estaciones y configuración QZ. |
| `20260903200842_AddDistributedPrinting` | Incorpora el módulo distribuido inicial. |
| `20260904193900_SimplifyDistributedPrinting` | Simplifica el modelo anterior de impresión. |
| `20260907175031_EspanolizarModuloImpresion` | Elimina `PrintJobs`, `VisitOrderCommands`, `PrintRoutes`, `PrinterDevices` y `PrintingStations` y crea las tablas del módulo en español. Renombra `ProductosPorVisita.AddCommandId` e índice asociado. |
| `20260907191830_DesacoplarTrabajosDeImpresoras` | Elimina FK, índice y columna `TrabajosImpresion.IdImpresora`; agrega `NombreVisibleImpresora` con valor predeterminado vacío. |
| `20260911135500_MarcarImpresorasEliminadas` | Agrega `Impresoras.EliminadaEn`, nullable, para baja lógica y restauración. |

La documentación anterior citaba `20260904222221_EspanolizarModuloImpresion`, que no es el identificador presente en el repositorio. Tampoco corresponde afirmar que la españolización vigente sólo renombra tablas y preserva todos los datos: **su `Up` contiene `DropTable` y `CreateTable`, sin copia de datos del módulo anterior**. La migración de desacoplamiento también elimina una columna y no rellena el nombre visible desde el inventario previo; trabajos existentes pueden quedar con ese nombre vacío.

Los nombres ingleses en migraciones históricas identifican el esquema de origen. El modelo y snapshot vigentes usan nombres españoles. Antes de aplicar el historial a una base con datos existentes debe evaluarse el SQL y la preservación de esos datos. Esta actualización documental no aplica ni modifica migraciones.

## 8. Configuración operativa

Backend, sección `ImpresionDistribuida`:

| Opción | Valor predeterminado, también presente en `appsettings.json` |
|---|---|
| `Habilitada` / `TrabajadorHabilitado` | `true` / `true` |
| `SegundosLatido` | 30 |
| `SegundosHastaFueraDeLinea` | 90 |
| `SegundosConsultaPeriodica` | 15 |
| `SegundosReserva` | 60 |
| `TamanoLoteReserva` | 5 |
| `DiasRetencionContenido` | 30 |
| `HorasTokenEstacion` | 8 |
| `SegundosMantenimiento` | 60 |

El backend limita las reservas con `TamanoLoteReserva`; el front pide tres. Los intervalos del trabajador web son constantes locales: **no se descargan desde `SegundosLatido` ni `SegundosConsultaPeriodica`**. Cambiar esas opciones del backend no modifica automáticamente los intervalos web. La creación/reserva en `ServicioTrabajoImpresion` exige tanto `Habilitada` como `TrabajadorHabilitado`.

Backend, sección `FirmaQz`: habilitación, PFX, contraseña, raíz, huellas esperadas, días mínimos restantes y excepción controlada de desarrollo.

Frontend:

- `VITE_IMPRESION_DISTRIBUIDA_HABILITADA`.
- `VITE_TRABAJADOR_IMPRESION_HABILITADO`.

Ambas banderas tienen valor predeterminado `true`, son opciones de build y son independientes de las del backend.

### 8.1 Instalador descargable y preparación de Windows

`/primeros_pasos` (Ayuda → Primeros pasos) muestra el estado local de QZ, ofrece `BarMaster-Impresion-Setup.exe` y enlaza a Impresiones. El paquete se genera con `tools/qz/windows/Build-PrintingSetup.ps1` e incluye scripts, manifiesto, logos y raíz pública. Descarga QZ por HTTPS del repositorio oficial si falta o es anterior al manifiesto, verifica SHA-256 y firma Authenticode y conserva una versión más nueva. El flujo está preparado para Windows 10/11 de 64 bits, x64 o ARM64.

Al elegir «Instalar y configurar» solicita UAC. La fase elevada instala/configura QZ, cierra sus instancias mediante `preinstall`, coloca `override.crt` y configura `authcert.override`; el proceso original abre QZ con el usuario habitual. No distribuye claves privadas ni instala la raíz en el almacén general de Windows. Las utilidades capturan su salida sin abrir consola y el arranque final usa el ejecutable gráfico de QZ. La instalación debe realizarse fuera de una impresión en curso porque cierra instancias de QZ.

`npm run dev` y `npm run build` ejecutan la preparación del instalador en Windows. El EXE se genera en `frontendMozo/public/downloads`, no se versiona y Vite lo copia al build. En CI Linux se debe proporcionar el artefacto generado en Windows antes del build. El build del instalador ejecuta `--verify` para extraer/validar recursos sin instalar; `--preview` permite renderizar el diálogo sin UAC. Esto no equivale a una instalación completa en una máquina limpia. El EXE BarMaster generado no está firmado; el instalador oficial QZ sí se verifica.

Si cambia la raíz del backend, actualizar `tools/qz/windows/public/override.crt` y su hash en `qz-manifest.json`, regenerar el instalador y actualizar los equipos. El certificado del paquete debe corresponder a la raíz del backend. Instalar primero el driver y verificar una página de prueba de Windows.

Los scripts de `tools/printing` son auxiliares para preparar/comprobar una estación; su README conserva referencias a pantallas anteriores. Para el flujo actual usar Primeros pasos → Impresiones y el [README del instalador](tools/qz/windows/README.md).

## 9. Garantías y límites

- El backend determina contenido y destinos.
- Una regla tiene exactamente una impresora; una impresora admite muchas reglas.
- SignalR acelera; la cola permite recuperar trabajos mientras no hayan vencido y la estación esté operativa.
- Las reservas y claves de idempotencia evitan duplicados por concurrencia o reintentos.
- La estación sólo accede a su inventario y sus trabajos.
- La configuración siempre se limita a la sucursal autenticada.
- `AceptadoPorCola` confirma aceptación por QZ/cola local, no salida física del papel.
- El comprobante de pago automático ya está integrado y siempre es no fiscal; no existe impresión fiscal distribuida.
- No hay redirección automática a otra impresora/estación ni filtros por producto/categoría/sector.
- No hay garantía de exactamente una impresión física: reimprimir un trabajo ambiguo puede duplicar papel.
- Configurar reglas después de un evento comercial no reproduce automáticamente ese evento.
- Un destino desconectado o una cola ausente pueden tener trabajos encolados; deben recuperarse antes del vencimiento.
- El contenido borrado por retención no puede reimprimirse desde el trabajo histórico.
- BarMaster debe permanecer abierto en el equipo de impresión, con QZ, drivers y colas disponibles. El trabajador opera desde cualquier pantalla, pero no es un servicio de Windows independiente del navegador.
- El panel y las acciones de seguimiento existen en la API; su componente no está montado en la página actual.

## 10. Verificación de esta actualización

Se contrastaron modelos y configuración EF, servicios comerciales, servicios/controladores de impresión, autenticación y hub, mantenimiento, migraciones, rutas/pantallas de `frontendMozo`, trabajador, formateadores y scripts del instalador. Se revisó también `FrontEndCliente` para delimitar su participación.

Pruebas ejecutadas el 15 de septiembre de 2026:

| Verificación | Resultado |
|---|---|
| `dotnet test BackEndAPI.Tests/BackEndAPI.Tests.csproj --filter FullyQualifiedName~Impresion --no-restore --verbosity minimal` | Compilación Debug correcta; 26 pruebas aprobadas y 5 fallidas por falta de `BARMASTER_TEST_POSTGRES_ADMIN`. Las cinco requieren PostgreSQL aislado (reserva/concurrencia, mantenimiento y baja/restauración persistente); el código actual falla si falta esa configuración, no omite silenciosamente la integración. |
| Desde `frontendMozo`: `npm run test:run -- src/services/impresion src/pages/Impresiones/componentes/__tests__ src/components/impresion/__tests__` | 44 pruebas aprobadas y 1 fallida, en 14 archivos. El test de agrupación de preticket espera `2 x Café`, mientras el formateador actual genera `2x Café`. |

La diferencia de formato del test ya estaba presente en el código revisado. Esta tarea modifica la documentación; no corrige ese test ni cambia el sistema. No se aplicaron migraciones, no se ejecutó impresión física ni instalación completa y no se verificó el despliegue productivo. Los conteos y afirmaciones de compilación Release/build productivo de la documentación anterior no se reutilizan como evidencia actual.

## 11. Cambios reflejados respecto de la documentación anterior

| Cambio actual | Implementación de referencia |
|---|---|
| Comprobante automático no fiscal con datos comerciales, ajustes y pago confirmado. | `Services/PagosServices.cs`, `Impresion/Documentos/ServicioDocumentoImpresion.cs` y `formateadoresTrabajos.js`. |
| Tres acciones compatibles, varios destinos y tratamiento de reglas anteriores. | `Impresion/Reglas/ServicioReglaImpresion.cs` y `pages/Impresiones/componentes/ReglasImpresion.jsx`. |
| Trabajos independientes del inventario, con nombres de destino históricos. | `Models/Impresion/TrabajoImpresion.cs` y migración de desacoplamiento. |
| Baja lógica persistente de impresoras y restauración explícita desde búsqueda manual. | `Impresion/Dispositivos/ServicioImpresora.cs` y migración `MarcarImpresorasEliminadas`. |
| Restricciones específicas con caja activa y protección de transiciones concurrentes. | `ProteccionConfiguracionImpresion.cs` y `Data/Configuraciones/ConfiguracionImpresionDistribuida.cs`. |
| Formateo antes del envío, validación de documentos, limpieza de texto ESC/POS, esperas interrumpibles y diagnóstico por etapas. | `services/impresion/trabajadorImpresion.js`, `esperaTrabajador.js`, `textoEscPos.js` y `registroDiagnosticoImpresion.js`. |
| Página de dos apartados, indicador QZ, tabla de equipos de la sucursal y alta/recuperación de credenciales. | `pages/Impresiones/Impresiones.jsx`, `EncontrarImpresoras.jsx` y `services/impresion/apiImpresion.js`. |
| Ayuda inicial e instalador Windows descargable, generado antes de desarrollo/build. | `pages/Ayuda/PrimerosPasos.jsx`, `scripts/preparar-instalador-impresion.mjs` y `tools/qz/windows`. |

Las referencias identifican archivos y módulos del backend (`BackEndAPI/Impresion`, `Models`, `Services` y `Data`), del frontend (`frontendMozo/src/services/impresion` y `pages`) y de preparación del instalador (`frontendMozo/scripts` y `tools/qz/windows`). Son referencias del estado observado, no una cronología de despliegues.

Verificación posterior del manejo de teclado, el mismo 15 de septiembre: 57 pruebas aprobadas (53 de teclado, incluyendo ambos frontends y un modal real de stock, y 4 de la pantalla de impresoras); `npm run build` correcto en ambos frontends. El lint de los archivos nuevos pasó en `frontendMozo`. En `FrontEndCliente` la ejecución de ESLint está bloqueada por una configuración previa inválida en `.eslintrc.cjs` (`react/prop-types` como propiedad de nivel superior).

Al incorporar Escape, la suite `src/services/__tests__/atajosTeclado.test.jsx` pasó con 78 pruebas, incluyendo ambas implementaciones, bloqueo de cierre durante guardado, modales superpuestos, un Select/Dialog MUI real y un modal Bootstrap real. Se volvió a compilar ambos frontends correctamente y pasó el lint de los archivos del manejador y pruebas en `frontendMozo`.

En Index e Index2, los números escritos fuera de un campo editable se agregan automáticamente al código de mozo y enfocan su casilla, incluidos los del teclado numérico y los ceros iniciales. Si el código contiene exactamente cuatro dígitos y coincide con el código de servicio del mozo activo, el siguiente número reemplaza el código completo para iniciar el cambio de mozo; esto también funciona con el foco en la propia casilla. Los siguientes dígitos continúan el nuevo código. `useCodigoMozoTeclado` consulta el estado actual de Redux y reutiliza la detección de modales visibles del servicio de atajos. Cualquier modal activo (MesaModal o superior, incluso renderizado en un portal) bloquea la redirección y el reinicio; los modales ocultos no los bloquean. La escritura en otros campos conserva su comportamiento normal. El listener se retira al salir de estas pantallas. Las 17 pruebas del hook y las 78 de Enter/Escape pasaron juntas (95 en total).

En Index e Index2, Backspace (flecha de borrado) y Supr/Delete eliminan el último dígito del código de mozo por pulsación y enfocan la casilla. Dentro de esa casilla también borran de a uno, incluso con una selección activa; el código vacío permanece vacío. Se mantienen las restricciones de modales activos y la edición normal en otros campos. Verificación: 21 pruebas del hook y 78 de Enter/Escape aprobadas (99 en total).
