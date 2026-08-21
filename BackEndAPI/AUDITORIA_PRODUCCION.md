# Auditoría de producción — BarMaster BackEndAPI

**Fecha:** 2026-08-21
**Alcance:** Revisión dirigida de arquitectura multi-tenant, autenticación/autorización, manejo de errores, gestión de secretos, y flujos de negocio críticos (Delivery/Takeaway, Stock, Caja), sobre ~301 archivos C#. No es una revisión línea por línea de los 301 archivos: es un muestreo profundo de las rutas de mayor riesgo (tenancy, auth, transacciones, un flujo de negocio completo) más una búsqueda transversal de patrones (grep) sobre el resto. Antes de salir a producción se recomienda repetir este mismo nivel de detalle sobre los módulos no cubiertos explícitamente (Reservas, CuentasCorrientes, ARCA/facturación electrónica, Pagos).

**Leyenda de severidad:** 🔴 Crítico (bloqueante para producción) · 🟠 Alto · 🟡 Medio · ⚪ Bajo / calidad de código

---

## Resumen ejecutivo

El proyecto tiene una base técnica razonable en partes puntuales (uso correcto de `decimal` para dinero, locking pesimista `FOR UPDATE` en stock, `FromSqlInterpolated` parametrizado, un `IDatabaseTransactionManager` reutilizable). Pero tiene **fallas estructurales graves en el aislamiento multi-tenant y en el control de acceso** que son bloqueantes para un producto que va a manejar datos y dinero de múltiples locales gastronómicos. También hay una ausencia casi total de logging, manejo de errores centralizado y validación de entrada, lo que hoy hace que la API sea difícil de operar y depurar en producción, además de insegura.

Los 3 problemas que hay que resolver **antes que cualquier otra cosa**:

1. El tenant (la base de datos con la que se opera) se elige por un header `X-Tenant-ID` sin ninguna relación con el JWT autenticado → cualquier usuario autenticado de cualquier local puede leer/escribir los datos de **cualquier otro local** con solo cambiar ese header.
2. No existe autorización por rol en ningún endpoint → un mozo autenticado puede borrar empleados, dar de baja cajas, modificar personas de cualquier rol, etc.
3. El signing key del JWT y la contraseña de la base de datos están **hardcodeadas en texto plano en `appsettings.json`, versionado en git**, y esa misma contraseña débil (`123456`) se reutiliza automáticamente para crear la base de cada tenant nuevo.

---

## 🔴 Críticos — bloqueantes para producción

### 1. El aislamiento multi-tenant no está atado a la identidad autenticada
**Dónde:** [Tenancy/Services/TenantServices.cs:29-41](Tenancy/Services/TenantServices.cs#L29-L41), [Tenancy/Services/TenantDbMiddleware.cs](Tenancy/Services/TenantDbMiddleware.cs), [Data/AppDbContextFactory.cs](Data/AppDbContextFactory.cs), [Services/Global/JWTServices.cs](Services/Global/JWTServices.cs), [Program.cs:203-207](Program.cs#L203-L207)

`TenantDbMiddleware` resuelve qué base de datos usar leyendo el header `X-Tenant-ID` (el "slug" de la empresa) y la resuelve **antes** de `UseAuthentication`/`UseAuthorization`. El JWT emitido (`CrearJWTEmpresa`, `CrearJWTSucursal`, `CrearJWTPersona`) **no incluye ningún claim de tenant** (ni `NombreEmpresa` ni el `Id` del tenant) — solo `IdEmpresa`/`IdSucursal`/`IdPersona`, que son IDs *dentro* de la base del tenant.

Consecuencia: no hay ningún punto del pipeline donde se verifique que "el tenant al que apunta este request" coincide con "el tenant para el que se emitió este JWT". Un usuario autenticado legítimamente contra el Tenant A puede reutilizar su mismo JWT válido cambiando únicamente el header `X-Tenant-ID` a `tenant-b`, y la API construirá el `DbContext` contra la base de datos de B usando igualmente ese JWT (que sigue siendo válido porque la firma y expiración son correctas). Si el `IdEmpresa`/`IdSucursal`/`IdPersona` del token coincide por azar con un registro real en la base de B (o si el endpoint no filtra por esos IDs, como pasa en varios controllers, ver hallazgo #2), esto es una fuga de datos entre locales — el peor escenario posible en un SaaS multi-tenant.

Además, `NombreEmpresa` (el identificador de tenant) es simplemente el nombre comercial en minúsculas sin espacios (`TenantServices.cs:47`) — es adivinable/enumerable, no es un secreto.

**Impacto de negocio:** un local gastronómico podría ver o modificar pedidos, empleados, cajas y movimientos de otro local. Esto rompe la premisa básica de un SaaS multi-tenant y es motivo de baja inmediata de cualquier cliente que lo detecte.

**Recomendación:** el tenant debe derivarse **del JWT**, no de un header libre. Al emitir el token, incluir un claim `TenantId` (el `Guid` del `Tenant`, no el slug). En el middleware/factory, resolver el `DbContext` a partir de ese claim después de `UseAuthentication`, y si se sigue necesitando el header (p. ej. para el login, donde todavía no hay JWT), validar en cada request autenticado que el tenant resuelto por header coincide con el tenant del token — o eliminar el header por completo para rutas autenticadas.

### 2. No hay autorización por rol en ningún endpoint (IDOR / escalación de privilegios)
**Dónde:** todos los controllers (`grep` de `[Authorize(Roles=` → 0 resultados en todo el proyecto), ejemplo concreto en [Controllers/PersonasController.cs](Controllers/PersonasController.cs)

Todos los endpoints usan `[Authorize]` a secas, sin `Roles=` ni ninguna verificación de `TipoAuth`/rol dentro del método. Ejemplo: `PersonasController` expone `EliminarPersona`, `ActivarDesactivarPersona`, `ModificarPersona`, `GetListaPersonasDeEmpresa` protegidos solo por "tener cualquier JWT válido". Un token de tipo `admin` (persona/mozo autenticado por PIN vía `CrearJWTPersona`) puede llamar estos endpoints igual que un token de tipo `empresa`. No hay chequeo de `Rol` (el modelo `Persona` tiene `IdRol`, hay una tabla `Roles`, pero nunca se usa para autorizar).

Concretamente: un mozo puede dar de baja a otros empleados (incluido el dueño/admin), listar el legajo completo de todo el personal (DNI, teléfono, dirección, email), y modificar el código de servicio de cualquiera.

Adicionalmente, `GetPersonaPorId`, `ModificarPersona`, `CambiarEstado`, `EliminarPersona`, `ActualizarPersonaje` en [PersonasServices.cs](Services/PersonasServices.cs) buscan la persona **solo por `Id`**, sin verificar que pertenezca a la sucursal/empresa del usuario autenticado (`IdSucursal`/`IdEmpresa` del claim nunca se compara contra `persona.IdSucursal`/`persona.IdEmpresa`). Es un IDOR clásico: cualquier ID adivinado o filtrado es operable.

**Recomendación:** definir una matriz de permisos por rol (Admin empresa, Admin sucursal, Encargado, Mozo, Cadete, etc.), aplicar `[Authorize(Roles=...)]` o un `IAuthorizationHandler` por recurso, y en cada servicio validar pertenencia del recurso al `IdEmpresa`/`IdSucursal` del `ClaimsPrincipal` antes de leer/escribir.

### 3. Secretos en texto plano versionados en git
**Dónde:** [appsettings.json](appsettings.json) (confirmado con `git ls-files`, el archivo **está trackeado**), [Tenancy/Services/TenantServices.cs:52](Tenancy/Services/TenantServices.cs#L52)

- `JWT:SigningKey` (la clave con la que se firman todos los tokens) está en texto plano en `appsettings.json`, commiteada al repo.
- `ConnectionStrings:Master` incluye `Password=123456` para la base maestra.
- `TenantServices.CrearTenant` **hardcodea** `Password=123456` como contraseña de Postgres para **cada base de datos de cada tenant nuevo que se crea**, y guarda el connection string completo (con la contraseña en claro) en la tabla `Tenants` de la base maestra.

**Impacto:** cualquiera con acceso al repo (actual o histórico, incluso si se borra después) puede firmar JWTs válidos para cualquier usuario/tenant, o conectarse directamente a cualquier base de datos de cliente. Es una llave maestra sobre todo el sistema.

**Recomendación:**
- Rotar YA el `JWT:SigningKey` y la contraseña de Postgres (maestra y de cada tenant existente) antes de ir a producción — ya deben considerarse comprometidas.
- Sacar `appsettings.json` de git (o al menos sus secretos) y usar variables de entorno / User Secrets en desarrollo / un secret manager (Azure Key Vault, AWS Secrets Manager, Doppler, etc.) en producción.
- Generar una contraseña aleatoria fuerte por tenant al crearlo (no una constante), y si se persiste el connection string en la tabla `Tenants`, cifrarlo en reposo (o mejor, no persistir la contraseña ahí y resolverla desde el secret manager por tenant).

---

## 🟠 Altos

### 4. Cero logging estructurado en toda la aplicación
**Dónde:** todo el proyecto (`grep "ILogger"` → 0 resultados)

No hay una sola inyección de `ILogger<T>` en controllers, servicios o repositorios. Todos los `catch` devuelven el error al cliente o lo descartan, pero nada queda registrado del lado del servidor. En producción, ante un incidente (un pago que no se registró, un stock que quedó negativo, un 500 intermitente) no hay forma de diagnosticar qué pasó sin reproducirlo.

**Recomendación:** agregar logging estructurado (Serilog o el `ILogger` de `Microsoft.Extensions.Logging`) con un sink centralizado (Seq, Application Insights, ELK, CloudWatch, etc.), como mínimo en: excepciones no controladas, operaciones de dinero (caja, pagos), y accesos denegados/fallidos de autenticación.

### 5. Manejo de errores por `switch` sobre el *mensaje* de la excepción, repetido en cada controller
**Dónde:** patrón repetido en prácticamente todos los controllers, ejemplo [Controllers/PersonasController.cs:51-62](Controllers/PersonasController.cs#L51-L62) y siguientes

El patrón dominante es: el servicio lanza `throw new Exception("texto en español")`, y el controller hace `catch (Exception ex) { switch(ex.Message) { case "texto en español": return BadRequest(...); default: return 500 } }`. Esto implica:
- Cualquier error no anticipado (null ref, timeout de DB, etc.) también cae en el `default` como 500 genérico "Ocurrió un error inesperado", sin logging (ver #4) — invisible en producción.
- Un simple typo o un refactor que cambie el texto de un mensaje convierte silenciosamente un 400 esperado en un 500.
- Se duplica el mismo bloque `try/catch/switch` decenas de veces en vez de centralizarlo.
- Todas las excepciones son `System.Exception` genérica — no hay una jerarquía de excepciones de dominio (`NotFoundException`, `ValidationException`, `ConflictException`, etc.) que permita mapear a códigos HTTP de forma robusta.

`Tenancy/Services/DatabaseTransactionManager.cs:32-36` agrava esto: en el `catch` hace `throw new Exception(ex.Message)`, perdiendo el stack trace y el tipo original de la excepción — dificulta aún más el diagnóstico y rompe el uso de `catch` tipados aguas arriba.

**Recomendación:** definir excepciones de dominio tipadas, agregar un middleware global de manejo de excepciones (`UseExceptionHandler` / `IExceptionHandler` de .NET 8, o `ProblemDetails`) que mapee tipo de excepción → status code + logging, y eliminar los `try/catch` repetidos de cada acción de controller. En `DatabaseTransactionManager`, reemplazar `throw new Exception(ex.Message)` por `throw;`.

### 6. Prácticamente no hay validación de entrada
**Dónde:** DTOs en general (`grep` de `[Required]/[MaxLength]/[StringLength]/[Range]` → solo 4 ocurrencias en **todo** `DTOs/`)

Salvo dos DTOs puntuales, ningún DTO usa Data Annotations. `[ApiController]` valida automáticamente el `ModelState`, pero si no hay atributos que declaren restricciones, esa validación automática no hace nada útil (strings vacíos, negativos, longitudes absurdas, emails inválidos, etc. pasan sin filtro). La validación que existe está hecha a mano y de forma inconsistente dentro de cada servicio (algunos chequean `string.IsNullOrEmpty`, otros no chequean nada).

Ejemplo concreto: `CrearDeliveryTakeawayDTO.Origen` es un `string` libre sin restricción (debería ser un enum o al menos validarse contra una lista fija) — ver hallazgo #8.

**Recomendación:** agregar Data Annotations (o FluentValidation, más expresivo para reglas cruzadas) a todos los DTOs de entrada, y devolver 400 con detalle de campo vía `ValidationProblem` de forma consistente.

### 7. CORS abierto a cualquier origen/método/header
**Dónde:** [Program.cs:81-88](Program.cs#L81-L88)

```csharp
options.AddPolicy("AllowAll", policy =>
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
```

Aceptable para desarrollo, pero en producción cualquier sitio puede hacer requests a la API. Con Bearer tokens (no cookies) el riesgo de CSRF es bajo, pero sigue exponiendo la API a scraping/abuso desde cualquier origen y dificulta detectar tráfico ilegítimo.

**Recomendación:** restringir `AllowedOrigins` a los dominios reales del frontend por ambiente (usando `builder.Configuration` para no hardcodear), y considerar rate limiting (`Microsoft.AspNetCore.RateLimiting`, disponible nativo desde .NET 7) — no hay ninguno configurado hoy, lo que deja la API sin protección ante abuso/fuerza bruta en `/login`.

---

## 🟡 Medios — lógica de negocio

### 8. Flujo de Delivery/Takeaway: varios bugs concretos
**Dónde:** [Services/DeliveryTakeawayServices.cs](Services/DeliveryTakeawayServices.cs) (archivo con cambios en curso según `git status`)

- **NullReferenceException garantizado en pedidos Delivery sin cadete asignado:** en `CrearDeliveryTakeawayCoreAsync` (línea 82), `request.IdCadete.Value` se accede sin chequear `HasValue`. `IdCadete` es `Guid?` en el DTO ([DTOs/Request/Crear/CrearDeliveryTakeawayDTO.cs:7](DTOs/Request/Crear/CrearDeliveryTakeawayDTO.cs#L7)) — es decir, el propio contrato permite crear un delivery sin cadete (para asignarlo después), pero el código de creación no lo soporta y explota con una excepción no controlada (cae como 500 genérico, sin log, ver #4/#5).
- **Sin validar el rol del cadete al crear** (sí se valida en `Modificar`, línea 164: `if (cadete.IdRol != 3)`): al crear un delivery no se verifica que `IdCadete` corresponda efectivamente a una persona con rol "cadete", ni que exista. Inconsistencia entre alta y modificación.
- **`Origen` es un string libre comparado con `==`** (líneas 77 y 86: `"Delivery"` / `"Takeaway"`): un valor con otra capitalización, un typo, o cualquier otro string no cae en ninguna de las dos ramas, dejando el pedido a medio inicializar (sin dirección, sin cadete, `PrecioEnvio` en su valor por defecto) de forma silenciosa — sin error, sin validación. Debería ser un `enum` o al menos validarse explícitamente contra los valores permitidos, devolviendo 400 si no matchea.
- **`ModificarDatosDeliveryTakeawayCoreAsync` ignora dos campos que el propio DTO declara:** `ModificarDeliveryTakeawayDTO.ListaProductos` y `.Entregado` ([DTOs/Request/Modificar/ModificarDeliveryTakeawayDTO.cs:14-15](DTOs/Request/Modificar/ModificarDeliveryTakeawayDTO.cs#L14-L15)) nunca se leen en el servicio — si el frontend intenta agregar/quitar productos o marcar el pedido como entregado a través de este endpoint, la llamada responde OK pero no hace nada. Es un contrato roto entre API y consumidor.
- **`MarcarComoEntregado` no está implementado** (línea 134-136: `throw new NotImplementedException()`), pero está expuesto por la interfaz `IDeliveryTakeawayServices` y presumiblemente por un endpoint de controller — si el frontend ya lo llama, es un 500 en producción para una función core del flujo de delivery.
- **Borrar un pedido no reconcilia caja/pagos:** `EliminarDeliveryTakeawayCoreAsync` repone el stock (correcto) pero no verifica si el pedido ya estaba pagado/facturado antes de permitir el borrado, ni reversa ningún `MovimientoCaja` asociado. Si se borra un pedido que ya generó un ingreso en caja, el dinero registrado y el pedido quedan desincronizados (la caja sigue mostrando el ingreso, pero el pedido — y el stock que consumió — ya no existen).

**Recomendación:** completar `MarcarComoEntregado`, manejar `ListaProductos`/`Entregado` en la modificación (o quitarlos del DTO si no aplican), convertir `Origen` a `enum`, validar `IdCadete` de forma consistente en alta y modificación, y bloquear/advertir el borrado de pedidos ya pagados (o generar automáticamente el movimiento de reverso en caja).

### 9. Apertura de caja: condición de carrera entre el chequeo y la creación
**Dónde:** [Controllers/CajasController.cs:136-158](Controllers/CajasController.cs#L136-L158), [Services/CajasServices.cs:16-28](Services/CajasServices.cs#L16-L28)

El controller consulta `BuscarCajaAbiertaPorIdSucursal` y, si no hay ninguna, recién ahí llama a `CrearCaja` — es un patrón "check-then-act" sin transacción ni constraint a nivel de base de datos. Dos requests concurrentes de apertura (doble clic, dos dispositivos) pueden ambos pasar el chequeo antes de que el primero termine de insertar, resultando en dos cajas abiertas simultáneamente para la misma sucursal, lo que rompe la contabilidad de esa sucursal (movimientos de caja ambiguos, `MontoActual` dividido entre dos registros).

**Recomendación:** agregar un índice único parcial en Postgres (`CREATE UNIQUE INDEX ... ON "Cajas" ("IdSucursal") WHERE "FechaCierre" IS NULL`) que garantice a nivel de base que solo puede haber una caja abierta por sucursal, y capturar la violación de constraint como el error de negocio "ya hay una caja abierta".

### 10. Contraseñas: HMACSHA512 con salt por-clave-aleatoria, sin trabajo computacional (no es un KDF)
**Dónde:** [Services/Global/PasswordService.cs](Services/Global/PasswordService.cs)

El hash de contraseña se genera con `HMACSHA512` usando como "salt" la clave aleatoria del propio HMAC (`hmac.Key`). Funcionalmente evita rainbow tables (hay salt único por usuario), pero HMAC-SHA512 es una función *rápida* — no tiene el costo computacional ajustable de un KDF diseñado para contraseñas (PBKDF2, BCrypt, Argon2). Ante una eventual fuga de la tabla de usuarios, un ataque de fuerza bruta offline sobre estos hashes es órdenes de magnitud más rápido que contra BCrypt/Argon2.

**Recomendación:** migrar a `Rfc2898DeriveBytes`/PBKDF2 (nativo en .NET, fácil de introducir), BCrypt.Net o Argon2, con un plan de migración incremental (rehashear en el próximo login exitoso).

### 11. Expiración de JWT fija en 1 hora, sin refresh token
**Dónde:** [Services/Global/JWTServices.cs](Services/Global/JWTServices.cs) (`hours_expire = 1` en los 3 métodos)

No hay mecanismo de refresh token ni de revocación (logout no invalida el token — es stateless puro). Para un sistema operativo (un mozo tomando pedidos durante un turno de 6+ horas), esto obliga a relogin cada hora o a que el frontend guarde credenciales para renovar silenciosamente (mala práctica). Tampoco hay forma de revocar un token comprometido antes de que expire (ej. empleado despedido en medio de su turno sigue con acceso válido hasta el vencimiento).

**Recomendación:** implementar refresh tokens de vida más larga (rotables, revocables en base de datos) y acortar el access token, o al menos mantener una lista de revocación (denylist por `jti`) para los casos de baja de empleado/cambio de contraseña.

### 12. `X-Tenant-ID` inconsistente con Swagger/documentación de API pública
**Dónde:** [Program.cs:55-76](Program.cs#L55-L76)

Swagger está documentado con dos security schemes en paralelo (Bearer + `X-Tenant-ID` como ApiKey), reforzando en la propia documentación de la API el patrón inseguro del hallazgo #1: se invita a los consumidores a resolver el tenant por header en vez de derivarlo del token. Una vez resuelto #1, esta definición de Swagger debe actualizarse.

---

## ⚪ Bajos / calidad de código

- **`BackEndAPI - Backup.csproj`** en el root del repo — un archivo de backup de proyecto versionado, no debería estar en git.
- **`package.json`/`package-lock.json`** con dependencias de frontend (`redux-devtools-extension`, `@fortawesome/...`) sueltos en la raíz de una API .NET — parecen residuo de copiar/pegar de otro proyecto; si no se usan, eliminarlos.
- **`ModificarDeliveryTakeawayDTO.cs:1`** tiene `using System.Security.Policy;` — namespace obsoleto/no relacionado, resto de un autocompletado, sin uso real.
- Los métodos `BuscarPersonaPorId`, `BuscarPersonaPorDni` en `PersonasServices.cs` (líneas 59-67, 68-76) no son `async` pero envuelven una `Task` sin `await`, y lanzan la excepción **fuera** de la ejecución de la tarea envuelta (antes de que la tarea falle, ya se evaluó `busqueda == null` sobre una `Task<Persona?>` en vez de sobre el resultado — es decir, la comparación `busqueda == null` compara la propia `Task`, no la `Persona`, contra `null`, lo cual **nunca es `null`** porque `busqueda` es un objeto `Task` válido). Esto significa que el `throw` de "no encontrado" en esos dos métodos específicos **nunca se ejecuta** — el chequeo de nulidad es un no-op y el `null` real de la persona se propaga sin control al controller. Verificar y corregir: usar `async`/`await` y comparar sobre el resultado, no sobre la `Task`.
- No hay paginación en endpoints de listado (`GetListaPersonasDeEmpresa`, `BuscarListaCajas`, historiales de movimientos) — no es crítico al volumen actual, pero conviene resolverlo antes de que el volumen de datos por tenant crezca.
- No hay health checks (`/health`) ni endpoint de versión — dificulta el monitoreo en orquestadores (k8s, App Service, etc.).
- No se encontraron tests automatizados en el repo (no hay proyecto `*.Tests` ni carpeta de tests) — para lógica tan sensible como caja/stock/multi-tenancy, la ausencia total de tests es un riesgo alto de regresión a cada cambio.

---

## Priorización sugerida (orden de trabajo)

1. **Bloqueante inmediato:** atar la resolución de tenant al JWT (#1) + rotar secretos (#3) — ningún dato real de cliente debería tocar esta API hasta que esto esté resuelto.
2. **Bloqueante inmediato:** autorización por rol + validación de pertenencia de recursos (#2).
3. Antes de ir a producción: middleware de excepciones + logging estructurado (#4, #5), validación de DTOs (#6), CORS restringido + rate limiting (#7).
4. Antes del primer cierre de caja en producción real: constraint de caja única abierta (#9), reconciliación de borrado de pedidos pagados (#8), hashing de contraseñas con KDF (#10).
5. Deuda técnica a planificar: refresh tokens (#11), tests automatizados, paginación, limpieza de archivos sueltos.

---

## Nota sobre cobertura de esta auditoría

Esta revisión priorizó profundidad sobre amplitud: se auditó completamente la capa de tenancy/auth (la de mayor riesgo estructural) y un flujo de negocio de punta a punta (Delivery/Takeaway → Stock → Caja) como muestra representativa de la calidad general del código de negocio. **No se revisaron en el mismo nivel de detalle**: Reservas, Mesas/Planos, CuentasCorrientes, Pagos, el módulo ARCA (facturación electrónica AFIP), ni las migraciones de EF Core. Dado que se detectaron patrones sistémicos (falta de logging, de validación, de autorización por rol, de tests) en los módulos revisados, es razonable asumir que se repiten en los no revisados — conviene una segunda pasada dirigida a esos módulos, en particular ARCA (facturación fiscal) y Pagos, por su sensibilidad legal/financiera.
