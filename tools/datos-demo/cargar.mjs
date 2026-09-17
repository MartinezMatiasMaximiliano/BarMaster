import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Solo usa endpoints públicos de la aplicación y credenciales suministradas.
const base = new URL(process.env.BARMASTER_API_URL || 'http://192.168.100.15:5145/');
const archivo = resolve(process.env.BARMASTER_DEMO_REPORT || 'tools/datos-demo/resultado.json');
const journal = archivo.replace(/\.json$/, '') + '.jsonl';
const ejecutar = process.argv.includes('--ejecutar');
let token = process.env.BARMASTER_TOKEN;
let tenant = process.env.BARMASTER_TENANT || process.env.BARMASTER_USERNAME?.split('@')[0];
let fechaServidor;
const informe = { inicio: new Date().toISOString(), api: base.origin, modo: ejecutar ? 'carga' : 'inspeccion', creados: {} };
mkdirSync(dirname(archivo), { recursive: true });

async function api(ruta, { body, form, vacio404 = false } = {}) {
    const response = await fetch(new URL(ruta, base), {
        method: body || form ? 'POST' : 'GET',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(tenant ? { 'X-Tenant-ID': tenant } : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: form || (body ? JSON.stringify(body) : undefined),
        signal: AbortSignal.timeout(60000),
    });
    fechaServidor ||= response.headers.get('date');
    const texto = await response.text();
    if (response.status === 404 && vacio404) return [];
    if (!response.ok) throw new Error(`${body || form ? 'POST' : 'GET'} /${ruta}: HTTP ${response.status}: ${texto.slice(0, 600)}`);
    if (!texto) return null;
    try { return JSON.parse(texto); } catch { return texto; }
}

async function crear(tipo, ruta, body, form) {
    const resultado = await api(ruta, { body, form });
    informe.creados[tipo] = (informe.creados[tipo] || 0) + 1;
    appendFileSync(journal, JSON.stringify({ fecha: new Date().toISOString(), tipo,
        nombre: body?.Nombre || body?.NombreCliente || body?.NombreReserva || body?.Nombres || form?.get('Nombre'),
        resultado }) + '\n');
    writeFileSync(archivo, JSON.stringify(informe, null, 2));
    return resultado;
}

const catalogo = [
    ['Cafetería', 2500, 'Espresso|Americano|Cortado|Café con leche|Capuchino|Latte|Flat white|Mocaccino|Café irlandés|Cold brew'],
    ['Tés e infusiones', 2200, 'Té negro|Té verde|Té rojo|Té de jazmín|Manzanilla|Té de frutos rojos|Chai latte|Té de menta|Té de jengibre|Mate cocido'],
    ['Desayunos', 5500, 'Desayuno clásico|Desayuno americano|Desayuno saludable|Desayuno continental|Desayuno vegano|Tostadas con palta|Huevos revueltos|Yogur con granola|Omelette de desayuno|Desayuno para dos'],
    ['Panadería', 1800, 'Medialuna de manteca|Medialuna de grasa|Croissant|Pain au chocolat|Scone de queso|Scone dulce|Roll de canela|Chipá|Tostadas integrales|Pan de campo'],
    ['Entradas', 6500, 'Provoleta|Bastones de mozzarella|Rabas|Bruschettas|Croquetas de jamón|Empanadas de carne|Empanadas de pollo|Empanadas de verdura|Buñuelos de acelga|Hummus con pita'],
    ['Ensaladas', 8500, 'Ensalada César|Ensalada griega|Ensalada de quinoa|Ensalada de atún|Ensalada de rúcula|Ensalada caprese|Ensalada de pollo|Ensalada de lentejas|Ensalada de salmón|Ensalada de temporada'],
    ['Hamburguesas', 11500, 'Hamburguesa clásica|Hamburguesa doble cheddar|Hamburguesa bacon|Hamburguesa BBQ|Hamburguesa de pollo|Hamburguesa veggie|Hamburguesa de hongos|Hamburguesa criolla|Hamburguesa picante|Hamburguesa triple'],
    ['Sándwiches', 8000, 'Sándwich de milanesa|Sándwich de lomito|Sándwich de pollo|Sándwich caprese|Club sándwich|Sándwich de jamón y queso|Sándwich vegetariano|Sándwich de atún|Sándwich de bondiola|Sándwich de salmón'],
    ['Pizzas', 12500, 'Pizza mozzarella|Pizza napolitana|Pizza fugazzeta|Pizza cuatro quesos|Pizza de rúcula|Pizza de jamón y morrones|Pizza calabresa|Pizza vegetariana|Pizza de champiñones|Pizza margarita'],
    ['Pastas', 11000, 'Ñoquis con tuco|Ravioles de ricota|Sorrentinos de jamón|Tallarines al pesto|Spaghetti bolognesa|Penne al pomodoro|Lasagna de carne|Canelones de verdura|Fettuccine Alfredo|Ravioles de calabaza'],
    ['Carnes', 15500, 'Bife de chorizo|Vacío al horno|Entraña a la parrilla|Bondiola braseada|Milanesa napolitana|Lomo al champiñón|Asado de tira|Matambre a la pizza|Costillas BBQ|Milanesa de ternera'],
    ['Pollo', 12000, 'Pollo grillado|Pollo al limón|Suprema napolitana|Pollo al curry|Pollo a la mostaza|Milanesa de pollo|Brochette de pollo|Pollo al verdeo|Pollo con verduras|Alitas de pollo'],
    ['Pescados', 16500, 'Salmón grillado|Merluza al horno|Trucha a la manteca|Fish and chips|Langostinos al ajillo|Paella de mariscos|Salmón al limón|Merluza rebozada|Cazuela de mariscos|Trucha con verduras'],
    ['Vegetarianos', 10500, 'Risotto de hongos|Wok de vegetales|Milanesa de berenjena|Curry de garbanzos|Tarta de espinaca|Tarta de zapallitos|Bowl de quinoa|Falafel con ensalada|Calabaza rellena|Tofu salteado'],
    ['Guarniciones', 4500, 'Papas fritas|Papas rústicas|Puré de papas|Puré de calabaza|Arroz blanco|Verduras grilladas|Batatas fritas|Papas al provenzal|Ensalada mixta chica|Papas con cheddar'],
    ['Postres', 5500, 'Flan casero|Budín de pan|Tiramisú|Cheesecake|Brownie con helado|Volcán de chocolate|Lemon pie|Chocotorta|Ensalada de frutas|Copa helada'],
    ['Bebidas sin alcohol', 3000, 'Agua sin gas|Agua con gas|Gaseosa cola|Gaseosa lima limón|Gaseosa naranja|Limonada|Jugo de naranja|Jugo de pomelo|Limonada con menta|Agua saborizada'],
    ['Cervezas', 5000, 'Cerveza rubia|Cerveza roja|Cerveza negra|IPA artesanal|APA artesanal|Golden artesanal|Honey artesanal|Porter artesanal|Cerveza sin alcohol|Pinta de trigo'],
    ['Vinos', 9500, 'Malbec de la casa|Cabernet Sauvignon|Merlot|Syrah|Pinot Noir|Chardonnay|Sauvignon Blanc|Torrontés|Rosado|Espumante brut'],
    ['Cócteles', 6500, 'Fernet con cola|Gin tonic|Aperol spritz|Mojito|Negroni|Campari con naranja|Daiquiri|Caipirinha|Vermú con soda|Cuba libre'],
];
const nombres = ['Lucía', 'Martín', 'Sofía', 'Diego', 'Valentina', 'Nicolás', 'Camila', 'Joaquín', 'Florencia', 'Matías', 'Julieta', 'Santiago', 'Agustina', 'Tomás', 'Carolina', 'Federico', 'Paula', 'Gabriel', 'Mariana', 'Andrés'];
const apellidos = ['García', 'Pérez', 'López', 'Fernández', 'González', 'Rodríguez', 'Romero', 'Díaz', 'Torres', 'Acosta', 'Benítez', 'Sosa', 'Herrera', 'Medina', 'Castro', 'Ruiz', 'Suárez', 'Molina', 'Silva', 'Rojas'];
const cliente = (i) => `${nombres[i % nombres.length]} ${apellidos[Math.floor(i / nombres.length) % apellidos.length]}`;
const telefono = (i) => `115550${String(i).padStart(4, '0')}`;
const contar = (datos) => ({ mesas: datos.mesas.length, categorias: datos.categorias.length,
    productos: datos.productos.length, mozos: datos.personas.filter(p => p.rol?.id === 2).length,
    cadetes: datos.personas.filter(p => p.rol?.id === 3).length,
    deliveries: datos.pedidos.filter(p => p.idTipoEnvio != null).length,
    takeaways: datos.pedidos.filter(p => p.idTipoEnvio == null).length, reservas: datos.reservas.length });

async function consultar() {
    const datos = {};
    // Secuencial para no saturar el backend local con consultas grandes.
    for (const [clave, ruta, vacio404] of [['mesas', 'Mesa'], ['categorias', 'Categorias', true],
        ['productos', 'Productos', true], ['personas', 'ListaEmpleados'], ['planos', 'ListaPlanosSucursal'],
        ['envios', 'TipoEnvios', true], ['pedidos', 'DeliveryTakeaway'], ['reservas', 'Reservas']]) {
        datos[clave] = await api(ruta, { vacio404 });
        if (!Array.isArray(datos[clave])) throw new Error(`Respuesta inesperada de /${ruta}`);
    }
    datos.caja = await api('Cajas/Activa', { vacio404: true });
    return datos;
}

function verificarDatosDemo(datos) {
    const idsProductos = new Set(datos.productos.map(p => p.id));
    const pedidos = datos.pedidos.filter(p => p.indicaciones?.startsWith('[DEMO '));
    for (const pedido of pedidos) {
        if (!pedido.idVisita || !pedido.productos?.length
            || pedido.productos.some(p => !idsProductos.has(p.idProducto))) {
            throw new Error(`Pedido demo con referencias incompletas: ${pedido.id}`);
        }
        const total = pedido.productos.reduce((suma, p) => suma + Number(p.precio), Number(pedido.precioEnvio));
        if (Math.abs(total - Number(pedido.precioTotal)) > 0.01) {
            throw new Error(`Total incorrecto en pedido demo: ${pedido.id}`);
        }
        if (pedido.idTipoEnvio != null && (!pedido.cadete?.id || !pedido.direccion)) {
            throw new Error(`Delivery demo sin cadete o dirección: ${pedido.id}`);
        }
    }
    const reservas = datos.reservas.filter(r => r.nombreReserva?.includes('· DEMO '));
    if (reservas.some(r => !r.estado?.id || r.cantidadDePersonas < 2 || r.cantidadDePersonas > 8)) {
        throw new Error('Reserva demo con estado o cantidad de personas inválidos.');
    }
    return { pedidosVerificados: pedidos.length,
        productosEnPedidos: pedidos.reduce((suma, p) => suma + p.productos.length, 0),
        reservasVerificadas: reservas.length,
        reservasDesde: reservas.length ? reservas.map(r => r.fechaHora).sort()[0] : null,
        reservasHasta: reservas.length ? reservas.map(r => r.fechaHora).sort().at(-1) : null };
}

async function main() {
    if (!token) {
        if (!process.env.BARMASTER_USERNAME || !process.env.BARMASTER_PASSWORD) {
            throw new Error('Faltan BARMASTER_USERNAME/BARMASTER_PASSWORD o BARMASTER_TOKEN de una sucursal.');
        }
        const login = await api('Login', { body: { Username: process.env.BARMASTER_USERNAME, Password: process.env.BARMASTER_PASSWORD } });
        token = login.access_token ?? login.access_Token ?? login.Access_token;
        if (!token) throw new Error('El login no devolvió access_token.');
    }
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    tenant = claims.TenantId;
    if (!claims.IdSucursal) throw new Error('Se necesita un token de sucursal (IdSucursal).');
    informe.sucursal = claims.IdSucursal;
    informe.empresa = claims.IdEmpresa;
    let datos = await consultar();
    informe.antes = contar(datos);
    console.log('Datos existentes:', JSON.stringify(informe.antes));
    if (!ejecutar) {
        informe.verificacion = verificarDatosDemo(datos);
        informe.cajaActiva = !Array.isArray(datos.caja) && Boolean(datos.caja?.id);
        writeFileSync(archivo, JSON.stringify(informe, null, 2));
        return;
    }

    for (const [nombre] of catalogo) {
        if (datos.categorias.length >= 20) break;
        if (datos.categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) continue;
        datos.categorias.push(await crear('categorias', 'Categorias', { Nombre: nombre }));
    }
    const existentes = new Set(datos.productos.map(p => p.nombre.toLowerCase()));
    let totalProductos = datos.productos.length;
    for (const [indice, [categoria, basePrecio, lista]] of catalogo.entries()) {
        const categoriaId = (datos.categorias.find(c => c.nombre === categoria) || datos.categorias[indice % datos.categorias.length])?.id;
        if (!categoriaId) throw new Error('No hay categorías disponibles para los productos.');
        for (const [variante, nombre] of lista.split('|').entries()) {
            if (totalProductos >= 200) break;
            if (existentes.has(nombre.toLowerCase())) continue;
            const precio = basePrecio + variante * 350;
            const form = new FormData();
            for (const [key, value] of Object.entries({ Codigo: `DEMO-${String(indice * 10 + variante + 1).padStart(4, '0')}`,
                Nombre: nombre, Descripcion: `${nombre}, preparado en el momento. Carta de demostración de BarMaster.`,
                PrecioNeto: precio, PorcentajeIVA: 21, CostoProduccion: Math.round(precio * 0.38),
                Activo: true, ControlaStock: false, ListaIdCategorias: categoriaId })) form.append(key, String(value));
            await crear('productos', 'Productos', undefined, form);
            existentes.add(nombre.toLowerCase());
            totalProductos++;
        }
    }
    console.log('Catálogo cargado.');

    if (datos.mesas.length < 60) {
        for (const nombre of ['Salón principal', 'Terraza', 'Patio']) {
            if (!datos.planos.some(p => p.nombre === nombre)) {
                datos.planos.push(await crear('planos', 'Plano', { Nombre: nombre, Detalles: 'Distribución de mesas para la demostración.' }));
            }
        }
        for (let i = 1; datos.mesas.length < 60; i++) {
            const numero = i;
            if (datos.mesas.some(m => m.numero === numero)) continue;
            const plano = datos.planos[(i - 1) % datos.planos.length];
            const posicion = plano.mesas?.length || 0;
            const body = { Numero: numero, IdPlano: plano.id, Capacidad: [2, 4, 4, 6, 8][(i - 1) % 5],
                x: (posicion % 6) * 2, y: Math.floor(posicion / 6) * 2, w: 2, h: 2 };
            await crear('mesas', 'Mesa', body);
            datos.mesas.push({ numero });
            plano.mesas ||= [];
            plano.mesas.push({ numero });
        }
    }
    for (let i = 0; i < 8; i++) {
        const dni = `99000${String(i + 1).padStart(3, '0')}`;
        if (datos.personas.some(p => p.datosPersonales?.dni === dni)) continue;
        await crear('mozos', 'Registrar', { Nombres: nombres[i], Apellido: apellidos[i], Dni: dni,
            Password: process.env.BARMASTER_DEMO_PERSON_PASSWORD || 'DemoBarMaster2026!',
            Email: `mozo${i + 1}@demo.invalid`, Direccion: `Dirección ficticia ${i + 1}`,
            Telefono: telefono(i + 1), Activo: true, IdRol: 2 });
    }
    let cadete = datos.personas.find(p => p.rol?.id === 3 && p.datosPersonales?.activo);
    if (!cadete && informe.antes.deliveries < 500) {
        await crear('cadetes', 'Registrar', { Nombres: 'Facundo', Apellido: 'Demo', Dni: '99000999',
            Password: process.env.BARMASTER_DEMO_PERSON_PASSWORD || 'DemoBarMaster2026!',
            Email: 'cadete@demo.invalid', Direccion: 'Dirección ficticia 99', Telefono: telefono(999), Activo: true, IdRol: 3 });
        datos.personas = await api('ListaEmpleados');
        cadete = datos.personas.find(p => p.rol?.id === 3 && p.datosPersonales?.activo);
    }
    if (!datos.envios.length && informe.antes.deliveries < 500) {
        datos.envios.push(await crear('tiposEnvio', 'TipoEnvios', { Nombre: 'Envío zona centro', Precio: 2500 }));
    }
    if ((informe.antes.deliveries < 500 || informe.antes.takeaways < 500)
        && !datos.caja?.id) {
        await crear('cajas', 'Cajas/Abrir', { MontoApertura: 0 });
        datos.caja = await api('Cajas/Activa');
    }
    informe.caja = datos.caja?.id;
    datos.productos = await api('Productos');
    const productos = datos.productos.filter(p => p.activo && p.codigo?.startsWith('DEMO-'));
    if (!productos.length) throw new Error('No hay productos demo activos; se detiene para no consumir stock de productos existentes.');
    for (const origen of ['Delivery', 'Takeaway']) {
        const previo = origen === 'Delivery' ? informe.antes.deliveries : informe.antes.takeaways;
        if (origen === 'Delivery' && previo < 500 && !cadete?.id) throw new Error('No hay cadete disponible.');
        for (let i = previo; i < 500; i++) {
            const envio = datos.envios[i % datos.envios.length];
            await crear(origen === 'Delivery' ? 'deliveries' : 'takeaways', 'DeliveryTakeaway/Crear', {
                Origen: origen, NombreCliente: cliente(i), Telefono: telefono(i),
                Direccion: origen === 'Delivery' ? `${['Av. Rivadavia', 'Av. Santa Fe', 'Av. Corrientes', 'San Martín', 'Belgrano'][i % 5]} ${100 + i * 7}, domicilio ficticio` : null,
                Indicaciones: `[DEMO ${origen} ${String(i + 1).padStart(3, '0')}] ${['Sin cubiertos', 'Tocar timbre', 'Sin sal agregada', 'Empacar por separado', ''][i % 5]}`,
                IdTipoEnvio: origen === 'Delivery' ? envio.id : null, IdCadete: origen === 'Delivery' ? cadete.id : null,
                ListaProductos: Array.from({ length: 2 + i % 4 }, (_, j) => ({
                    IdProducto: productos[(i * 7 + j * 13) % productos.length].id,
                    Cantidad: 1 + (i + j) % 2, Detalles: j === 0 && i % 7 === 0 ? 'Sin sal agregada' : '',
                })),
            });
            if ((i + 1) % 50 === 0) console.log(`${origen}: ${i + 1}/500`);
        }
    }
    const inicioReservas = new Date(fechaServidor || Date.now());
    const mesasReserva = await api('Mesa');
    inicioReservas.setHours(0, 0, 0, 0);
    inicioReservas.setDate(inicioReservas.getDate() + 1);
    for (let i = datos.reservas.length; i < 500; i++) {
        const fecha = new Date(inicioReservas);
        fecha.setDate(fecha.getDate() + Math.floor(i / 10));
        fecha.setHours([12, 13, 19, 20, 21][i % 5], i % 2 ? 30 : 0);
        const personas = 2 + i % 7;
        const mesasConCapacidad = mesasReserva.filter(m => m.capacidad >= personas);
        await crear('reservas', 'Reservas', { NombreReserva: `${cliente(i)} · DEMO ${String(i + 1).padStart(3, '0')}`,
            Telefono: telefono(i), FechaHora: fecha.toISOString(), CantidadDePersonas: personas,
            IdMesa: mesasConCapacidad.length ? mesasConCapacidad[i % mesasConCapacidad.length].id : null,
            IdEstadoReserva: i % 10 === 0 ? 3 : 2 });
        if ((i + 1) % 50 === 0) console.log(`Reservas: ${i + 1}/500`);
    }
    datos = await consultar();
    informe.despues = contar(datos);
    informe.verificacion = verificarDatosDemo(datos);
    informe.mozosDemo = datos.personas.filter(p => p.datosPersonales?.dni?.startsWith('99000') && p.rol?.id === 2)
        .map(p => ({ nombre: `${p.datosPersonales.nombres} ${p.datosPersonales.apellido}`, codigoDeServicio: p.codigoDeServicio, id: p.id }));
    for (const [key, limite] of Object.entries({ mesas: 60, categorias: 20, deliveries: 500, takeaways: 500, reservas: 500 })) {
        if (informe.despues[key] !== Math.max(informe.antes[key], limite)) throw new Error(`Cantidad inesperada para ${key}: ${informe.despues[key]}`);
    }
    informe.fin = new Date().toISOString();
    writeFileSync(archivo, JSON.stringify(informe, null, 2));
    console.log('Carga verificada:', JSON.stringify(informe.despues));
}

main().catch(error => {
    informe.error = error.message;
    writeFileSync(archivo, JSON.stringify(informe, null, 2));
    console.error(error.message);
    process.exitCode = 1;
});
