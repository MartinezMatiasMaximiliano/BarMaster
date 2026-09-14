# Auditoría de producción — BarMaster BackEndAPI

**Fecha original:** 2026-08-21
**Actualizado:** 2026-09-11 — ver [Trabajo realizado desde la auditoría original](#trabajo-realizado-desde-la-auditoría-original) para el detalle de qué se resolvió, qué quedó parcial, y qué se sumó de nuevo. Cada hallazgo de abajo tiene un tag de estado: ✅ Resuelto · 🟡 Parcial · ⬜ Pendiente.

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

### 1. El aislamiento multi-tenant no está atado a la identidad autenticada — ✅ Resuelto
**Dónde:** [Tenancy/Services/TenantServices.cs:29-41](Tenancy/Services/TenantServices.cs#L29-L41), [Tenancy/Services/TenantDbMiddleware.cs](Tenancy/Services/TenantDbMiddleware.cs), [Data/AppDbContextFactory.cs](Data/AppDbContextFactory.cs), [Services/Global/JWTServices.cs](Services/Global/JWTServices.cs), [Program.cs:203-207](Program.cs#L203-L207)

`TenantDbMiddleware` resuelve qué base de datos usar leyendo el header `X-Tenant-ID` (el "slug" de la empresa) y la resuelve **antes** de `UseAuthentication`/`UseAuthorization`. El JWT emitido (`CrearJWTEmpresa`, `CrearJWTSucursal`, `CrearJWTPersona`) **no incluye ningún claim de tenant** (ni `NombreEmpresa` ni el `Id` del tenant) — solo `IdEmpresa`/`IdSucursal`/`IdPersona`, que son IDs *dentro* de la base del tenant.

Consecuencia: no hay ningún punto del pipeline donde se verifique que "el tenant al que apunta este request" coincide con "el tenant para el que se emitió este JWT". Un usuario autenticado legítimamente contra el Tenant A puede reutilizar su mismo JWT válido cambiando únicamente el header `X-Tenant-ID` a `tenant-b`, y la API construirá el `DbContext` contra la base de datos de B usando igualmente ese JWT (que sigue siendo válido porque la firma y expiración son correctas). Si el `IdEmpresa`/`IdSucursal`/`IdPersona` del token coincide por azar con un registro real en la base de B (o si el endpoint no filtra por esos IDs, como pasa en varios controllers, ver hallazgo #2), esto es una fuga de datos entre locales — el peor escenario posible en un SaaS multi-tenant.

Además, `NombreEmpresa` (el identificador de tenant) es simplemente el nombre comercial en minúsculas sin espacios (`TenantServices.cs:47`) — es adivinable/enumerable, no es un secreto.

**Impacto de negocio:** un local gastronómico podría ver o modificar pedidos, empleados, cajas y movimientos de otro local. Esto rompe la premisa básica de un SaaS multi-tenant y es motivo de baja inmediata de cualquier cliente que lo detecte.

**Recomendación:** el tenant debe derivarse **del JWT**, no de un header libre. Al emitir el token, incluir un claim `TenantId` (el `Guid` del `Tenant`, no el slug). En el middleware/factory, resolver el `DbContext` a partir de ese claim después de `UseAuthentication`, y si se sigue necesitando el header (p. ej. para el login, donde todavía no hay JWT), validar en cada request autenticado que el tenant resuelto por header coincide con el tenant del token — o eliminar el header por completo para rutas autenticadas.

**Qué se hizo:** exactamente eso. `JWTServices` ahora graba un claim `TenantId` en los tres tipos de token (empresa, sucursal, persona). `UseAuthentication`/`UseAuthorization` se movieron a correr *antes* que la resolución de tenant (autenticar un JWT es pura criptografía contra la signing key global, no necesita ninguna base de datos). `AppDbContextFactory` ahora resuelve así: si el request está autenticado, el tenant sale **exclusivamente** del claim `TenantId` — el header `X-Tenant-ID` se ignora por completo, no hay forma de que un JWT válido de un tenant opere contra la base de otro cambiando un header. El header se sigue usando *solo* para `/Login` y `/LoginPersona`, que todavía no tienen un JWT del cual sacar el tenant. Si un JWT autenticado no trae `TenantId` (por ejemplo, cualquier token emitido antes de este cambio) o el claim no resuelve a un tenant real, corta con 401 explícito en vez de explotar más abajo. Efecto colateral esperado y necesario: **todas las sesiones activas quedan invalidadas** en el primer deploy de esto — no es un bug, es el punto. Ver [cambios de frontend necesarios](#cambios-de-frontend-necesarios) más abajo.

### 2. No hay autorización por rol en ningún endpoint (IDOR / escalación de privilegios) — 🟡 Parcial
**Estado:** la falla de fondo (sin `Roles=`, sin matriz de permisos) sigue igual — eso no se tocó. Pero en el camino de migrar excepciones se encontró y corrigió algo **peor** que esto: tres controllers (`MesasController`, `VisitasController`, `PagosController`) no tenían **ningún** `[Authorize]` — ni siquiera "cualquier JWT válido" los protegía, estaban completamente públicos (listar/crear/modificar/abrir/cerrar mesas, ver todas las visitas activas, y **registrar pagos**, sin login). Se agregó `[Authorize]` a los tres. Ver el detalle en [Trabajo realizado](#trabajo-realizado-desde-la-auditoría-original).

**Dónde:** todos los controllers (`grep` de `[Authorize(Roles=` → 0 resultados en todo el proyecto), ejemplo concreto en [Controllers/PersonasController.cs](Controllers/PersonasController.cs)

Todos los endpoints usan `[Authorize]` a secas, sin `Roles=` ni ninguna verificación de `TipoAuth`/rol dentro del método. Ejemplo: `PersonasController` expone `EliminarPersona`, `ActivarDesactivarPersona`, `ModificarPersona`, `GetListaPersonasDeEmpresa` protegidos solo por "tener cualquier JWT válido". Un token de tipo `admin` (persona/mozo autenticado por PIN vía `CrearJWTPersona`) puede llamar estos endpoints igual que un token de tipo `empresa`. No hay chequeo de `Rol` (el modelo `Persona` tiene `IdRol`, hay una tabla `Roles`, pero nunca se usa para autorizar).

Concretamente: un mozo puede dar de baja a otros empleados (incluido el dueño/admin), listar el legajo completo de todo el personal (DNI, teléfono, dirección, email), y modificar el código de servicio de cualquiera.

Adicionalmente, `GetPersonaPorId`, `ModificarPersona`, `CambiarEstado`, `EliminarPersona`, `ActualizarPersonaje` en [PersonasServices.cs](Services/PersonasServices.cs) buscan la persona **solo por `Id`**, sin verificar que pertenezca a la sucursal/empresa del usuario autenticado (`IdSucursal`/`IdEmpresa` del claim nunca se compara contra `persona.IdSucursal`/`persona.IdEmpresa`). Es un IDOR clásico: cualquier ID adivinado o filtrado es operable.

**Recomendación:** definir una matriz de permisos por rol (Admin empresa, Admin sucursal, Encargado, Mozo, Cadete, etc.), aplicar `[Authorize(Roles=...)]` o un `IAuthorizationHandler` por recurso, y en cada servicio validar pertenencia del recurso al `IdEmpresa`/`IdSucursal` del `ClaimsPrincipal` antes de leer/escribir.

### 3. Secretos en texto plano versionados en git — ⬜ Pendiente (y se sumó uno más grave)
**Dónde:** [appsettings.json](appsettings.json) (confirmado con `git ls-files`, el archivo **está trackeado**), [Tenancy/Services/TenantServices.cs:52](Tenancy/Services/TenantServices.cs#L52)

- `JWT:SigningKey` (la clave con la que se firman todos los tokens) está en texto plano en `appsettings.json`, commiteada al repo.
- `ConnectionStrings:Master` incluye `Password=123456` para la base maestra.
- `TenantServices.CrearTenant` **hardcodea** `Password=123456` como contraseña de Postgres para **cada base de datos de cada tenant nuevo que se crea**, y guarda el connection string completo (con la contraseña en claro) en la tabla `Tenants` de la base maestra.
- **Nuevo, encontrado al migrar Pagos:** [ARCA/Servicios/WsfeService.cs:41](ARCA/Servicios/WsfeService.cs#L41) carga el certificado de firma de facturación electrónica AFIP con `CertificateLoader.Load(File.ReadAllBytes("C:/Users/Matias/Desktop/certificado.pfx"), "123456")` — ruta absoluta a una PC personal (solo funciona en esa máquina) y contraseña del certificado fiscal hardcodeada en texto plano, con un `TODO` del propio código reconociendo que hay que moverlo a S3. No se tocó (es una decisión de diseño — dónde vive el certificado — no algo para resolver de pasada).

**Impacto:** cualquiera con acceso al repo (actual o histórico, incluso si se borra después) puede firmar JWTs válidos para cualquier usuario/tenant, o conectarse directamente a cualquier base de datos de cliente. Es una llave maestra sobre todo el sistema.

**Recomendación:**
- Rotar YA el `JWT:SigningKey` y la contraseña de Postgres (maestra y de cada tenant existente) antes de ir a producción — ya deben considerarse comprometidas.
- Sacar `appsettings.json` de git (o al menos sus secretos) y usar variables de entorno / User Secrets en desarrollo / un secret manager (Azure Key Vault, AWS Secrets Manager, Doppler, etc.) en producción.
- Generar una contraseña aleatoria fuerte por tenant al crearlo (no una constante), y si se persiste el connection string en la tabla `Tenants`, cifrarlo en reposo (o mejor, no persistir la contraseña ahí y resolverla desde el secret manager por tenant).

---

## 🟠 Altos

### 4. Cero logging estructurado en toda la aplicación — ✅ Resuelto
**Dónde:** todo el proyecto (`grep "ILogger"` → 0 resultados)

No hay una sola inyección de `ILogger<T>` en controllers, servicios o repositorios. Todos los `catch` devuelven el error al cliente o lo descartan, pero nada queda registrado del lado del servidor. En producción, ante un incidente (un pago que no se registró, un stock que quedó negativo, un 500 intermitente) no hay forma de diagnosticar qué pasó sin reproducirlo.

**Recomendación:** agregar logging estructurado (Serilog o el `ILogger` de `Microsoft.Extensions.Logging`) con un sink centralizado (Seq, Application Insights, ELK, CloudWatch, etc.), como mínimo en: excepciones no controladas, operaciones de dinero (caja, pagos), y accesos denegados/fallidos de autenticación.

**Qué se hizo:** Serilog (consola + archivo rotado por día en `logs/`), con `TenantId`/`TenantNombre`/`UserId`/`TipoAuth` enriqueciendo cada línea de log del request vía `IDiagnosticContext`. Ver detalle en [Trabajo realizado](#trabajo-realizado-desde-la-auditoría-original).

### 5. Manejo de errores por `switch` sobre el *mensaje* de la excepción, repetido en cada controller — ✅ Resuelto
**Dónde:** patrón repetido en prácticamente todos los controllers, ejemplo [Controllers/PersonasController.cs:51-62](Controllers/PersonasController.cs#L51-L62) y siguientes

El patrón dominante es: el servicio lanza `throw new Exception("texto en español")`, y el controller hace `catch (Exception ex) { switch(ex.Message) { case "texto en español": return BadRequest(...); default: return 500 } }`. Esto implica:
- Cualquier error no anticipado (null ref, timeout de DB, etc.) también cae en el `default` como 500 genérico "Ocurrió un error inesperado", sin logging (ver #4) — invisible en producción.
- Un simple typo o un refactor que cambie el texto de un mensaje convierte silenciosamente un 400 esperado en un 500.
- Se duplica el mismo bloque `try/catch/switch` decenas de veces en vez de centralizarlo.
- Todas las excepciones son `System.Exception` genérica — no hay una jerarquía de excepciones de dominio (`NotFoundException`, `ValidationException`, `ConflictException`, etc.) que permita mapear a códigos HTTP de forma robusta.

`Tenancy/Services/DatabaseTransactionManager.cs:32-36` agrava esto: en el `catch` hace `throw new Exception(ex.Message)`, perdiendo el stack trace y el tipo original de la excepción — dificulta aún más el diagnóstico y rompe el uso de `catch` tipados aguas arriba.

**Recomendación:** definir excepciones de dominio tipadas, agregar un middleware global de manejo de excepciones (`UseExceptionHandler` / `IExceptionHandler` de .NET 8, o `ProblemDetails`) que mapee tipo de excepción → status code + logging, y eliminar los `try/catch` repetidos de cada acción de controller. En `DatabaseTransactionManager`, reemplazar `throw new Exception(ex.Message)` por `throw;`.

**Qué se hizo:** jerarquía `AppException` (`NotFoundException` 404, `ConflictException` 409, `BusinessRuleException` 400, `UnauthorizedException` 401) + `ExceptionHandlingMiddleware` global. Se migraron **los 21 controllers/servicios con endpoints activos** del proyecto (todos excepto el ARCA/facturación electrónica, que quedó fuera de alcance a propósito). El `throw new Exception(ex.Message)` de `DatabaseTransactionManager` y el mismo patrón en `PagosRepository.CrearPago` ya están arreglados (`throw;`). Ver el detalle completo, incluidos ~7 bugs de mensajes que no coincidían entre servicio y controller (por lo tanto caían siempre en 500), en [Trabajo realizado](#trabajo-realizado-desde-la-auditoría-original).

### 6. Prácticamente no hay validación de entrada — 🟡 Parcial
**Estado:** no se agregaron Data Annotations a los DTOs (sigue pendiente), pero al migrar excepciones se movieron sistemáticamente las validaciones manuales que vivían sueltas en cada controller hacia el servicio correspondiente, tipándolas como `BusinessRuleException` — quedó mucho más consistente qué se valida y dónde, aunque el mecanismo (código a mano, no atributos declarativos) sigue siendo el mismo.

**Dónde:** DTOs en general (`grep` de `[Required]/[MaxLength]/[StringLength]/[Range]` → solo 4 ocurrencias en **todo** `DTOs/`)

Salvo dos DTOs puntuales, ningún DTO usa Data Annotations. `[ApiController]` valida automáticamente el `ModelState`, pero si no hay atributos que declaren restricciones, esa validación automática no hace nada útil (strings vacíos, negativos, longitudes absurdas, emails inválidos, etc. pasan sin filtro). La validación que existe está hecha a mano y de forma inconsistente dentro de cada servicio (algunos chequean `string.IsNullOrEmpty`, otros no chequean nada).

Ejemplo concreto: `CrearDeliveryTakeawayDTO.Origen` es un `string` libre sin restricción (debería ser un enum o al menos validarse contra una lista fija) — ver hallazgo #8.

**Recomendación:** agregar Data Annotations (o FluentValidation, más expresivo para reglas cruzadas) a todos los DTOs de entrada, y devolver 400 con detalle de campo vía `ValidationProblem` de forma consistente.

### 7. CORS abierto a cualquier origen/método/header — ⬜ Pendiente
**Dónde:** [Program.cs:81-88](Program.cs#L81-L88)

```csharp
options.AddPolicy("AllowAll", policy =>
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
```

Aceptable para desarrollo, pero en producción cualquier sitio puede hacer requests a la API. Con Bearer tokens (no cookies) el riesgo de CSRF es bajo, pero sigue exponiendo la API a scraping/abuso desde cualquier origen y dificulta detectar tráfico ilegítimo.

**Recomendación:** restringir `AllowedOrigins` a los dominios reales del frontend por ambiente (usando `builder.Configuration` para no hardcodear), y considerar rate limiting (`Microsoft.AspNetCore.RateLimiting`, disponible nativo desde .NET 7) — no hay ninguno configurado hoy, lo que deja la API sin protección ante abuso/fuerza bruta en `/login`.

---

## 🟡 Medios — lógica de negocio

### 8. Flujo de Delivery/Takeaway: varios bugs concretos — 🟡 Parcial
**Dónde:** [Services/DeliveryTakeawayServices.cs](Services/DeliveryTakeawayServices.cs)

- ✅ **Resuelto** — NullReferenceException en pedidos Delivery sin cadete: ahora chequea `HasValue` antes de resolver el cadete; crear un Delivery sin cadete (para asignarlo después) funciona.
- ✅ **Resuelto** — validación del rol del cadete al crear: se agregó el mismo chequeo (`IdRol != 3`) que ya tenía `Modificar`, ahora también al crear. Además se encontró que ese mismo chequeo se había **perdido en un refactor posterior** a esta auditoría dentro de `Modificar` (el controller todavía tenía el `case` esperando el mensaje de error, pero nada lo tiraba) — se restauró.
- 🟡 **Parcial** — `Origen` sigue siendo un string libre comparado con `==` (no se convirtió a `enum`), pero un valor inválido ahora tira `BusinessRuleException` de forma explícita (400) en vez de dejar el pedido a medio inicializar en silencio.
- ✅ **Resuelto** (el código evolucionó desde la auditoría original) — el DTO de modificación ya no se llama `ListaProductos`/`Entregado` sino `ProductosAgregados`/`ProductosEliminados`, y ambos **sí** se leen y aplican en el servicio; `Entregado` tiene su propio endpoint (`CambiarEntregado`) que funciona.
- ✅ **Resuelto** (superado) — `MarcarComoEntregado` ya no existe en el código; fue reemplazado por `CambiarEntregado`, que está implementado y anda.
- ⬜ **Pendiente** — Borrar un pedido sigue sin reconciliar caja/pagos: repone stock pero no verifica si ya estaba pagado ni reversa el `MovimientoCaja` asociado.

**Recomendación restante:** convertir `Origen` a `enum`, y bloquear/advertir el borrado de pedidos ya pagados (o generar automáticamente el movimiento de reverso en caja).

### 9. Apertura de caja: condición de carrera entre el chequeo y la creación — 🟡 Parcial
**Dónde:** [Controllers/CajasController.cs](Controllers/CajasController.cs), [Services/CajasServices.cs](Services/CajasServices.cs)

El controller consulta `BuscarCajaAbiertaPorIdSucursal` y, si no hay ninguna, recién ahí llama a `CrearCaja` — es un patrón "check-then-act" sin transacción ni constraint a nivel de base de datos. Dos requests concurrentes de apertura (doble clic, dos dispositivos) pueden ambos pasar el chequeo antes de que el primero termine de insertar, resultando en dos cajas abiertas simultáneamente para la misma sucursal, lo que rompe la contabilidad de esa sucursal (movimientos de caja ambiguos, `MontoActual` dividido entre dos registros).

**Qué se hizo:** el chequeo se movió del controller al servicio (`CajasServices.CrearCaja`), tirando `ConflictException` (409) en vez del 400 genérico de antes — mejora la capa donde vive la regla, pero **no cierra la condición de carrera**: sigue siendo check-then-act sin lock. Falta lo de abajo.

**Recomendación restante:** agregar un índice único parcial en Postgres (`CREATE UNIQUE INDEX ... ON "Cajas" ("IdSucursal") WHERE "FechaCierre" IS NULL`) que garantice a nivel de base que solo puede haber una caja abierta por sucursal, y capturar la violación de constraint como el error de negocio "ya hay una caja abierta".

### 10. Contraseñas: HMACSHA512 con salt por-clave-aleatoria, sin trabajo computacional (no es un KDF) — ⬜ Pendiente
**Dónde:** [Services/Global/PasswordService.cs](Services/Global/PasswordService.cs)

El hash de contraseña se genera con `HMACSHA512` usando como "salt" la clave aleatoria del propio HMAC (`hmac.Key`). Funcionalmente evita rainbow tables (hay salt único por usuario), pero HMAC-SHA512 es una función *rápida* — no tiene el costo computacional ajustable de un KDF diseñado para contraseñas (PBKDF2, BCrypt, Argon2). Ante una eventual fuga de la tabla de usuarios, un ataque de fuerza bruta offline sobre estos hashes es órdenes de magnitud más rápido que contra BCrypt/Argon2.

**Recomendación:** migrar a `Rfc2898DeriveBytes`/PBKDF2 (nativo en .NET, fácil de introducir), BCrypt.Net o Argon2, con un plan de migración incremental (rehashear en el próximo login exitoso).

### 11. Expiración de JWT fija en 1 hora, sin refresh token — ⬜ Pendiente
**Dónde:** [Services/Global/JWTServices.cs](Services/Global/JWTServices.cs) (`hours_expire = 1` en los 3 métodos)

No hay mecanismo de refresh token ni de revocación (logout no invalida el token — es stateless puro). Para un sistema operativo (un mozo tomando pedidos durante un turno de 6+ horas), esto obliga a relogin cada hora o a que el frontend guarde credenciales para renovar silenciosamente (mala práctica). Tampoco hay forma de revocar un token comprometido antes de que expire (ej. empleado despedido en medio de su turno sigue con acceso válido hasta el vencimiento).

**Recomendación:** implementar refresh tokens de vida más larga (rotables, revocables en base de datos) y acortar el access token, o al menos mantener una lista de revocación (denylist por `jti`) para los casos de baja de empleado/cambio de contraseña.

### 12. `X-Tenant-ID` inconsistente con Swagger/documentación de API pública — ⬜ Pendiente
**Dónde:** [Program.cs:55-76](Program.cs#L55-L76)

Swagger está documentado con dos security schemes en paralelo (Bearer + `X-Tenant-ID` como ApiKey), reforzando en la propia documentación de la API el patrón inseguro del hallazgo #1: se invita a los consumidores a resolver el tenant por header en vez de derivarlo del token. Una vez resuelto #1, esta definición de Swagger debe actualizarse.

---

## ⚪ Bajos / calidad de código

- **`BackEndAPI - Backup.csproj`** en el root del repo — un archivo de backup de proyecto versionado, no debería estar en git.
- **`package.json`/`package-lock.json`** con dependencias de frontend (`redux-devtools-extension`, `@fortawesome/...`) sueltos en la raíz de una API .NET — parecen residuo de copiar/pegar de otro proyecto; si no se usan, eliminarlos.
- **`ModificarDeliveryTakeawayDTO.cs:1`** tiene `using System.Security.Policy;` — namespace obsoleto/no relacionado, resto de un autocompletado, sin uso real.
- ✅ **Resuelto** — `BuscarPersonaPorId`/`BuscarPersonaPorDni` en `PersonasServices.cs` no eran `async` y comparaban la `Task` sin awaitear contra `null` (siempre `false`, nunca se disparaba el "no encontrado"). Se corrigió al migrar Personas a excepciones tipadas: ahora son `async`/`await` y comparan sobre el resultado real.
- No hay paginación en endpoints de listado (`GetListaPersonasDeEmpresa`, `BuscarListaCajas`, historiales de movimientos) — no es crítico al volumen actual, pero conviene resolverlo antes de que el volumen de datos por tenant crezca.
- No hay health checks (`/health`) ni endpoint de versión — dificulta el monitoreo en orquestadores (k8s, App Service, etc.).
- No se encontraron tests automatizados en el repo (no hay proyecto `*.Tests` ni carpeta de tests) — para lógica tan sensible como caja/stock/multi-tenancy, la ausencia total de tests es un riesgo alto de regresión a cada cambio.

---

## Trabajo realizado desde la auditoría original

Sesión de trabajo enfocada en dos frentes: (1) infraestructura de logging y manejo de errores, y (2) migración sistemática de todos los controllers/servicios con endpoints activos del patrón "`Exception` genérica + `switch` sobre el mensaje" a excepciones de dominio tipadas. En el camino de tocar cada módulo se revisó su lógica con el mismo nivel de detalle que la auditoría original, y aparecieron varios hallazgos nuevos — algunos se arreglaron sobre la marcha (por ser correcciones obvias y acotadas), otros quedaron marcados para decisión del equipo.

### Logging (hallazgo #4)
- Serilog: consola + archivo rotado por día (`logs/`), con nivel configurable vía `appsettings.json`.
- `Middlewares/ExceptionHandlingMiddleware.cs`: red de seguridad global — loguea cualquier excepción no controlada con stack trace completo y contexto (tenant, usuario, path), y devuelve una respuesta consistente en vez de la página de error por defecto de ASP.NET.
- Cada línea de log de un request queda enriquecida con `TenantId`, `TenantNombre`, `UserId` y `TipoAuth` (vía `IDiagnosticContext`, seteado en `TenantDbMiddleware` y un nuevo `RequestUserContextMiddleware`).

### Excepciones tipadas (hallazgo #5)
Jerarquía nueva en `Exceptions/`: `AppException` (base) → `NotFoundException` (404), `ConflictException` (409), `BusinessRuleException` (400), `UnauthorizedException` (401, agregada durante la migración de Auth). El `ExceptionHandlingMiddleware` las atrapa de forma genérica (loguea `Warning`, sin ruido de stack trace) separado de excepciones no anticipadas (`Error`, con stack trace completo).

**Los 21 controllers/servicios con endpoints activos quedaron migrados:** Personas, Cajas, MovimientosCaja, Productos, Categorías, CuentasCorrientes, Mesas, Reservas, Visitas, Stock, Pagos, Empresas, Sucursales, Roles, Auth, TipoEnvios, TipoMovimientosCaja, Menús (solo el servicio — el controller está comentado, ver más abajo), Planos, DeliveryTakeaway, Ticket. Quedó fuera de alcance a propósito el módulo **ARCA** (facturación electrónica AFIP) — sigue con `Exception` genérica.

### Bugs de "mensaje no coincide" encontrados (la razón de ser de este cambio)
En al menos 7 lugares distintos, el servicio tiraba un mensaje y el `switch` del controller buscaba un texto ligeramente distinto — típicamente por un typo, una palabra de más/menos, o mayúscula/minúscula — haciendo que ese caso **siempre cayera en el 500 genérico** en vez del status code que se había pensado para él. Los más notables:
- `MovimientosCajaServices`: `"El monto Abonado debe ser mayor a cero"` vs. el case `"El monto debe ser mayor a cero"` (faltaba "Abonado").
- `PagosController`: `"Monto abonado inválido"` vs. case `"monto abonado inválido"` (mayúscula/minúscula), y el servicio tiraba literalmente `"no encontrado"` vs. el case `"delivery id no encontrado"` (textos sin relación).
- `CuentasCorrientesController`: el mismo tipo de mismatch para "cuenta no encontrada" y "monto mayor a cero".
- `MesasController`: `"La mesa que intenta modificar no existe"` (servicio) vs. case `"No se encontró la mesa con el Id especificado"` (nunca usado por el servicio) — en **dos** endpoints (`ModificarMesa` y `AbrirCerrarMesa`).
- `DeliveryTakeawayServices`: `"No se puede modificar un pedido entregado"` (singular) vs. case `"No se pueden modificar pedidos entregados"` (plural) — en **dos** endpoints (`Modificar` y `Eliminar`).

Con excepciones tipadas esta clase entera de bug ya no puede volver a pasar (no depende de que dos strings coincidan letra por letra).

### Bugs de negocio reales encontrados y corregidos en el camino
- **Pagos — se podía cobrar el mismo producto dos veces.** `CalcularTotalProductos` no chequeaba si un producto ya estaba `EstadoPagado`; reenviar el mismo pago volvía a sumarlo al total y le pisaba el `IdMovimientoCaja`. El controller ya tenía un `case "Producto ya pagado"` esperando este error — nunca se tiraba. Se agregó el chequeo (`ConflictException`).
- **Sucursales — se podía duplicar el `Username`** de dos sucursales (usado para el login `empresa@sucursal`), sin ningún aviso. Mismo patrón: el controller ya esperaba `"Sucursal ya existe"`, el servicio no lo tiraba. Corregido con exclusión por propio Id.
- **Categorías — no se podía guardar una categoría sin cambiarle el nombre.** `ModificarCategoria` validaba unicidad del nombre nuevo *sin excluir a la propia categoría*, así que reenviar el mismo nombre (el caso normal al editar cualquier otro campo) siempre fallaba con "ya existe".
- **Planos — mismo bug que Sucursales/Categorías**: se podía renombrar un plano al nombre de otro de la misma sucursal sin aviso; restaurado el chequeo con exclusión por propio Id.
- **DeliveryTakeaway — regresión real de un refactor posterior a la auditoría original**: `AplicarCadeteAsync` dejó de validar que la persona asignada como cadete tuviera `IdRol == 3` (el controller seguía teniendo el `case` esperando el error). Restaurado, y sumado también al alta (antes solo existía en la modificación).
- **Planos — `ObtenerPlanoPorId` armaba el DTO de respuesta y después devolvía la entidad cruda** (`return Ok(plano)` en vez de `return Ok(response)`) — no relacionado a excepciones, se corrigió de paso. Cambia la forma del JSON devuelto; avisar al frontend si depende de la forma anterior.

### Seguridad: 3 controllers sin `[Authorize]` (relacionado al hallazgo #2)
`MesasController`, `VisitasController` y `PagosController` no tenían **ningún** `[Authorize]` — completamente públicos, incluido el endpoint que registra pagos. Se agregó. `TicketController` no lo tenía tampoco pero es plausible que sea intencional (ticket de solo lectura por Guid no adivinable, patrón "link de comprobante") — se dejó marcado y el equipo ya lo revisó. `TipoMovimientosCajaController` tenía el `[Authorize]` deliberadamente comentado (no ausente) — también ya resuelto por el equipo.

### Cosas encontradas y dejadas sin tocar, pendientes de decisión
- **`EmpresasController.ModificarEmpresa` y `.CambiarEstadoEmpresa` no hacen nada.** Devuelven 200 sin llamar a ningún servicio — parecen funcionar pero no modifican nada en la base. No implementados a propósito (no está claro qué campos debería poder tocar `ModificarEmpresa`, y es una decisión de producto).
- **`MenusController` está completamente comentado** — la clase entera, no solo algunos métodos. El servicio existe y ya está migrado a excepciones tipadas, pero hoy no hay ningún endpoint HTTP activo para gestionar menús.
- El certificado AFIP hardcodeado en `WsfeService.cs` (ver hallazgo #3 actualizado arriba).

### Herramienta de prueba
Se armó [`pruebas.http`](pruebas.http) (formato REST Client de VS Code) con un flujo de punta a punta — login, apertura de caja, mesas, productos, pago — más casos puntuales para cada bug de esta lista (el doble cobro, el nombre duplicado, etc.), para no tener que probar todo a mano cada vez.

---

## Cambios de frontend necesarios

### 🔴 Urgente, ligado al deploy del hallazgo #1 (tenant atado al JWT)

1. **Todas las sesiones activas se invalidan en el momento del deploy.** Ningún token emitido antes de este cambio tiene el claim `TenantId` nuevo, así que la primera llamada autenticada que haga cualquier usuario después del deploy va a devolver **401** ("La sesión no es válida. Volvé a iniciar sesión."), sin importar que el token todavía no haya vencido. El frontend tiene que estar preparado para esto: cualquier 401 en una llamada autenticada (no solo en `/Login`) tiene que limpiar el token guardado y mandar al usuario a la pantalla de login — si hoy solo lo hacen para el propio `/Login`, hay que extenderlo a un interceptor global de respuestas.
2. **El header `X-Tenant-ID` ya no hace falta para ninguna llamada autenticada.** Después del login, el tenant sale exclusivamente del JWT — el header se ignora por completo si se manda. **Sigue siendo obligatorio** para `POST /Login` y `POST /LoginPersona` (ahí todavía no hay token). No hay apuro en sacarlo del resto de las llamadas — no rompe nada si lo siguen mandando, simplemente ya no hace nada — pero se puede simplificar esa parte del cliente HTTP cuando quieran.
3. Comunicar a los usuarios (o programar el deploy en un horario de bajo uso) que **todos van a tener que volver a loguearse** apenas se despliegue esto.

### 🟡 Cambios de status code por la migración a excepciones tipadas

Antes, casi todos los errores de negocio devolvían **400** (o directamente **500**, en los casos donde el mensaje del servicio no coincidía con el `switch` del controller — ver "Bugs de mensaje no coincide" arriba). Ahora los status code son consistentes y con significado real. Si el frontend decide qué mostrar en base al **código HTTP** (no solo al texto del mensaje), hay que revisar estos casos — quedaron con un status distinto al que tenían antes:

| Antes | Ahora | Casos típicos |
|---|---|---|
| 400 | **409 Conflict** | "Ya existe" (categoría, sucursal, plano, producto, empresa, tipo de envío), "ya hay una caja abierta", "la caja/visita ya está cerrada", "producto ya pagado", "pedido ya entregado" |
| 400 | **404 Not Found** | Cualquier "no encontrado/a" que antes devolvía 400 (personas, cajas, sucursales, etc.) |
| 400 | **401 Unauthorized** | Contraseña incorrecta (login de personas) y contraseña actual incorrecta (cambiar contraseña) |
| **500** (bug) | El status que correspondía | Todos los casos listados en "Bugs de mensaje no coincide" — antes caían siempre en 500 sin importar cuál era el error real |

El **cuerpo** de la respuesta de error también quedó consistente en todos los endpoints: siempre `{ "error": { "codigo": ..., "tipo": "...", "mensaje": "..." } }` (antes mezclaba texto plano, objetos anónimos `{ message: "..." }`, y el `ErrorDTO` actual, según el controller).

### 🟡 Cambios de forma en respuestas puntuales

- **`Planos` → `GET /Plano`**: antes devolvía la entidad completa de EF (con navegaciones anidadas); ahora devuelve el DTO limpio (`PlanosDTO`) que ya se arma en el propio endpoint. Si el frontend leía algún campo que solo estaba en la entidad cruda, hay que revisarlo.
- **`CuentasCorrientes`**: los campos `IdMovimimientoCaja` (con el typo) y `Domicilo` (con el typo) en las respuestas de `GET /CuentasCorrientes` y `GET /CuentasCorrientes/{id}` pasaron a llamarse `IdMovimientoCaja` y `Domicilio` (sin el typo) — se unificaron con el DTO que ya usaba `POST /CuentasCorrientes/CrearMovimiento`. Además, esos dos endpoints (`GET`) ahora también incluyen `EsIngreso`/`EsEfectivo` por movimiento, y el endpoint de `CrearMovimiento` ahora también incluye `MontoAbonado`/`Vuelto` (antes solo lo tenían los `GET`).
- **`Visitas`**: los endpoints `GET /Visita`, `POST /AgregarProductoAVisita`, `GET /VisitasActivas` y `GET /TodasLasVisitas` ahora devuelven todos la misma forma completa (`Mozo`, `IdMesa`, `NumeroMesa` incluidos siempre) — antes `GetVisitaPorId` no traía `Mozo`, y `AgregarProductoAVisita` no traía `Mozo`/`IdMesa`/`NumeroMesa`.
- **`Reservas` → `POST /Reservas`**: la respuesta de crear una reserva ahora incluye `TelefonoContacto` (antes se lo olvidaba, a diferencia de los `GET`).

### ⚪ Sin cambios, pero repasando por si acaso
Ninguno de los cambios de arriba tocó la forma de los DTOs de **request** (lo que el frontend manda) — todos los cambios fueron del lado de qué status code y qué forma de respuesta devuelve la API.

---

## Priorización sugerida (orden de trabajo)

1. ~~Bloqueante inmediato: atar la resolución de tenant al JWT (#1)~~ — **hecho**, ver arriba y [cambios de frontend necesarios](#cambios-de-frontend-necesarios). Sigue bloqueante: rotar secretos, incluido el certificado AFIP (#3) — ningún dato real de cliente debería tocar esta API hasta que esto esté resuelto.
2. **Bloqueante inmediato:** autorización por rol + validación de pertenencia de recursos (#2) — el agujero más grave (controllers enteros sin `[Authorize]`) ya se tapó, pero la falta de granularidad por rol sigue intacta.
3. ~~Antes de ir a producción: middleware de excepciones + logging estructurado (#4, #5)~~ — **hecho**. Sigue pendiente: validación de DTOs con Data Annotations (#6, mejoró parcialmente), CORS restringido + rate limiting (#7).
4. Antes del primer cierre de caja en producción real: constraint de caja única abierta en la base (#9 — el chequeo de aplicación ya está, falta el índice único), reconciliación de borrado de pedidos pagados (#8), hashing de contraseñas con KDF (#10).
5. Deuda técnica a planificar: refresh tokens (#11), tests automatizados, paginación, limpieza de archivos sueltos, decidir qué hacer con los stubs de Empresas y el controller de Menús comentado.

---

## Nota sobre cobertura de esta auditoría

**Actualización 2026-09-11:** la salvedad original ("no se revisaron Reservas, Mesas/Planos, CuentasCorrientes, Pagos") ya no aplica — los 21 módulos con endpoints activos se revisaron y migraron en la sesión de trabajo de logging/excepciones (ver [Trabajo realizado](#trabajo-realizado-desde-la-auditoría-original)). Lo que **sigue sin revisarse en profundidad**:
- El módulo **ARCA** (facturación electrónica AFIP) — se tocó solo un `throw` puntual en `WsfeService.cs`, el resto (firma CMS, WSAA, generación del CAE) no se auditó, y ya apareció ahí un hallazgo grave (certificado hardcodeado, ver #3).
- La **capa de Repositories** en general — se revisó lo que hizo falta para tipar excepciones y en un caso puntual (Stock) por el locking, pero no hubo una pasada dedicada a buscar problemas de N+1, tracking innecesario, etc. en el resto.
- Las **migraciones de EF Core** y el modelo de datos en profundidad.
- Nada de lo anterior tuvo tests automatizados agregados — la ausencia total de tests (hallazgo de baja/calidad) sigue igual, y ahora hay más lógica de negocio corregida sin ningún test de regresión que la proteja.
