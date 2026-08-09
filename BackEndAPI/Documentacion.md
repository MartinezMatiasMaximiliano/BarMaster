# BarMaster BackEndAPI — Documentación de Endpoints

API REST en ASP.NET Core para gestión de bares/restaurantes (multi-tenant, multi-sucursal): mesas, visitas, pedidos, pagos, cajas, delivery/takeaway, reservas, personal y facturación electrónica (ARCA/AFIP).

## Configuración global

- **Autenticación**: JWT Bearer (`Authorization: Bearer <token>`). No hay roles/políticas (`[Authorize(Roles=...)]`); `[Authorize]` solo valida que el token sea válido.
- **Tokens JWT** (`Services/Global/JWTServices.cs`), tres variantes según el flujo de login:
  - Login de sucursal (`POST /Login`): claims `IdEmpresa`, `IdSucursal`, `TipoAuth=sucursal`.
  - Login de empresa: claims `IdEmpresa`, `TipoAuth=empresa`.
  - Login de persona (`POST /LoginPersona`): claims `IdPersona`, `RequestedBy`, `RequestedRole`, `TipoAuth=admin`.
  - Varios controladores leen `IdSucursal`/`IdEmpresa` de los claims del token para acotar las consultas automáticamente (no van en la ruta ni en el body).
- **Multi-tenant**: header `X-Tenant-ID` (documentado en Swagger como API Key) + `TenantDbMiddleware`, que resuelve el `DbContext` del tenant en cada request antes de llegar al controlador.
- **CORS**: política `AllowAll` (cualquier origen/método/header).
- **SignalR**: hub `NotificacionesHub` en `/NotificacionesHub` (no es REST; usa `DTOs/Hub/EnviarCarritoDTO.cs` y `NotificacionMozoDTO.cs`).
- **Archivos estáticos**: `/uploads` sirve `wwwroot/uploads` (imágenes de productos, etc.).
- **Formatos de error/respuesta comunes**:
  - `ErrorDTO(int Codigo, string Tipo, string Mensaje)` → `{ error: { codigo, tipo, mensaje } }`
  - `EntregaDTO(int, string, string)` → `{ data: {...} }`
  - Muchos endpoints también devuelven objetos anónimos `{ message: "..." }` en errores.
- **Swagger/OpenAPI**: disponible en entorno de desarrollo (`/swagger`).

> ⚠️ **Nota de convención de rutas**: la mayoría de los controladores define `[Route("[controller]")]` a nivel de clase pero casi todas las acciones la sobreescriben con una ruta absoluta en el atributo `Http*` (por ejemplo `[HttpGet("/Cajas")]`). Por eso las rutas documentadas abajo son las rutas reales de cada acción, no la composición `controller + acción`.

> ⚠️ **Cobertura de autenticación inconsistente**: `AuthController` (salvo cambiar contraseña), `EmpresasController` (crear/modificar/activar-desactivar), `MesasController`, `PagosController`, `TicketController`, `TipoMovimientosCajaController` y `VisitasController` **no tienen `[Authorize]`** — son efectivamente públicos. El resto de los controladores requiere un JWT válido (sin distinción de rol).

---

## Índice

- [Auth](#authcontroller)
- [Cajas](#cajascontroller)
- [Categorias](#categoriascontroller)
- [CuentasCorrientes](#cuentascorrientescontroller)
- [DeliveryTakeaway](#deliverytakeawaycontroller)
- [Empresas](#empresascontroller)
- [Menus](#menuscontroller-inactivo)
- [Mesas](#mesascontroller)
- [MovimientosCaja](#movimientoscajacontroller)
- [Pagos](#pagoscontroller)
- [Personas](#personascontroller)
- [Planos](#planoscontroller)
- [Productos](#productoscontroller)
- [Reservas](#reservascontroller)
- [Roles](#rolescontroller)
- [Sucursales](#sucursalescontroller)
- [Ticket](#ticketcontroller)
- [TipoEnvios](#tipoenvioscontroller)
- [TipoMovimientosCaja](#tipomovimientoscajacontroller)
- [Visitas](#visitascontroller)
- [Debug/interno (Test)](#test-debuginterno)

---

## AuthController

Base: `/` (rutas absolutas). Sin `[Authorize]` a nivel de clase.

| Verbo | Ruta | Auth | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| POST | `/Login` | — | `LoginDTO {Username, Password}` | Token JWT (200) / `ErrorDTO` (400/401/404) | Login de sucursal/staff |
| POST | `/LoginPersona` | — | `LoginDTO {Username, Password}` | Token JWT (200) / `ErrorDTO` (400/401/404) | Login como `Persona` (admin, mozo, etc.) |
| POST | `/Logout` | — | — | 200 | No-op |
| PUT | `/CambiarContraseña` | **JWT** | `CambiarContraseñaDTO {ContraseñaActual, ContraseñaNueva, ConfirmacionContraseña}` | 200 / `ErrorDTO` (400) | Cambia la contraseña del usuario autenticado |

---

## CajasController

Base: `/Cajas`. **Requiere JWT** en toda la clase.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/Cajas` | — | — | `List<CajaDTO>` | Lista todas las cajas |
| GET | `/Cajas/Activa` | claim `IdSucursal` | — | `CajaDTO` | Caja abierta de la sucursal actual |
| GET | `/Cajas/{id}` | `id: Guid` | — | `CajaDTO` | Caja por id |
| POST | `/Cajas/Abrir` | claim `IdSucursal` | `CrearCajaDTO {MontoApertura}` | `CajaDTO` | Abre una caja para la sucursal (falla si ya hay una abierta) |
| PATCH | `/Cajas/Cerrar` | — | `CerrarCajaDTO {IdCaja, MontoCierre}` | `CajaDTO` | Cierra una caja |

**CajaDTO**: `Id, IdSucursal, FechaApertura, FechaCierre?, MontoApertura, MontoActual, MontoCierre?, Diferencia?`

---

## CategoriasController

Base: `/Categorias`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/Categorias` | — | — | `List<CategoriaDTO>` | Lista categorías |
| GET | `/Categorias/{id}` | `id: Guid` | — | `CategoriaDTO` | Categoría por id |
| POST | `/Categorias` | — | `CrearCategoriaDTO {Nombre}` | `CategoriaDTO` | Crea categoría |
| PUT | `/Categorias/{id}` | `id: Guid` | `ModificarCategoriaDTO {Nombre?}` | `CategoriaDTO` | Modifica nombre |
| DELETE | `/Categorias/{id}` | `id: Guid` | — | 200 | Elimina categoría |
| PATCH | `/Categorias/ActivarDesactivar` | query `IdCategoria: Guid` | — | 200 | Activa/desactiva categoría |

**CategoriaDTO**: `Id, Nombre, Activo`

---

## CuentasCorrientesController

Base: `/CuentasCorrientes`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/CuentasCorrientes` | — | — | lista con movimientos | Todas las cuentas corrientes |
| GET | `/CuentasCorrientes/{IdCuenta}` | `IdCuenta: Guid` | — | `CuentaCorrienteDTO` | Cuenta por id |
| POST | `/CuentasCorrientes/Crear` | — | `CrearCuentaCorrienteDTO {Nombre, Telefono, Domicilio}` (todos requeridos) | `CuentaCorrienteDTO` | Crea cuenta corriente |
| POST | `/CuentasCorrientes/Modificar` | — | `ModificarCuentaCorrienteDTO {IdCuenta, Nombre?, Telefono?, Domicilio?, Descuento?}` | `CuentaCorrienteDTO` | Modifica datos de la cuenta |
| POST | `/CuentasCorrientes/CrearMovimiento` | query `IdCuenta: Guid`, claim `IdSucursal` | `CrearMovimientoCajaDTO {IdTipoMovimientoCaja, MontoAbonado, MontoTotal, Descripcion?}` | `CuentaCorrienteDTO` | Agrega un movimiento a la cuenta. La caja se toma automáticamente (la caja abierta de la sucursal del token), ya no se envía `IdCaja` en el body |
| PATCH | `/CuentasCorrientes/Desactivar` | query `IdCuenta: Guid` | — | 200 | Desactiva cuenta (falla si el balance ≠ 0) |
| DELETE | `/CuentasCorrientes/Eliminar` | query `IdCuenta: Guid` | — | 200 | Elimina cuenta (falla si el balance ≠ 0) |

**CuentaCorrienteDTO**: `Id, Nombre, Telefono, Domicilio, Balance, Descuento, Movimientos: MovimientoCuentaCorrienteDTO[]`
**MovimientoCuentaCorrienteDTO**: `IdMovimientoCaja, Descripcion, MontoTotal, FechaMovimiento, EsIngreso, EsEfectivo`

---

## DeliveryTakeawayController

Base: `/DeliveryTakeaway`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/DeliveryTakeaway` | claim `IdSucursal` | — | `List<DeliveryTakeawayResponseDTO>` | Todos los pedidos delivery/takeaway de la sucursal |
| GET | `/DeliveryTakeaway/Caja/{idCaja}` | `idCaja: Guid`, claim `IdSucursal` | — | lista | Pedidos filtrados por caja |
| GET | `/DeliveryTakeaway/{id}` | `id: Guid`, claim `IdSucursal` | — | `DeliveryTakeawayResponseDTO` | Pedido por id |
| POST | `/DeliveryTakeaway/Crear` | claim `IdSucursal` | `CrearDeliveryTakeawayDTO {IdCadete?, IdTipoEnvio?, NombreCliente, Direccion?, Indicaciones?, Telefono?, Origen("Delivery"/"Takeaway"), ListaProductos: AgregarProductoAVisita[]}` | `DeliveryTakeawayResponseDTO` | Crea el pedido (crea una Visita con sus productos). **Ya no genera el pago automáticamente** — el cobro se hace aparte con `POST /Pagar` |
| PATCH | `/DeliveryTakeaway/ModificarDatos` | — | `ModificarDeliveryTakeawayDTO {IdDeliveryTakeaway, NombreCliente?, Telefono?, Direccion?, Indicaciones?, IdTipoEnvio?, IdCadete?, Entregado?}` | 200 | Modifica datos / asigna cadete / marca entregado |
| DELETE | `/DeliveryTakeaway` | `id: Guid` | — | 200 | Elimina pedido |

**DeliveryTakeawayResponseDTO**: `Id, IdSucursal, IdTipoEnvio?, IdVisita, IdCaja, FechaHora, NombreCliente, Direccion?, Indicaciones?, Telefono, PrecioTotal, PrecioEnvio, Entregado, Cadete?: CadeteDTO, Pago?: PagoDTO, Productos: ItemDTO[]`

---

## EmpresasController

Base: `/Empresa` / `/`. Autorización mixta por acción.

| Verbo | Ruta | Auth | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|---|---|
| GET | `/Empresa` | **JWT** | claim `IdEmpresa` | — | `EmpresaConSucursalesDTO` | Empresa actual + sus sucursales |
| GET | `/Empresa/Sucursales/Resumen` | **JWT** | query `desde?, hasta?: DateTime`, claim `IdEmpresa` | — | resumen/KPIs | Resumen de sucursales en un rango de fechas (default: últimos 7 días) |
| POST | `/Empresa` (base) | — | — | `CrearEmpresaDTO {Nombre, Telefonos?, Emails?, Password}` | `EmpresaDTO` | Alta de empresa (registro público) |
| PATCH | `/Empresa` | — | — | `ModificarEmpresaDTO {Nombre?, Telefono?, Email?, Activo?}` | 200 | ⚠️ **Stub sin implementar** — no llama al servicio |
| PATCH | `/ActivarDesactivar` | — | query `IdEmpresa: Guid` | — | 200 | ⚠️ **Stub sin implementar** — solo devuelve el id recibido |

**EmpresaConSucursalesDTO**: `Id, Nombre, Telefonos[], Emails[], Activo, FechaInscripcion, Sucursales: SucursalSimpleDTO[]`

---

## MenusController (inactivo)

**Todo el controlador está comentado** — no expone rutas activas actualmente. De reactivarse, expondría: `GET /ListaMenu`, `GET /Menu`, `POST /Menu`, `PATCH /Menu`, `PATCH /ActivarMenu`, `DELETE /Menu`, `POST /Menu/ModificarProductos`.

---

## MesasController

Base: `/Mesa`. **Sin `[Authorize]`** (acceso público).

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/Mesa` | — | — | `List<MesaDTO>` | Todas las mesas con su visita/plano actual |
| POST | `/Mesa` | — | `CrearMesaDTO {Nombre, IdPlano, Capacidad, x, y, w, h}` | `MesaDTO` | Crea mesa |
| PATCH | `/Mesa` | — | `ModificarMesaDTO {Id, Nombre?, Capacidad?, x?, y?, w?, h?}` | `MesaDTO` | Modifica mesa |
| PATCH | `/Mesa/AbrirCerrar` | — | `AbrirMesaDTO {IdMesa, CodigoServicioMozo?, Abrir: bool, IdVisita?}` | `VisitaDTO` | Abre/cierra una mesa (crea/cierra una Visita) |
| DELETE | `/Mesa` | query `IdMesa: Guid` | — | 200 | Elimina mesa |

**MesaDTO**: `Id, Nombre, Capacidad, CodigoParaPedir?, x, y, w, h, Plano?: PlanoDTO, Visita?: VisitaEnMesaDTO`

---

## MovimientosCajaController

Base: `/MovimientosCaja`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/MovimientosCaja` | — | — | `List<MovimientoCajaDTO>` | Todos los movimientos de caja |
| GET | `/MovimientosCaja/{id}` | `id: Guid` | — | `MovimientoCajaDTO` | Movimiento por id |
| GET | `/MovimientosCaja/Caja/{idCaja}` | `idCaja: Guid` | — | lista | Movimientos de una caja |
| POST | `/MovimientosCaja` | claim `IdSucursal` | `CrearMovimientoCajaDTO {IdTipoMovimientoCaja, MontoAbonado, MontoTotal, Descripcion?}` | `MovimientoCajaDTO` | Crea movimiento en la caja abierta de la sucursal del token (ya no se envía `IdCaja`; `Vuelto` se calcula en el servidor cuando el tipo de movimiento es de entorno "Ventas") |
| DELETE | `/MovimientosCaja/{id}` | `id: Guid` | — | 200 | Elimina movimiento |

**MovimientoCajaDTO**: `Id, TipoMovimientoCaja: TipoMovimientoCajaDTO, IdCaja, MontoAbonado, Vuelto, MontoTotal, Descripcion, FechaMovimiento`

---

## PagosController

Base: `/Pagar`. **Sin `[Authorize]`** (acceso público).

| Verbo | Ruta | Body | Devuelve | Descripción |
|---|---|---|---|---|
| POST | `/Pagar` | `CrearPagoDTO {IdTipoMovimiento, IdVisita, MontoAbonado, descuentoDecimal, recargoDecimal, descuentoPorcentaje, recargoPorcentaje, GenerarFactura, DatosFacturaARCA?, ListaIdsProductos: int[]}` | `PagoDTO` | Paga ítems seleccionados de una visita (si la visita es de origen Delivery, el total incluye automáticamente el precio de envío); si `GenerarFactura` es true, emite factura electrónica vía integración ARCA/AFIP. El `Vuelto` se calcula en el servidor |

**PagoDTO**: `Id, IdVisita, tipoMovimientoCaja, MontoAbonado, Vuelto, MontoTotal, FechaCreacion`

---

## PersonasController

Base: `/`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/ListaEmpleados` | — | — | `List<PersonaDTO>` | Todas las personas (empleados) |
| GET | `/Persona` | query `Id: Guid` | — | `PersonaDTO` | Persona por id |
| POST | `/Registrar` | claim `IdEmpresa` | `CrearPersonaDTO {Nombres, Apellido, Dni, Password, Direccion, Telefono, Email, Activo, IdRol}` | `PersonaDTO` | Registra un empleado |
| PUT | `/Modificar` | — | `ModificarPersonaDTO {Id, Nombres, Apellido, Dni, Direccion, Telefono, Email, IdRol, CodigoDeServicio, Activo}` | `PersonaDTO` | Modifica persona |
| PUT | `/activarDesactivar/{Id}` | `Id: Guid` | — | 200 | Activa/desactiva persona |
| DELETE | `/Eliminar/{Id}` | `Id: Guid` | — | 200 | Elimina persona |
| GET | `/Mozos` | — | — | `List<PersonaDTO>` | Personas con rol de mozo |

**PersonaDTO**: `Id, CodigoDeServicio?, Rol, IdEmpresa, DatosPersonales: {Nombres, Apellido, Direccion, Telefono, Dni, Email, Activo}`

---

## PlanosController

Base: `/Plano`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| POST | `/Plano` | claim `IdSucursal` | `CrearPlanoDTO {Nombre, Detalles}` | `PlanoDTO` | Crea un plano |
| GET | `/ListaPlanosSucursal` | claim `IdSucursal` | — | `List<PlanosDTO>` | Planos de la sucursal (con mesas) |
| GET | `/Plano` | query `IdPlano: Guid` | — | `PlanosDTO` | Plano por id (con mesas) |
| PUT | `/Plano` | — | `ModificarPlanoDTO {IdPlano, Nombre?, Detalles?}` | `PlanoDTO` | Modifica plano |
| DELETE | `/Plano` | query `IdPlano: Guid` | — | 200 | Elimina plano |

**PlanosDTO**: `Id, Nombre, Detalles?, IdSucursal, Mesas: MesaDTO[]`

---

## ProductosController

Base: `/Productos`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/Productos` | — | — | `List<ProductoDTO>` | Todos los productos (con categorías activas) |
| GET | `/Productos/{ProductoId}` | `ProductoId: Guid` | — | `ProductoDTO` | Producto por id |
| POST | `/Productos` | — | `multipart/form-data` → `CrearProductoDTO {Codigo?, Nombre, Descripcion?, PrecioNeto, PorcentajeIVA, CostoProduccion?, Activo, ListaIdCategorias: Guid[], Imagen?: IFormFile}` | `ProductoDTO` | Crea producto (soporta subida de imagen) |
| PATCH | `/Productos` | — | `multipart/form-data` → `ModificarProductoDTO {IdProducto, Codigo?, Nombre?, Descripcion?, PrecioNeto?, PorcentajeIVA?, CostoProduccion?, Activo?, categorias?: Guid[], Imagen?: IFormFile}` | `ProductoDTO` | Modifica producto |
| DELETE | `/Productos` | query `IdProducto: Guid` | — | 200 | Elimina producto |

**ProductoDTO**: `Id, Codigo?, Nombre, Descripcion, PrecioNeto, PorcentajeIVA, CostoProduccion?, Activo, ImagenUrl, Categorias: string[]`

---

## ReservasController

Base: `/Reservas`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/Reservas` | — | — | `List<ReservaDTO>` | Todas las reservas |
| GET | `/Reservas/Fechas` | query `Desde: DateTime`, `Hasta?: DateTime`; claim `IdSucursal` | — | lista | Reservas por fecha/rango (sin `Hasta` → un solo día) |
| POST | `/Reservas` | claim `IdSucursal` | `CrearReservaDTO {IdEstadoReserva, FechaHora, Telefono, NombreReserva, CantidadDePersonas?}` | `ReservaDTO` | Crea reserva |
| PUT | `/Reservas` | — | `ModificarReservaDTO {Id, IdEstadoReserva, Telefono, FechaHora, NombreReserva, CantidadDePersonas?}` | 200 | Modifica reserva |
| DELETE | `/Reservas` | query `Id: Guid` | — | 200 | Elimina reserva |

**ReservaDTO**: `Id, FechaHora, NombreReserva, TelefonoContacto, CantidadDePersonas?, Estado: EstadoReservaDTO`

---

## RolesController

Base: `/Roles`. **Requiere JWT**.

| Verbo | Ruta | Params | Devuelve | Descripción |
|---|---|---|---|---|
| GET | `/Roles` | — | `List<RolDTO>` | Todos los roles |
| GET | `/Roles/{id}` | `id: int` | `RolDTO` | Rol por id |

**RolDTO**: `Id (int), Nombre`

---

## SucursalesController

Base: `/Sucursal`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/Sucursal` | claim `IdSucursal` | — | `SucursalDTO` | Sucursal actual (según token), con Menus/Planos/Cajas |
| POST | `/Sucursal` | claim `IdEmpresa` | `CrearSucursalDTO {Nombre, Direccion, Telefono?, Username, Password}` | `SucursalDTO` | Crea sucursal para la empresa |
| PATCH | `/Sucursal` | claim `IdSucursal` | `ModificarSucursalDTO {Nombre?, Direccion?, Telefono?, Username?, Password?}` | 200 | Modifica la sucursal actual |

**SucursalDTO**: `Id, IdEmpresa, Nombre, Direccion?, Telefono?, Username, Menus?: MenuDTO[], Planos?: PlanoDTO[], Cajas?: CajaDTO[]`

---

## TicketController

Base: `/Ticket`. **Sin `[Authorize]`** (acceso público).

| Verbo | Ruta | Params | Devuelve | Descripción |
|---|---|---|---|---|
| GET | `/Ticket/{id}` | `id: Guid` | `TicketVirtualDTO` | Ticket virtual de un movimiento de caja (productos, mesa, mozo, sucursal, tipo de pago) |

**TicketVirtualDTO**: `Id, MontoAbonado, Vuelto, MontoTotal, FechaMovimiento, NombreMesa?, NombreSucursal?, NombreMozo?, TipoPago?, Productos: TicketVirtualProductoDTO[]`

---

## TipoEnviosController

Base: `/TipoEnvios`. **Requiere JWT**.

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/TipoEnvios` | — | — | `List<TipoEnvioDTO>` | Lista tipos de envío |
| GET | `/TipoEnvios/{id}` | `id: int` | — | `TipoEnvioDTO` | Tipo por id |
| POST | `/TipoEnvios` | — | `CrearTipoEnvioDTO {Nombre?, Precio?}` | `TipoEnvioDTO` | Crea tipo de envío |
| PATCH | `/TipoEnvios/{id}` | `id: int` | `ModificarTipoEnvioDTO {Nombre?, Precio?}` | `TipoEnvioDTO` | Modifica tipo de envío |
| DELETE | `/TipoEnvios/{id}` | `id: int` | — | 200 | Elimina tipo de envío |

**TipoEnvioDTO**: `Id (int), Nombre, Precio`

---

## TipoMovimientosCajaController

Base: `/TipoMovimientosCaja`. **Sin `[Authorize]` activo** (el atributo está comentado en el código).

| Verbo | Ruta | Params | Devuelve | Descripción |
|---|---|---|---|---|
| GET | `/TipoMovimientosCaja` | query `Entorno: string` (`"all"` u otro filtro) | `List<TipoMovimientoCajaDTO>` | Lista tipos de movimiento, opcionalmente filtrados por entorno |
| GET | `/TipoMovimientosCaja/{Id}` | `Id: int` | `TipoMovimientoCajaDTO` | Tipo por id |

> Existen en el código un `POST` (crear) y un `DELETE` (eliminar) para este recurso, pero están **comentados** y no están activos.

**TipoMovimientoCajaDTO**: `Id (int), Nombre, EsIngreso, EsEfectivo, Entorno`

---

## VisitasController

Base: `/`. **Sin `[Authorize]`** (acceso público).

| Verbo | Ruta | Params | Body | Devuelve | Descripción |
|---|---|---|---|---|---|
| GET | `/VisitasActivas` | — | — | `List<VisitaResponseDTO>` | Visitas activas actualmente (mesa, delivery, takeaway) |
| GET | `/TodasLasVisitas` | — | — | lista | Historial completo de visitas |
| GET | `/Visita` | query `IdVisita: Guid` | — | `VisitaResponseDTO` | Visita por id |
| POST | `/AgregarProductoAVisita` | query `IdVisita: Guid` | `AgregarProductoAVisita[] {IdProducto, Detalles, Cantidad}` | 200 | Agrega productos a una visita |
| DELETE | `/Visitas/EliminarProductos` | — | `EliminarProductosDTO {IdVisita, IdsProductos: int[]}` | 200 | Quita productos de una visita |
| PATCH | `/Visitas/CambiarEstadoProducto` | — | `CambiarEstadoProductoDTO {IdProducto, Estado}` | 200 | Cambia el estado de un ítem de pedido |

**VisitaResponseDTO**: `Id, FechaHora, Estado, Total, ProductosConsumidos: ItemDTO[], IdMesa?, NumeroMesa?, Mozo?: MozoEnVisitaDTO, Origen?`
**ItemDTO**: `Id (int), IdProducto?, Nombre?, Indicaciones?, Precio, EstadoPagado, EstadoPedido?, FechaAgregado, IdMovimientoCaja?`

---

## Test (Debug/interno)

Base: `/`. Controlador **de pruebas/desarrollo**, no pensado para uso en producción — no documentar/exponer públicamente.

| Verbo | Ruta | Descripción |
|---|---|---|
| POST | `/migrar` | Ejecuta `Database.Migrate()` sobre el tenant actual |
| POST | `/test-ARCA` | Prueba manual de integración con el servicio ARCA/AFIP (WSFE) |
| GET | `/file` | Endpoint de prueba para descarga de archivos vía S3 (actualmente no implementado — lanza `NotImplementedException`) |

---

## Observaciones generales

1. **Cobertura de auth inconsistente**: ver advertencia al inicio del documento — varios controladores quedan abiertos sin `[Authorize]`.
2. **Código muerto**: `MenusController` está completamente comentado (sin rutas activas). `TipoMovimientosCajaController` tiene acciones y el `[Authorize]` comentados.
3. **Stubs sin implementar**: `EmpresasController.ModificarEmpresa` y `CambiarEstadoEmpresa` no ejecutan lógica real.
4. **Subida de archivos**: `ProductosController` (crear/modificar) usa `multipart/form-data` con `[FromForm]` e `IFormFile`, no JSON.
5. **Scoping por token**: muchas acciones derivan `IdSucursal`/`IdEmpresa` de los claims del JWT en lugar de recibirlos por ruta o query — es contexto implícito de la request, no opcional.
6. **Facturación electrónica**: `PagosController.PagarItemsDeVisita` puede disparar la emisión de factura electrónica (ARCA/AFIP) si `GenerarFactura = true`.
7. **Modelo de montos unificado**: el campo genérico `Monto` fue reemplazado en todos los DTOs de movimientos/pagos/tickets por tres campos explícitos: `MontoAbonado` (lo que efectivamente entrega/paga el cliente), `MontoTotal` (el importe que corresponde cobrar) y `Vuelto` (calculado por el servidor, solo aplica a movimientos de entorno "Ventas" en efectivo). Afecta a `MovimientoCajaDTO`, `PagoDTO`, `TicketVirtualDTO`, `MovimientoCuentaCorrienteDTO` (solo `MontoTotal`) y al request `CrearMovimientoCajaDTO`.
8. **Creación de movimiento de caja sin `IdCaja`**: tanto `POST /MovimientosCaja` como `POST /CuentasCorrientes/CrearMovimiento` ahora resuelven la caja automáticamente a partir de la caja abierta de la sucursal (`claim IdSucursal`), en vez de recibir `IdCaja` en el body — falla con "Sucursal no encontrada"/"La caja no existe" si no hay una caja abierta para esa sucursal.
9. **Delivery/Takeaway ya no cobra al crear**: `POST /DeliveryTakeaway/Crear` sólo crea el pedido (Visita + productos); ya no crea el `Pago` automáticamente, por lo que el body ya no incluye `montoAbonado` ni `InfoPago`. El cobro debe hacerse después con `POST /Pagar`.
