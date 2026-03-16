# Auditoría frontendMozo — Documento de Cambios

## Índice

1. [useSignalR.js — Stale closures en handlers de SignalR](#1-usesignalrjs--stale-closures-en-handlers-de-signalr)
2. [HubConnMozo.js — Reconexión automática y manejo de errores](#2-hubconnmozojs--reconexión-automática-y-manejo-de-errores)
3. [useMozoCode.js (Index) — Dependencia faltante en useEffect](#3-usemozocodejs-index--dependencia-faltante-en-useeffect)
4. [App.jsx — Mutación de array con .reverse()](#4-appjsx--mutación-de-array-con-reverse)
5. [App.jsx — Memoización de helpers](#5-appjsx--memoización-de-helpers)
6. [App.jsx — Race conditions en carga de datos](#6-appjsx--race-conditions-en-carga-de-datos)
7. [visitasActivasSlice.js — Búsqueda por OR en actualizarVisita](#7-visitasactivasslicejs--búsqueda-por-or-en-actualizarvisita)
8. [visitasActivasSlice.js — Nullish coalescing en campos numéricos](#8-visitasactivasslicejs--nullish-coalescing-en-campos-numéricos)
9. [App.jsx — pagarTotal y pagarSeparado sin await](#9-appjsx--pagartotal-y-pagarseparado-sin-await)
10. [App.jsx — Catch vacío en AgregarItemsAPedido](#10-appjsx--catch-vacío-en-agregaritemsapedido)
11. [Eliminación de console.log de debug en archivos API](#11-eliminación-de-consolelog-de-debug-en-archivos-api)
12. [axiosInstance.js — Instancia centralizada de Axios](#12-axiosinstancejs--instancia-centralizada-de-axios)
13. [Migración de archivos API a axiosInstance](#13-migración-de-archivos-api-a-axiosinstance)
14. [Eliminación de connections/AuthService.js](#14-eliminación-de-connectionsauthservicejs)

---

## 1. useSignalR.js — Stale closures en handlers de SignalR

**Archivo:** `src/hooks/useSignalR.js`

### Problema

El hook registraba los handlers de SignalR dentro de un `useEffect` con dependency array vacío (`[]`). Esto significa que las funciones handler se capturaban una sola vez al montar el componente. Si el componente padre (App.jsx) se re-renderizaba — por ejemplo, porque cambió el estado de Redux — las funciones `onPagarMesa`, `onRegistrarProducto`, etc. seguían apuntando a la versión vieja del closure, con valores de estado desactualizados.

Esto se conoce como **stale closure**: la función "recuerda" el entorno léxico del momento en que se creó, no del momento en que se ejecuta.

### Ejemplo concreto del bug

```
1. App.jsx se monta. visitasActivas = [].
2. useSignalR registra onPagarMesa que internamente lee visitasActivas = [].
3. Llegan datos de la API. visitasActivas = [{ id: 1, ... }].
4. App.jsx se re-renderiza con los nuevos datos.
5. Llega un evento SignalR "PagarMesa".
6. Se ejecuta el handler viejo, que todavía ve visitasActivas = [].
```

### Solución: Patrón useRef

```js
const handlersRef = useRef(handlers);
handlersRef.current = handlers;

useEffect(() => {
    const onRegistrarProducto = (...args) => handlersRef.current.onRegistrarProducto?.(...args);
    // ... igual para los demás

    connection.on('RegistrarProducto', onRegistrarProducto);
    // ...
}, []);
```

**Cómo funciona:**

- `useRef` crea un objeto mutable `{ current: ... }` que persiste durante toda la vida del componente.
- En cada render, actualizamos `handlersRef.current = handlers` con los handlers frescos. Esto es síncrono y no causa re-renders.
- Los wrappers registrados en SignalR (`onRegistrarProducto`, etc.) no cambian nunca (se crean una sola vez), pero internamente leen `handlersRef.current` en el momento de la ejecución. Esto garantiza que siempre ejecutan la versión más reciente del handler.
- El dependency array sigue vacío `[]` porque no necesitamos re-suscribirnos a SignalR — los wrappers son estables. Lo que cambia es el ref, que se actualiza sin efectos secundarios.

### Ventajas

- Los handlers de SignalR siempre ejecutan con el estado más reciente de la aplicación.
- No hay re-suscripciones innecesarias a los eventos de SignalR (evita posibles race conditions de on/off).
- No requiere `useCallback` en App.jsx para cada handler.

---

## 2. HubConnMozo.js — Reconexión automática y manejo de errores

**Archivo:** `src/connections/HubConnMozo.js`

### Problema

Había tres problemas:

1. **Sin reconexión automática:** Si el backend se caía momentáneamente o había un corte de red, la conexión SignalR se perdía permanentemente. El mozo dejaba de recibir notificaciones en tiempo real sin ningún aviso.

2. **`send` se ejecutaba aunque `start` fallara:** El código usaba `await connection.start().catch(...)`. El `.catch()` capturaba el error pero el flujo continuaba a la siguiente línea, que intentaba hacer `connection.send(...)` sobre una conexión que nunca se estableció.

3. **Ejecución al nivel de módulo:** `ConectarAHub()` se llamaba automáticamente al importar el archivo. Si el backend no estaba listo, fallaba sin posibilidad de reintentar.

### Solución

```js
const connection = new SignalR.HubConnectionBuilder().withUrl(hubURL, {
    withCredentials: false
})
    .withAutomaticReconnect()
    .build();

export async function ConectarAHub() {
    try {
        await connection.start();
        connection.send("RegistrarMozoAGrupo", connection.connectionId);
    } catch (err) {
        console.error("Connection error:", err);
    }
}

connection.onreconnected(() => {
    connection.send("RegistrarMozoAGrupo", connection.connectionId)
        .catch(err => console.error("Error re-registering after reconnect:", err));
});
```

**Cambios clave:**

- **`withAutomaticReconnect()`**: La librería de SignalR tiene reconexión automática incorporada. Con la configuración por defecto, reintenta a los 0, 2, 10 y 30 segundos. Si falla después de 4 intentos, dispara el evento `onclose`.
- **try/catch en lugar de .catch()**: Si `start()` falla, el `send()` nunca se ejecuta porque el catch salta al bloque de error.
- **`onreconnected`**: Cuando la conexión se restablece después de una desconexión, el `connectionId` puede haber cambiado. Este handler vuelve a registrar al mozo en su grupo de SignalR.

### Ventajas

- Resiliencia ante cortes de red o reinicios del backend.
- El mozo no pierde notificaciones después de una desconexión temporal.
- No más errores silenciosos por intentar enviar sobre una conexión muerta.

---

## 3. useMozoCode.js (Index) — Dependencia faltante en useEffect

**Archivo:** `src/pages/Index/hooks/useMozoCode.js`

### Problema

El useEffect comparaba `mozo?.id === mozoEncontrado?.id` para decidir si despachar una actualización, pero `mozo` (que viene de Redux) no estaba en el array de dependencias. Si el mozo cambiaba desde otro componente o desde otra fuente, este effect no se re-ejecutaba y el estado quedaba desincronizado.

### Solución

```js
// Antes
}, [codigoMozo, datosMozos, dispatch]);

// Después
}, [codigoMozo, datosMozos, dispatch, mozo?.id]);
```

Se agrega `mozo?.id` (no el objeto completo `mozo`, para evitar re-ejecuciones innecesarias cuando cambian propiedades del mozo que no nos interesan en esta comparación).

### Nota

La versión en `Index2/hooks/useMozoCode.js` ya tenía esta dependencia correctamente. Este fix alinea ambas versiones.

---

## 4. App.jsx — Mutación de array con .reverse()

**Archivo:** `src/App.jsx` (línea del JSX de notificaciones)

### Problema

```jsx
{Notificaciones.reverse()}
```

`Array.reverse()` **muta el array original** en JavaScript. No crea una copia, sino que invierte el array in-place y lo devuelve. Como `Notificaciones` se recalculaba en cada render (antes de la memoización), el orden se invertía de ida y vuelta con cada re-render, causando un parpadeo visual o un orden inconsistente.

Además, mutar datos durante el render es un anti-pattern en React que puede causar bugs difíciles de rastrear, especialmente con el modo estricto de React (StrictMode) que ejecuta renders dobles en desarrollo.

### Solución

```jsx
{[...Notificaciones].reverse()}
```

El spread `[...]` crea una copia superficial del array. `.reverse()` se aplica sobre la copia, dejando el original intacto.

---

## 5. App.jsx — Memoización de helpers

**Archivo:** `src/App.jsx`

### Problema

Cuatro funciones helper se ejecutaban en cada render sin `useMemo`:

```js
const Notificaciones = MappearNotificaciones(notificaciones || [])
const datos_pedidos = MappearPedidos(visitasActivas || [])
const datos_reservas = MappearReservas(reservas || [])
const datos_planos_abm = MappearPlanos(planos || [])
```

Estas funciones procesan arrays (mapean, transforman, crean objetos JSX). Si App.jsx se re-renderiza por cualquier motivo (un cambio de estado, un nuevo query param en la URL, etc.), estas funciones se re-ejecutan aunque sus datos de entrada no hayan cambiado.

### Solución

```js
const Notificaciones = useMemo(() => MappearNotificaciones(notificaciones || []), [notificaciones])
const datos_pedidos = useMemo(() => MappearPedidos(visitasActivas || []), [visitasActivas])
const datos_reservas = useMemo(() => MappearReservas(reservas || []), [reservas])
const datos_planos_abm = useMemo(() => MappearPlanos(planos || []), [planos])
```

`useMemo` cachea el resultado y solo re-ejecuta la función cuando cambian las dependencias especificadas. Esto es consistente con los otros 4 helpers que ya estaban memoizados (`datos_mozos_listado`, `datos_personas_abm`, etc.).

### Ventajas

- Se evitan cálculos redundantes en cada re-render.
- Los componentes hijos que reciben estos datos como props no se re-renderizan innecesariamente (si usan `React.memo` o comparaciones de referencia).

---

## 6. App.jsx — Race conditions en carga de datos

**Archivo:** `src/App.jsx` (useEffect de carga de datos)

### Problema

El useEffect lanza ~12 llamadas API en paralelo cuando cambia `location.search` o `location.pathname`. Si el usuario navega rápido (por ejemplo, entra a `/sistema_sucursal`, luego cambia a otra vista y vuelve), las respuestas de la primera navegación pueden llegar **después** de las de la segunda, sobreescribiendo datos correctos con datos viejos.

```
Tiempo →
Nav 1: [API call A]────────────────────[respuesta A llega TARDE] → sobreescribe datos de Nav 2
Nav 2:        [API call B]──[respuesta B llega]
```

### Solución: Flag de cancelación

```js
useEffect(() => {
    let cancelled = false;

    if (esVistaMesas && localStorage.getItem('token')) {
        BuscarTodasLasMesas()
            .then(data => { if (!cancelled) SetMesas(Array.isArray(data) ? data : []); })
            .catch(() => { if (!cancelled) SetMesas([]); });
        // ... igual para todas las demás llamadas
    }

    return () => { cancelled = true; };
}, [location.search, location.pathname])
```

**Cómo funciona:**

1. Cada vez que el effect se ejecuta, crea una variable local `cancelled = false`.
2. Cada respuesta de API verifica `if (!cancelled)` antes de actualizar el estado.
3. Cuando el effect se limpia (porque cambió una dependencia o se desmonta el componente), la función de cleanup pone `cancelled = true`.
4. Si una respuesta llega después de la limpieza, la verificación `if (!cancelled)` impide que actualice el estado.

Este patrón es el recomendado por la documentación oficial de React para manejar race conditions en effects asíncronos.

### Ventajas

- Los datos mostrados siempre corresponden a la navegación actual.
- No hay state updates sobre componentes desmontados (evita el warning de React "Can't perform a React state update on an unmounted component").

---

## 7. visitasActivasSlice.js — Búsqueda por OR en actualizarVisita

**Archivo:** `src/redux/slices/visitasActivasSlice.js`

### Problema

La función `actualizarVisita` buscaba la visita a actualizar con un `findIndex` que usaba OR:

```js
const index = state.value.findIndex(
    v => v.id === visitaNormalizada.id ||
    v.numeroMesa === visitaNormalizada.numeroMesa ||
    (v.mesa?.numero === visitaNormalizada.numeroMesa)
);
```

Si dos visitas diferentes tenían algún campo coincidente (por ejemplo, mismo `numeroMesa` pero distinto `id`), el `findIndex` podría encontrar la visita equivocada si el primer criterio que matchea no es el más preciso.

### Solución: Búsqueda priorizada

```js
// Buscar primero por id (criterio más preciso)
let index = visitaNormalizada.id
    ? state.value.findIndex(v => v.id === visitaNormalizada.id)
    : -1;

// Solo si no se encontró por id, buscar por numeroMesa como fallback
if (index === -1 && visitaNormalizada.numeroMesa) {
    index = state.value.findIndex(
        v => v.numeroMesa === visitaNormalizada.numeroMesa ||
        v.mesa?.numero === visitaNormalizada.numeroMesa
    );
}
```

El `id` es el identificador único de la visita. Solo si no está disponible (por ejemplo, si el payload viene de un endpoint que no incluye el id) se recurre al `numeroMesa`.

---

## 8. visitasActivasSlice.js — Nullish coalescing en campos numéricos

**Archivo:** `src/redux/slices/visitasActivasSlice.js`

### Problema

El código usaba `||` (OR lógico) para normalizar campos entre PascalCase y camelCase:

```js
precio: p.precio || p.Precio || 0,
```

En JavaScript, `||` retorna el primer valor "truthy". El problema es que `0` es un valor **falsy**. Si un producto tiene `precio: 0` (por ejemplo, un producto de cortesía o una bonificación), el operador `||` lo descarta y pasa al siguiente valor.

```js
0 || p.Precio || 0  // → si p.Precio es 50, devuelve 50 (¡incorrecto!)
```

### Solución

```js
precio: p.precio ?? p.Precio ?? 0,
```

El operador `??` (nullish coalescing) solo descarta `null` y `undefined`. Valores como `0`, `""` y `false` se mantienen.

```js
0 ?? p.Precio ?? 0  // → devuelve 0 (correcto)
null ?? p.Precio ?? 0  // → devuelve p.Precio (correcto)
```

Se aplicó este cambio a todos los campos numéricos y de string en la normalización: `id`, `nombre`, `precio`, `precioDelMomento`, `idMovimientoCaja`, `fechaAgregado`.

---

## 9. App.jsx — pagarTotal y pagarSeparado sin await

**Archivo:** `src/App.jsx`

### Problema

Ambas funciones llamaban a `CambiarEstadoItems()` (una llamada API) pero despachaban las acciones de Redux inmediatamente después, sin esperar a que la API respondiera:

```js
// Antes
CambiarEstadoItems(ListaProductosPendientes, "Procesando");  // NO se espera
dispatch(agregarTicket(ListaProductosPendientes));  // Se ejecuta inmediatamente
dispatch(cambiarEstadoPagadoProductos({ ... }));    // Se ejecuta inmediatamente
```

Si la API fallaba (error de red, error del servidor), Redux ya marcó los productos como pagados, pero la base de datos no se actualizó. El resultado: **el frontend muestra "pagado" pero el backend no procesó el pago**.

`pagarSeparado` además no era `async`, con lo cual ni siquiera era posible esperar la respuesta.

### Solución

```js
async function pagarTotal(IdVisita) {
    try {
        const visita = await BuscarVisitaPorId(IdVisita);
        if (visita) {
            const ListaProductosPendientes = ...;
            if (ListaProductosPendientes.length > 0) {
                await CambiarEstadoItems(ListaProductosPendientes, "Procesando");
                // Solo si la API tuvo éxito:
                dispatch(agregarTicket(ListaProductosPendientes));
                dispatch(cambiarEstadoPagadoProductos({ ... }));
            }
        }
    } catch (error) {
        console.error("Error al procesar pago total:", error);
    }
}
```

Mismo patrón para `pagarSeparado`: ahora es `async`, espera la API con `await`, y solo despacha Redux si no hubo error.

### Ventajas

- Consistencia garantizada entre el estado local (Redux) y la base de datos.
- Si la API falla, el estado de Redux no se corrompe — los productos siguen apareciendo como "no pagados" y el mozo puede reintentar.

---

## 10. App.jsx — Catch vacío en AgregarItemsAPedido

**Archivo:** `src/App.jsx`

### Problema

```js
try {
    const productosCreados = await PostItems(Pedido, numeroMesa);
    sendRecargarTicket(numeroMesa);
} catch (error) {
    // Silencio total
}
```

Si `PostItems` fallaba, el error se tragaba sin dejar rastro. El mozo no recibía feedback y no había forma de diagnosticar el problema.

### Solución

```js
} catch (error) {
    console.error("Error al agregar items al pedido:", error);
}
```

Mínimamente, el error ahora se registra en la consola para diagnóstico.

---

## 11. Eliminación de console.log de debug en archivos API

**Archivos afectados:**
- `src/API/APIDeliveryTakeaway.js` — `console.log("BODY:", body)`
- `src/API/APIDeliveryTakeaway.jsx` — `console.log("BODY:", body)`
- `src/API/APIProductos.jsx` — `console.log("DATOS,", datos)`
- `src/API/APIVisitas.jsx` — `console.log("PRODUCTOS: ", productos)`

### Problema

Estos `console.log` exponían payloads de API completos en la consola del navegador en producción. Cualquier persona que abra DevTools puede ver los datos enviados, que podrían incluir información sensible del negocio.

### Solución

Se eliminaron todos los `console.log` de debug. Los `console.error` en bloques catch se mantienen ya que son útiles para diagnóstico de errores.

---

## 12. axiosInstance.js — Instancia centralizada de Axios

**Archivo nuevo:** `src/services/axiosInstance.js`

### Problema previo

Cada archivo en `src/API/` importaba `axios` directamente y construía los headers de autenticación manualmente:

```js
import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL + "Productos/"

export async function BuscarTodosLosProductos() {
    const response = await axios.get(BASE_URL, authService.getAuthHeaders());
    // ...
}
```

Esto tenía varios problemas:
- **Repetición**: ~19 archivos repitiendo la misma lógica de headers.
- **Sin manejo centralizado de errores**: Si el token expiraba (401), cada archivo tenía que manejar el error individualmente. En la práctica, ninguno lo hacía — el usuario quedaba en una pantalla rota.
- **Inconsistencia**: Algunos archivos manejaban errores con `alert()`, otros con `throw`, otros retornaban `error.response`.

### Solución

```js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

// Request interceptor: agrega headers de auth automáticamente
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
    return config;
});

// Response interceptor: manejo centralizado de 401
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('auth_type');
            localStorage.removeItem('USER_token');
            localStorage.removeItem('USER_auth_type');
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
```

**Cómo funciona:**

- **`axios.create({ baseURL })`**: Crea una instancia independiente de Axios con una URL base pre-configurada. Todas las llamadas a `api.get('Productos/')` se resuelven como `VITE_BASE_URL + 'Productos/'`.

- **Request interceptor**: Se ejecuta **antes** de cada request. Lee el token y tenantId de localStorage y los inyecta en los headers. Los archivos API ya no necesitan llamar a `authService.getAuthHeaders()`.

- **Response interceptor**: Se ejecuta **después** de cada response. Si el servidor responde 401 (token expirado o inválido):
  1. Limpia todos los tokens de localStorage.
  2. Redirige al login (solo si no estamos ya en el login, para evitar loops).
  3. Re-lanza el error con `Promise.reject()` para que el caller pueda manejarlo si lo necesita.

### Ventajas

- **Un solo lugar** para configurar autenticación y manejo de errores HTTP.
- Si el token expira, el usuario es redirigido automáticamente al login en lugar de quedar en una pantalla rota.
- Los archivos API son más limpios y cortos.
- Agregar futuros interceptores (logging, retry, etc.) se hace en un solo lugar.

---

## 13. Migración de archivos API a axiosInstance

**Archivos afectados:** Todos los archivos en `src/API/` (19 archivos)

### Patrón de migración

Cada archivo cambió de:

```js
import axios from 'axios'
import { authService } from '../services/authService'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Endpoint/"

export async function Funcion() {
    const response = await axios.get(BASE_URL, authService.getAuthHeaders());
}
```

A:

```js
import api from '../services/axiosInstance'

export async function Funcion() {
    const response = await api.get('Endpoint/');
}
```

### Caso especial: APIPersonas.jsx

`ModificarPassword` usa un token diferente (`USER_token` en lugar de `token`). Esta función mantiene `axios` directo con `authService.getAuthHeaders('USER_token')` porque el interceptor automático siempre usa el token de sucursal (`token`). Todas las demás funciones en el archivo usan `api`.

### Caso especial: APITicket.jsx

`ObtenerTicket` recibe un `tenantId` como parámetro (para tickets virtuales accesibles sin autenticación). Se mantiene el header manual de `X-Tenant-ID` porque en este caso el valor no viene de localStorage sino del parámetro de la función.

### Caso especial: APIProductos.jsx

Las funciones de crear/modificar producto usan `Content-Type: multipart/form-data`. Se mantuvo ese header específico pero se eliminó el spread de `...authService.getAuthHeaders().headers` porque el interceptor ahora inyecta los headers de auth automáticamente.

---

## 14. Eliminación de connections/AuthService.js

**Archivo eliminado:** `src/connections/AuthService.js`

### Justificación

Este archivo contenía un servicio de autenticación viejo/deprecado. El servicio actual y en uso es `src/services/authService.js`. Se verificó con búsqueda en todo el proyecto que **ningún archivo importaba** `connections/AuthService`, confirmando que era código muerto.

Mantener archivos muertos en el proyecto genera confusión (¿cuál es el AuthService correcto?) y aumenta la superficie de mantenimiento innecesariamente.
