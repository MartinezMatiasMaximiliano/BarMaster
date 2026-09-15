# Verificación de llamadas frontendMozo / backend

Implementación del plan secuencial. No se modificaron `FrontEndCliente`, `APIMenus`, `APITipoMovimientosCaja`, `APIRoles` ni el comportamiento de la opción «Facturar ticket». Los cambios de impresión presentes al iniciar se conservaron. No se conectaron bases reales ni se emitieron comprobantes fiscales o impresiones físicas.

## Resultado por paso

| Paso | Corrección y evidencia | Límite de verificación |
|---|---|---|
| 1. Productos | PATCH con opcionales nulos; omitir precio, IVA o activo conserva el valor. Cuatro casos backend: activar, desactivar, editar y ceros explícitos. Fallaban antes del cambio. | Servicio con repositorio doble; sin servidor real. |
| 2. Delivery/takeaway | Ambos formularios envían `ListaProductos`, con cantidades y detalles. Backend espera la carga de productos antes de guardar (se retiró `async void`) y registra el envío en el total. Pruebas de contrato y recarga con repositorio EF. | EF InMemory verifica persistencia de productos; el descuento de stock se verifica por cantidades enviadas al servicio. Bloqueos y transacciones de stock en PostgreSQL pendientes. |
| 3. Entrega | `PATCH /DeliveryTakeaway/Entregado?id=…&entregado=…`. Omitir `entregado` conserva el comportamiento anterior (true). La entrega no cambia el estado de la visita ni pagos. Reversión y recarga verificadas; pedidos antiguos cerrados con productos pendientes pueden cobrarse. | Recarga en EF InMemory y cobro con doble del repositorio de pagos. |
| 4. Descuentos | Modal → callbacks de mesa/delivery → `Pagar` → `descuentoDecimal`. Un solo importe neto para suficiencia, movimiento, argumento de caja y vuelto. En cobros parciales se conserva el total de la visita menos sus ajustes. Un intento insuficiente no cambia productos ni total. | Casos de efectivo, otro medio, pago total/parcial y rechazo; sin integración fiscal ni persistencia SQL de pagos. |
| 5. Cuentas corrientes | DELETE en `/CuentasCorrientes/Eliminar`, query `IdCuenta`. Se preservan mensajes del servidor y restricciones de balance distinto de cero. | Pruebas de adaptador y servicio. |
| 6. Mi Plan | GET autenticado `/Empresa/Plan`, empresa exclusivamente desde claim `IdEmpresa`; se carga su `TipoSubscripcion`. Respuesta `id`, `nombre`, `precio`, `prestaciones`; 204 si no tiene suscripción. Pantalla sin fechas ni estado de vencimiento supuesto. | Casos con/sin plan, precio cero, prestaciones y selección por empresa del token. No se ejercitó el pipeline JWT completo con servidor desplegado. |
| 7. PDF/cierre | Eliminados helper, importaciones y llamadas a `GenerarTicketPDF`. Cobro actualiza Redux aunque SignalR esté desconectado. Cierre no marca productos como pagados y muestra el rechazo del backend. | Pruebas de hooks; validación backend de cierre conservada. |
| 8. Mensajes antiguos | Solicitar cuenta solo informa la solicitud. No escribe pagos ni invoca `Items/...`. Pedidos entrantes requieren GUID de visita y productos existentes en el menú actual; se valida todo antes de escribir. | El contrato antiguo de `FrontEndCliente` sigue enviando identificadores incompatibles. Ese recorrido completo NO está resuelto. |
| 9. Ticket público | Cliente Axios independiente, tenant explícito de la URL, sin Authorization ni cookies de sesión. | Adaptador Axios real verificado con y sin sesión de otro tenant. Validaciones backend sin cambios. |
| 10. SignalR | Conversión y validación de números de mesa antes de enviar. Valores inválidos generan aviso visible y no se transportan. | Serialización/lectura con `JsonHubProtocol` real y pruebas del emisor; sin conexión de red al hub. |
| 11. Monto recibido | Normalización acepta `MontoAbonado`/`montoAbonado`, incluido cero. Una segunda normalización conserva el pago y el cliente. | Pruebas de datos consumidos por el detalle del cobro. |
| 12. Costo | `MappearMenu` toma `costoProduccion` y conserva cero al guardar edición. | Prueba de mapeo hasta payload PATCH. |
| 13. Tipos de envío | PATCH devuelve `TipoEnvioDTO` actualizado con id, nombre y precio. | Controlador y adaptador/listado, incluido precio cero. |
| 14. Domicilio | Normalización compatible con `Domicilo`/`domicilo` y las formas correctas. | Listado, detalle, alta y edición usan el mismo domicilio en las pruebas. |
| 15. Helpers | Sin consumidores confirmados: eliminados helpers antiguos de mesas, reserva individual, autenticación duplicada e items. | Búsqueda de referencias y compilación. El inventario final también encontró `BuscarVisitaPorId`; ahora delega al contrato vigente. |

## Inventario final de contratos

Contraste de código fuente de adaptadores, controladores y DTOs. No equivale a una prueba de extremo a extremo de cada ruta. Salvo las excepciones indicadas, el cliente compartido agrega `Authorization: Bearer <token>` y `X-Tenant-ID` de la sesión; cuerpos JSON. Productos usa multipart/form-data.

| Adaptador | Métodos y rutas | Parámetros/cuerpo y respuesta revisados |
|---|---|---|
| APIProductos | GET/POST/PATCH/DELETE `/Productos`; GET `/Productos/{id}` | DELETE query `IdProducto`; alta `CrearProductoDTO`; PATCH `ModificarProductoDTO`, campos omitidos nulos; `ProductoDTO` normaliza precio/IVA. |
| APIDeliveryTakeaway | GET `/DeliveryTakeaway`; POST `/DeliveryTakeaway/Crear`; PATCH `/DeliveryTakeaway/ModificarDatos`; PATCH `/DeliveryTakeaway/Entregado`; DELETE `/DeliveryTakeaway` | Alta `CrearDeliveryTakeawayDTO` y `ListaProductos: [{IdProducto, Detalles, Cantidad}]`. Datos `IdDeliveryTakeaway`; entrega query `id, entregado`; delete query `id`. Respuesta de pedido/productos/pago normalizada. Cambios de productos delegan a visitas. |
| APIPagos | POST `/Pagar` | `IdVisita`, `ListaIdsProductos`, `IdTipoMovimiento`, `MontoAbonado`, `descuentoDecimal`; respuesta `PagoDTO`. |
| APICuentasCorrientes | GET `/CuentasCorrientes`, GET `/{IdCuenta}`; POST `/Crear`, `/Modificar`, `/CrearMovimiento`; DELETE `/Eliminar` | Alta/modificación con Nombre, Telefono, Domicilio; modificación incluye IdCuenta/Descuento. Movimiento y eliminación usan query IdCuenta. Normalización de cuenta y movimientos. |
| APIEmpresas | GET `/Empresa`, `/Empresa/Sucursales/Resumen`, `/Empresa/Plan` | Resumen query desde/hasta. Empresa autenticada desde claim. Plan DTO o 204; no fechas de vigencia. |
| APIMesas | GET/POST/PATCH/DELETE `/Mesa`; PATCH `/Mesa/AbrirCerrar` | Alta geometría/plano; modificación Id; eliminar query IdMesa; abrir/cerrar IdMesa, Abrir, CodigoServicioMozo; respuesta de visita. |
| APIVisitas | GET `/TodasLasVisitas`, `/VisitasActivas`, `/Visita`; POST `/AgregarProductoAVisita`; DELETE `/Visitas/EliminarProductos`; PATCH `/Visitas/CambiarEstadoProducto` | Consulta query IdVisita; agregar query IdVisita/idComando y colección de productos; borrar body IdVisita/IdsProductos; estado body IdProducto/Estado. Alias individual usa `/Visita?IdVisita=…`. |
| APITicket | GET `/Ticket/{idMovimientoCaja}` | Cliente público; solo tenant de URL. Respuesta `TicketVirtualDTO`. |
| APITipoEnvios | GET/POST `/TipoEnvios`; PATCH/DELETE `/TipoEnvios/{id}` | Nombre/Precio; PATCH responde objeto con id/nombre/precio. |
| APICategorias | GET/POST `/Categorias`; GET/PUT/DELETE `/Categorias/{id}`; PATCH `/Categorias/ActivarDesactivar` | Nombre/Activo; activar/desactivar query IdCategoria. Respuestas de categoría o confirmación. |
| APICaja | GET `/Cajas/Activa`, `/Cajas`; POST `/Cajas/Abrir`; PATCH `/Cajas/Cerrar`; GET `/MovimientosCaja/Caja/{id}` | Apertura montoApertura; cierre idCaja/montoCierre. Normalización de caja y movimientos. |
| APIMovimientosCaja | GET `/TipoMovimientosCaja`; POST `/MovimientosCaja` | Query Entorno; body idTipoMovimientoCaja/montoAbonado/montoTotal/descripcion. Caja desde sucursal autenticada. No se modificó APITipoMovimientosCaja. |
| APIPersonas | GET `/Mozos`, `/ListaEmpleados`; POST `/Registrar`; PUT `/Modificar`, `/activarDesactivar/{id}`, `/Persona/Personaje`, `/CambiarContraseña`; DELETE `/Eliminar/{id}` | DTO de persona; personaje IdPersona/PersonajeId. Cambio de contraseña usa explícitamente USER_token y tenant. |
| APIPlanos | GET `/ListaPlanosSucursal`, `/Plano`; POST/PUT/DELETE `/Plano` | Consulta/eliminación query IdPlano; modificación IdPlano, Nombre, Detalles. |
| APIReservas | GET/POST/PUT/DELETE `/Reservas` | Alta/modificación DTO de reserva; delete query Id. Sin helper de consulta individual inexistente. |
| APIStock | GET `/Stock`, `/Stock/alertas`, `/Stock/movimientos/{id}`; PUT `/Stock/{id}`, `/Stock/movimientos/{id}` | Configuración ControlaStock/EnviarAlerta/CantidadMinima/CantidadInicial; movimiento Cantidad/Motivo. |
| authService | POST `/Login`, `/LoginPersona` | Username/Password; login de persona con headers de sucursal; respuesta de token. APIAuth duplicada eliminada. |
| HubConnMozo/useSignalR | RegistrarMozoAGrupo, RecargarTicket, MesaCerrada, RecargarMenu, StockActualizado, RecargarDeliveryTakeaway, NotificarVisitaActualizada | Enteros de mesa en los métodos correspondientes; mensajes recibidos PagarMesa/PagarMesaSeparado son solicitudes. Backend y FrontEndCliente sin cambios de contrato SignalR. |

Los módulos excluidos se mantuvieron intactos. El módulo de impresión conserva sus clientes/credenciales y cambios anteriores; su regresión se ejecutó mediante dobles, sin enviar trabajos a impresoras físicas.

## Ejecución final

- `npm --prefix frontendMozo run test:run`: **70/70** pruebas, 26 archivos.
- `npm --prefix frontendMozo run build`: correcto. Advertencias de tamaño de bundle, anotaciones de SignalR e importaciones mixtas de impresión.
- `dotnet build BackEndAPI/BackEndAPI.csproj --artifacts-path .artifacts/contratos -c Release`: correcto (se usó salida separada porque el ejecutable del backend estaba abierto).
- `dotnet test BackEndAPI.Tests --artifacts-path .artifacts/contratos --logger "trx;LogFileName=regresion.trx"`: **59 correctas, 5 fallidas, 0 omitidas**, de 64.
- `git diff --check`: sin errores de whitespace.
- Búsqueda final: no quedan `GenerarTicketPDF`, `Items/`, ni consumidores de helpers retirados. Exclusiones comprobadas con git diff.

Los cinco fallos requieren `BARMASTER_TEST_POSTGRES_ADMIN` y reportan que no está configurada una instancia PostgreSQL aislada: SkipLocked, las dos variantes de cancelar/enviar concurrentemente, mantenimiento multibase y eliminación/restauración de impresoras. No se consideran aprobados ni se ocultaron como omisiones. La integración SQL de stock/pagos y la regresión PostgreSQL de impresión siguen pendientes; los tests con dobles o EF InMemory no certifican sus bloqueos, transacciones o concurrencia.

Logs locales: `.artifacts/frontend-tests.log`, `.artifacts/backend-tests.log`, `.artifacts/frontend-build.log`; resultados backend: `BackEndAPI.Tests/TestResults/regresion.trx`.
