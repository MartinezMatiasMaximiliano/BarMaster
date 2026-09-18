# Carga de datos de demostración mediante HTTP

`cargar.mjs` inicia sesión con `POST /Login`, conserva el JWT en memoria y envía `Authorization: Bearer ...` y `X-Tenant-ID` en las llamadas siguientes. No modifica la base por SQL ni guarda las credenciales en el reporte.

Requiere Node.js 20 o posterior y un backend en ejecución. Desde la raíz del repositorio, configurar `BARMASTER_API_URL`, `BARMASTER_USERNAME` y `BARMASTER_PASSWORD` mediante variables de entorno. El usuario debe corresponder a una sucursal (`empresa@sucursal`). También admite `BARMASTER_TOKEN` y `BARMASTER_TENANT` si ya se dispone de una sesión válida.

```powershell
# Consultar cantidades actuales sin crear datos de negocio.
node frontendMozo/tools/datos-demo/cargar.mjs

# Ejecutar la carga.
node frontendMozo/tools/datos-demo/cargar.mjs --ejecutar
```

## Alcance

- Completa hasta 60 mesas, 20 categorías y 200 productos, conservando los existentes.
- Completa hasta 500 deliveries, 500 takeaways y 500 reservas.
- Agrega ocho mozos ficticios, identificados por DNI demo para evitar duplicarlos al retomar la carga.
- Si hacen falta mesas, crea los planos de demostración que no existan.
- Reutiliza la caja abierta. Si no hay ninguna y hacen falta pedidos, abre una con monto inicial cero.
- Reutiliza un cadete activo y tipos de envío. Si faltan, crea un cadete demo y un tipo de envío de zona centro.

Los productos demo tienen categorías, precios, costos e IVA, están activos y usan la imagen predeterminada. Se crean sin control de stock. Los pedidos utilizan exclusivamente esos productos para no consumir existencias de los productos previos.

Los deliveries y takeaways se crean con productos, cantidades e indicaciones variadas. Los endpoints fijan su fecha en el momento de creación y su estado inicial; la carga no cobra ni marca como entregados los pedidos. Las reservas se distribuyen desde mañana durante 50 días, con grupos de 2 a 8 personas y estados Pendiente, Confirmada o Cancelada. Todos los nombres, domicilios y contactos generados son ficticios.

La contraseña de las personas demo se configura con `BARMASTER_DEMO_PERSON_PASSWORD`; por defecto es `DemoBarMaster2026!`. Sus códigos de servicio de cuatro dígitos los genera el backend y se incluyen en el reporte final.

## Reportes y recuperación

`resultado.json` conserva cantidades iniciales/finales, altas efectuadas y códigos de servicio de los mozos demo. `resultado.jsonl` registra cada alta exitosa con su respuesta. Son archivos locales excluidos de Git. Se puede cambiar la ubicación con `BARMASTER_DEMO_REPORT`.

La ejecución se detiene ante el primer error. No reintenta POST automáticamente, porque una respuesta perdida podría haber creado el registro. Una nueva ejecución consulta nuevamente los datos y completa los topes restantes. No elimina registros existentes si ya superan los límites. No ejecutar varias cargas simultáneas.

## Carga realizada el 15 de septiembre de 2026

En la sucursal utilizada se crearon mediante POST 17 categorías, 197 productos, 3 planos, 59 mesas, 8 mozos, 1 cadete, 500 deliveries, 500 takeaways y 500 reservas: **1.785 altas**. Se reutilizó la caja activa y el tipo de envío existente.

Los GET finales confirmaron 60 mesas, 20 categorías, 200 productos, 9 mozos, 1 cadete y 500 registros de cada uno de los tres tipos solicitados.

## Fotografías

`fotos.mjs` prepara fotografías de Wikimedia Commons y las asigna exclusivamente a los productos con código `DEMO-...`. Algunas variantes comparten una fotografía representativa. Las imágenes se descargan primero y se suben luego mediante `PATCH /Productos` con `IdProducto` e `Imagen` en multipart; el resto de los campos se conserva.

```powershell
node frontendMozo/tools/datos-demo/fotos.mjs
node frontendMozo/tools/datos-demo/fotos.mjs --subir
```

Usa las mismas variables de entorno de autenticación que la carga inicial. `fotos.json` registra fuente, autor, licencia, hash y fecha de subida; `creditos-fotos.html` conserva las atribuciones. Se utilizan fotografías con licencia CC0, dominio público, CC BY o CC BY-SA; cada una conserva su licencia original. Al subirlas, se publica una copia de los créditos junto a las imágenes del backend, en `/uploads/ImagenesProductos/CREDITOS_FOTOS_DEMO.html`.

Las búsquedas respetan las pausas solicitadas por Wikimedia y reutilizan resultados. Se puede retomar una ejecución interrumpida sin volver a subir las imágenes ya registradas. La verificación final consulta el catálogo y descarga cada imagen desde el backend para comprobar que está accesible.

## Mesa reservada

La API de reservas admite `IdMesa` (UUID nullable) en POST y PUT. Omitirlo al modificar conserva la mesa; `null` quita la asignación. Los GET devuelven `idMesa` y `mesaReserva` (nombre obtenido de la relación). La mesa debe pertenecer a un plano de la sucursal de la reserva. Las cargas nuevas eligen una mesa con capacidad suficiente cuando existe. No se impone control de solapamiento porque no hay duración de reserva.

Antes de ejecutar estas herramientas con el nuevo contrato, aplicar `20260915204537_VincularReservaMesa` a la base de la empresa y reiniciar la API. La migración resuelve nombres anteriores por sucursal; si un nombre no existe o coincide con más de una mesa, aborta sin descartar datos y requiere corregir esa asignación.

Se cargaron y verificaron las imágenes de los 197 productos nuevos mediante PATCH y GET de cada archivo. El campo de mesa reservada se verificó con dos pruebas de backend, dos de frontend y llamadas HTTP a una instancia temporal del backend actualizado: consulta general, consulta por fecha y edición para cambiar, conservar o quitar la mesa. La reserva demo usada en esa comprobación fue restaurada y se mantuvieron las 500 reservas. El frontend compiló correctamente. La instancia habitual del backend requiere reinicio para exponer los nuevos campos de reservas.
