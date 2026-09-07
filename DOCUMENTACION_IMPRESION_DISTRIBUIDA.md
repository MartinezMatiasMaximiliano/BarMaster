# Impresión distribuida de comandas y tickets

## 1. Objetivo y principio arquitectónico

El módulo se diseñó alrededor de una única fuente de verdad: **el backend decide qué se imprime, en qué impresora y con qué contenido**. El navegador que está físicamente conectado a la impresora no decide el destino ni reconstruye una solicitud comercial por su cuenta. Su responsabilidad es mucho más acotada: identificarse como estación, recibir o reservar un trabajo ya resuelto por el servidor, convertir el contenido versionado a ESC/POS y entregarlo a QZ Tray.

Una regla representa exactamente un destino:

`una impresora + un tipo de salida + un momento`

Por eso cada regla referencia una sola impresora. Una misma impresora sí puede tener muchas reglas. Por ejemplo:

- `KP-1025 (Cocina) + Comanda + AlCargarProductosMesa`.
- `KP-1025 (Cocina) + Ticket + AlCobrarProductosFacturados`.

SignalR no transporta el ticket completo ni sustituye la persistencia. Sólo avisa que hay trabajos disponibles. La base de datos sigue siendo la fuente durable: si SignalR se desconecta o el navegador se abre más tarde, el trabajador consulta periódicamente el backend y recupera los trabajos pendientes.

## 2. Componentes principales

El módulo está dividido en estas capas:

1. Los productores de eventos comerciales, como `VisitasServices`, informan que ocurrió algo imprimible.
2. `ServicioDocumentoImpresion` valida el hecho comercial y crea un contenido versionado.
3. `ServicioReglaImpresion` resuelve todas las reglas habilitadas que coinciden con el documento y el momento.
4. `ServicioTrabajoImpresion` crea un trabajo durable por cada regla encontrada.
5. `NotificadorHubImpresion` avisa por SignalR a las estaciones afectadas.
6. El trabajador del front reserva sus trabajos, los imprime con QZ Tray y confirma el resultado.
7. El panel administrativo consulta, cancela o genera reimpresiones sin intervenir directamente en QZ Tray.

No se agregó una capa de repositorios específica para impresión. Los servicios usan `ICurrentDbContext` y `AppDbContext` directamente. Esta decisión evita repositorios que sólo repetirían las operaciones de Entity Framework y, sobre todo, permite que la reserva concurrente use SQL PostgreSQL con `FOR UPDATE SKIP LOCKED` dentro del servicio que conoce la transición de estados. Los repositorios existentes del resto del sistema no fueron reemplazados.

## 3. Modelo de dominio

### 3.1 Tipos de salida configurables

`TipoSalidaImpresion` tiene dos valores:

- `Comanda`: salida operativa para cocina, barra u otra zona de producción.
- `Ticket`: salida legible para el cliente. En la implementación actual incluye al preticket y permitirá incluir comprobantes de pago.

### 3.2 Momentos configurables

`MomentoImpresion` tiene cuatro valores:

- `AlCargarProductosMesa`.
- `AlCobrarProductosFacturados`.
- `AlGenerarPreticket`.
- `AlCobrarProductosSinFacturar`.

Los cuatro ya pueden guardarse y seleccionarse en el front. Actualmente existen productores completos para `AlCargarProductosMesa` y `AlGenerarPreticket`. Los dos momentos de cobro quedan deliberadamente definidos en el modelo y en la interfaz, pero todavía no crean trabajos: su significado comercial y sus puntos exactos de integración se incorporarán cuando se cierre esa definición.

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
| `AnchoPapelMm` | Ancho lógico, limitado por restricción a 58 u 80 mm. |
| `Codificacion` | Codificación de caracteres para QZ/ESC-POS; por defecto `CP858`. |
| `Habilitada` | Permite usar la impresora como destino. |
| `Presente` | Indica si apareció en la sincronización más reciente. |
| `VistaPorUltimaVezEn` | Última detección UTC de esa cola. |
| `UltimoEstado` | Estado opcional informado por el agente o QZ. |
| `ActualizadoEn` | Última modificación de inventario o configuración. |

`IdEstacion + NombreSistemaNormalizado` es único. Una impresora puede tener muchas reglas y muchos trabajos históricos. No se elimina al dejar de aparecer: se marca `Presente = false`, preservando reglas, auditoría e historial.

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
| `IdImpresora` | Impresora de destino. |
| `IdRegla` | Regla que produjo el trabajo. Puede quedar nula si la regla se desvincula, sin borrar el historial. |
| `IdPersonaSolicitante` | Persona que originó la impresión, cuando existe. |
| `IdTrabajoReimpreso` | Trabajo original del que nació una reimpresión. |
| `TipoDocumento` | `Comanda`, `Preticket` o `ComprobantePago`. |
| `VersionEsquema` | Versión de la estructura JSON del contenido. |
| `VersionPlantilla` | Versión de la interpretación visual/ESC-POS. |
| `ContenidoJson` | Instantánea `jsonb` del contenido decidido por el backend. |
| `NombreSistemaImpresora` | Instantánea del nombre físico de destino. Evita que renombrar una impresora altere un trabajo existente. |
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

Los índices parciales aceleran dos consultas críticas: trabajos `Pendiente/ReintentoProgramado` por estación y reservas `Reservado/Enviando` próximas a vencer. La clave de idempotencia es única dentro de la sucursal.

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
- `Probar`: crea un trabajo remoto real; no imprime directamente desde la petición administrativa.

`ServicioImpresora` normaliza nombres, crea impresoras nuevas, actualiza las existentes y marca como ausentes las que no aparecieron. Fuerza `Formato = Crudo`, ya que el usuario no debe elegir accidentalmente un protocolo incompatible desde el formulario.

### 5.5 `ReglasImpresionController`

- `ObtenerTodas`: lista reglas con nombres de impresora/estación y disponibilidad.
- `Guardar`: crea o actualiza una regla.
- `Deshabilitar`: realiza baja lógica.
- `Validar`: informa impresoras ausentes, deshabilitadas o estaciones desconectadas.

`ServicioReglaImpresion.ResolverAsync` convierte el tipo documental en `Comanda` o `Ticket` y devuelve todas las reglas habilitadas cuyo momento coincide. Valida pertenencia a sucursal y rechaza duplicados.

### 5.6 `SolicitudesImpresionController` y `ServicioDocumentoImpresion`

`SolicitudesImpresionController.Preticket` recibe `IdComando`, `IdVisita` e IDs opcionales de productos. `ServicioDocumentoImpresion.SolicitarPreticketAsync`:

1. Carga la visita dentro de la sucursal actual.
2. Sólo acepta productos de esa visita que aún no estén pagados.
3. Agrupa renglones equivalentes.
4. Calcula el total en el backend.
5. Crea `PreticketContenido` versión 1 con la leyenda no fiscal.
6. Solicita trabajos para `TipoDocumento = Preticket` y `Momento = AlGenerarPreticket`.

`EncolarComandasAsync` recibe exclusivamente los productos recién agregados, arma `ComandaContenido` y solicita trabajos para `Comanda + AlCargarProductosMesa`. Si no hay una regla configurada, la venta no falla: se registra una advertencia y no se crea la comanda.

### 5.7 Integración con `VisitasServices`

`AgregarProductos` recibe `idComando`. Dentro de la transacción, `RegistrarComandoAsync` usa `INSERT ... ON CONFLICT DO NOTHING`; luego agrega productos marcándolos con `IdComandoAgregado` y llama a `EncolarComandasAsync`. La notificación SignalR se realiza después de terminar la transacción. Repetir el mismo comando devuelve la visita existente y no descuenta stock, agrega productos ni imprime otra vez.

### 5.8 `TrabajosImpresionController` y `ServicioTrabajoImpresion`

La API de estación expone:

- `Reservar`: obtiene un lote de trabajos mediante reserva exclusiva.
- `MarcarEnviando`: registra el comienzo del envío a QZ.
- `RenovarReserva`: extiende una impresión que está tardando.
- `MarcarAceptadoPorCola`: cierra exitosamente el trabajo.
- `MarcarFallido`: registra código, detalle, posibilidad de reintento y ambigüedad.

La API administrativa expone:

- `ObtenerPorSolicitud` y `Consultar`.
- `Reintentar`, que crea un trabajo nuevo enlazado por `IdTrabajoReimpreso`; no altera la evidencia original.
- `Cancelar`, permitido sólo antes de una entrega posiblemente efectiva.
- `ObtenerPanel`, que agrega pendientes, trabajos con atención, aceptados del día, estaciones fuera de línea e impresoras ausentes.

`CrearEnrutadosAsync` resuelve reglas, toma una instantánea del destino y crea un trabajo por regla. La clave se compone a partir de la clave comercial y el ID de regla. Si dos solicitudes concurrentes intentan crear lo mismo, el índice único conserva una sola copia y el servicio recupera el conjunto ya existente.

`ReservarUnoAsync` usa `FOR UPDATE SKIP LOCKED`. Dos trabajadores concurrentes no reciben el mismo trabajo: uno bloquea y actualiza el renglón; el otro lo omite. Cada transición valida `IdEstacion`, `IdReserva`, estado y vencimiento.

### 5.9 SignalR

`HubImpresion` requiere una identidad de estación válida. Al conectarse valida la sucursal/estación y agrega la conexión al grupo `impresion:{inquilino}:{sucursal}:{estacion}`.

`NotificadorHubImpresion.TrabajosDisponiblesAsync` publica `TrabajosImpresionDisponibles` únicamente en los grupos afectados. El mensaje no contiene datos sensibles ni reemplaza la cola; sólo despierta al trabajador para que llame a `Reservar`.

### 5.10 Mantenimiento

`ServicioMantenimientoImpresion` recorre las bases de los inquilinos que ya tienen aplicada `20260904222221_EspanolizarModuloImpresion`:

- vence trabajos cuya fecha límite terminó;
- recupera reservas vencidas anteriores al envío como `ReintentoProgramado`;
- lleva reservas vencidas posteriores al inicio de envío a `RequiereAtencion`;
- reemplaza contenido histórico antiguo por `{}` según `DiasRetencionContenido`, conservando metadatos y trazabilidad.

### 5.11 QZ Tray y firma

`QzController` entrega el certificado público, firma resúmenes SHA-512, informa salud básica y ofrece diagnóstico protegido. `ServicioFirmaQz` carga el PFX y la raíz, valida fechas, extensiones, cadena y huellas configuradas, y firma sin exponer la clave privada. `ValidadorOpcionesFirmaQz` impide iniciar una configuración habilitada pero inválida.

`MiddlewareExcepcionesImpresion` convierte excepciones controladas en respuestas con `error.codigo` y `error.mensaje`, y evita exponer detalles internos ante fallos inesperados.

Los nombres `Controller`, `InvokeAsync`, `ExecuteAsync`, `OnConnectedAsync`, `Validate` y `Dispose`, además de claves como `status`, `data`, `copies`, `encoding` y `jobName`, se mantienen cuando son contratos obligatorios de ASP.NET, .NET, Axios o QZ Tray. No son nombres de dominio pendientes de traducción; cambiarlos impediría que esas bibliotecas invoquen el código.

## 6. Frontend en detalle

### 6.1 Página única

`Impresiones.jsx` concentra las tres operaciones en orden:

1. Encontrar impresoras y asignarles un nombre.
2. Crear reglas eligiendo impresora, `Comanda/Ticket` y el momento.
3. Consultar estado, cancelar o rehacer impresiones.

Los tres apartados son componentes internos de `pages/Impresiones/componentes`; no son páginas independientes. Las rutas antiguas redirigen a `/impresiones`, por lo que tampoco quedan tres experiencias divergentes en la navegación.

### 6.2 Identificación y descubrimiento

`ContextoImpresion` centraliza la conexión a QZ, su versión, impresoras detectadas y último error. `EncontrarImpresoras` da de alta la estación, conecta QZ, descubre colas, sincroniza el inventario con el backend y permite nombre, habilitación y prueba. `ReglasImpresion` administra las reglas y `EstadoImpresiones` presenta el seguimiento y las acciones operativas.

`almacenamientoEstacion.js` conserva:

- `barmaster.impresion.idInstalacionCliente`, estable para el navegador;
- el ID de estación por inquilino y sucursal;
- la credencial por inquilino y sucursal;
- el JWT de estación sólo en `sessionStorage` y únicamente mientras no esté próximo a vencer.

La limpieza de sesión elimina datos sensibles generales, pero preserva la identidad local necesaria para no registrar un equipo nuevo en cada ingreso.

### 6.3 API del front

`apiImpresion.js` separa tres clientes:

- el cliente normal de la aplicación para acciones del usuario;
- el cliente administrativo para configuración;
- el cliente de estación con su JWT propio para inventario y trabajos.

Todas las funciones de dominio tienen nombres en español: `guardarReglaImpresion`, `reservarTrabajosImpresion`, `marcarTrabajoEnviando`, `marcarTrabajoAceptado`, `fallarTrabajoImpresion`, etc.

### 6.4 Trabajador de impresión

`trabajadorImpresion.js`:

1. Comprueba las banderas de funcionalidad y credenciales.
2. Usa `navigator.locks` para que una sola pestaña sea trabajadora.
3. Renueva la sesión de estación y conecta QZ.
4. Sincroniza impresoras y abre SignalR.
5. Reserva hasta tres trabajos.
6. Verifica que la impresora siga presente.
7. Marca `Enviando`, renueva la reserva mientras imprime y entrega ESC/POS a QZ.
8. Marca `AceptadoPorCola` o informa un fallo estructurado.
9. Consulta periódicamente aunque SignalR no entregue una señal.

`formateadoresTrabajos.js` interpreta sólo versiones conocidas. Si la versión de esquema o plantilla no es compatible, rechaza el trabajo en lugar de imprimir contenido incorrecto. `formateadorPreticket.js` agrupa productos, calcula subtotales y genera ESC/POS. `impresionQz.js` traduce las opciones internas en español a las claves literales requeridas por QZ Tray (`copies`, `encoding`, `jobName`).

## 7. Migración `20260904222221_EspanolizarModuloImpresion`

La migración es **no destructiva**. No elimina tablas, columnas ni datos. Hace lo siguiente:

1. Renombra `PrintingStations`, `PrinterDevices`, `PrintRoutes`, `PrintJobs` y `VisitOrderCommands` a sus nombres españoles.
2. Renombra todas las columnas propias de esas tablas, manteniendo `Id` e `IdSucursal` porque ya eran correctas.
3. Renombra `ProductosPorVisita.AddCommandId` a `IdComandoAgregado`.
4. Convierte los valores textuales persistidos de formatos, tipos de salida, momentos, documentos y estados a los valores españoles de los enums.
5. Renombra claves primarias, foráneas, restricciones e índices.
6. Recrea los dos índices parciales de trabajos con filtros expresados mediante los nuevos estados españoles.
7. Incluye un `Down` simétrico para volver al esquema y valores anteriores si fuera necesario.

Los identificadores ingleses aparecen dentro de esta migración y de migraciones históricas porque son los **nombres de origen que PostgreSQL debe encontrar para poder renombrarlos**. Modificar o traducir migraciones ya aplicadas rompería el historial de EF. El modelo vigente, el snapshot actual y la migración nueva terminan en tablas, columnas, índices y restricciones de dominio en español.

## 8. Configuración operativa

Backend, sección `ImpresionDistribuida`:

- `Habilitada`.
- `TrabajadorHabilitado`.
- `SegundosLatido`.
- `SegundosHastaFueraDeLinea`.
- `SegundosConsultaPeriodica`.
- `SegundosReserva`.
- `TamanoLoteReserva`.
- `DiasRetencionContenido`.
- `HorasTokenEstacion`.
- `SegundosMantenimiento`.

Backend, sección `FirmaQz`: habilitación, PFX, contraseña, raíz, huellas esperadas, días mínimos restantes y excepción controlada de desarrollo.

Frontend:

- `VITE_IMPRESION_DISTRIBUIDA_HABILITADA`.
- `VITE_TRABAJADOR_IMPRESION_HABILITADO`.

## 9. Garantías y límites

- El backend determina contenido y destinos.
- Una regla tiene exactamente una impresora; una impresora admite muchas reglas.
- SignalR acelera, pero la base de datos garantiza entrega posterior.
- Las reservas y claves de idempotencia evitan duplicados por concurrencia o reintentos.
- La estación sólo accede a su inventario y sus trabajos.
- La configuración siempre se limita a la sucursal autenticada.
- `AceptadoPorCola` confirma aceptación por QZ/cola local, no salida física del papel.
- Los momentos de cobro ya son configurables, pero su generación automática queda pendiente de la definición funcional correspondiente.

## 10. Verificaciones realizadas

- Compilación `Release` del backend.
- 30 pruebas .NET, incluidas autorización, aislamiento por estación, idempotencia, credenciales y QZ. La prueba de reserva concurrente contra PostgreSQL también forma parte del conjunto, pero sólo ejecuta su tramo de integración cuando se define `BARMASTER_TEST_POSTGRES_ADMIN`.
- Compilación de producción del frontend.
- 11 pruebas Vitest del módulo y limpieza de sesión.
- Comprobación de Entity Framework sin cambios de modelo pendientes.
- Generación del SQL entre `20260904193900_SimplifyDistributedPrinting` y `20260904222221_EspanolizarModuloImpresion`, verificando que se compone de renombrados, conversiones de valores e índices, sin recreación destructiva de tablas.

En el entorno de esta implementación no había una instancia local de PostgreSQL disponible. Por eso se verificaron la compilación de la migración, la ausencia de diferencias entre el modelo y el snapshot, y el SQL generado, pero no se aplicó la migración a una base de datos real desde este equipo.
