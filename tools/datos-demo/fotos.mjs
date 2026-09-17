import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const base = new URL(process.env.BARMASTER_API_URL || 'http://192.168.100.15:5145/');
const carpeta = resolve('tools/datos-demo/fotos');
const archivo = resolve('tools/datos-demo/fotos.json');
const subir = process.argv.includes('--subir');
const informe = existsSync(archivo) ? JSON.parse(readFileSync(archivo, 'utf8')) : { productos: [] };
mkdirSync(carpeta, { recursive: true });
let token;
let tenant = process.env.BARMASTER_USERNAME?.split('@')[0];
const consultas = new Map();
const descargas = new Map();
const pausas = (ms) => new Promise(res => setTimeout(res, ms));

async function api(ruta, body, form) {
    const response = await fetch(new URL(ruta, base), {
        method: form ? 'PATCH' : body ? 'POST' : 'GET',
        headers: { 'X-Tenant-ID': tenant, ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: form || (body ? JSON.stringify(body) : undefined), signal: AbortSignal.timeout(60000),
    });
    const texto = await response.text();
    if (!response.ok) throw new Error(`API ${ruta}: ${response.status} ${texto.slice(0, 300)}`);
    return texto ? JSON.parse(texto) : null;
}

// Cada posición coincide con el código DEMO-0001 ... DEMO-0200 del catálogo.
// Las variantes del mismo plato pueden compartir una fotografía representativa.
const grupos = [
    ['espresso', 'americano coffee', 'cortado coffee', 'cafe latte', 'cappuccino', 'cafe latte', 'flat white coffee', 'caffe mocha', 'Irish coffee', 'cold brew coffee'],
    ['black tea cup', 'green tea cup', 'red tea cup', 'jasmine tea cup', 'chamomile tea', 'berry tea', 'chai latte', 'mint tea', 'ginger tea', 'mate cocido'],
    ['breakfast toast coffee', 'American breakfast', 'yogurt granola', 'continental breakfast', 'vegan breakfast', 'avocado toast', 'scrambled eggs', 'yogurt granola', 'omelette', 'breakfast toast coffee'],
    ['croissant', 'croissant', 'croissant', 'pain au chocolat', 'cheese scone', 'sweet scones pastry', 'cinnamon roll', 'chipa', 'whole wheat toast', 'sourdough bread'],
    ['provoleta', 'mozzarella sticks', 'fried calamari', 'bruschetta', 'croquettes', 'empanadas', 'empanadas', 'empanadas', 'vegetable fritters', 'hummus'],
    ['Caesar salad', 'Greek salad', 'quinoa salad', 'tuna salad', 'arugula salad', 'caprese salad', 'chicken salad', 'lentil salad', 'salmon salad', 'vegetable salad'],
    ['hamburger', 'cheeseburger', 'bacon cheeseburger', 'barbecue burger', 'chicken burger', 'veggie burger', 'mushroom burger', 'hamburger', 'hamburger', 'cheeseburger'],
    ['milanesa sandwich', 'steak sandwich', 'chicken sandwich', 'caprese sandwich', 'club sandwich', 'ham cheese sandwich', 'vegetable sandwich', 'tuna sandwich', 'pulled pork sandwich', 'salmon sandwich'],
    ['margherita pizza', 'Neapolitan pizza', 'fugazzeta', 'four cheese pizza', 'arugula pizza', 'ham pizza', 'pepperoni pizza', 'vegetable pizza', 'mushroom pizza', 'margherita pizza'],
    ['gnocchi tomato', 'ravioli', 'ravioli', 'pasta pesto', 'spaghetti bolognese', 'penne tomato', 'lasagna', 'cannelloni', 'fettuccine Alfredo', 'ravioli'],
    ['grilled steak', 'roast beef', 'skirt steak', 'pulled pork', 'milanesa napolitana', 'steak mushroom', 'asado', 'matambre pizza', 'barbecue ribs', 'milanesa'],
    ['grilled chicken breast', 'lemon chicken', 'chicken parmesan', 'chicken curry', 'chicken mustard', 'chicken schnitzel', 'chicken skewers', 'chicken vegetables', 'chicken vegetables', 'chicken wings'],
    ['grilled salmon', 'baked cod', 'trout butter', 'fish chips', 'garlic shrimp', 'seafood paella', 'cooked salmon fillet lemon', 'fried fish', 'seafood stew', 'trout vegetables'],
    ['mushroom risotto', 'vegetable stir fry', 'eggplant schnitzel', 'chickpea curry', 'spinach quiche', 'vegetable quiche', 'quinoa bowl', 'falafel salad', 'stuffed squash', 'tofu stir fry'],
    ['French fries', 'potato wedges', 'mashed potato', 'mashed pumpkin', 'white rice', 'grilled vegetables', 'sweet potato fries', 'roasted potatoes', 'mixed salad', 'cheese fries'],
    ['caramel flan', 'bread pudding', 'tiramisu', 'cheesecake', 'brownie ice cream', 'chocolate lava cake', 'lemon pie', 'chocotorta', 'fruit salad', 'ice cream sundae'],
    ['glass water', 'sparkling water glass', 'cola glass', 'lemon soda', 'orange soda', 'lemonade', 'orange juice', 'grapefruit juice', 'mint lemonade', 'glass water'],
    ['beer glass', 'amber beer', 'dark beer', 'IPA beer', 'pale ale beer', 'golden ale beer', 'honey beer', 'porter beer', 'beer glass', 'wheat beer'],
    ['red wine glass', 'red wine glass', 'red wine glass', 'red wine glass', 'red wine glass', 'white wine glass', 'white wine glass', 'white wine glass', 'rose wine glass', 'sparkling wine glass'],
    ['fernet cola', 'gin tonic', 'Aperol spritz', 'mojito', 'Negroni', 'Campari orange', 'daiquiri', 'caipirinha', 'vermouth soda', 'Cuba libre'],
];
const alternativas = ['espresso coffee', 'tea cup', 'breakfast', 'croissant', 'empanadas', 'salad', 'hamburger', 'sandwich', 'pizza', 'pasta', 'steak', 'chicken food', 'fish food', 'vegetables food', 'potatoes', 'dessert', 'juice glass', 'beer glass', 'wine glass', 'cocktail'];
const normalizar = (valor) => valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const licencias = ['CC0', 'Public domain', 'CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 2.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0'];

async function buscar(consulta) {
    if (consultas.has(consulta)) return consultas.get(consulta);
    await pausas(2000);
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    for (const [k, v] of Object.entries({ action: 'query', format: 'json', generator: 'search',
        gsrsearch: `${consulta} filetype:bitmap`, gsrnamespace: 6, gsrlimit: 30,
        prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: 640 })) url.searchParams.set(k, v);
    let response;
    for (let intento = 0; intento < 4; intento++) {
        response = await fetch(url, { headers: { 'User-Agent': 'BarMasterDemo/1.0 (local food catalog illustration)' }, signal: AbortSignal.timeout(45000) });
        if (response.status !== 429) break;
        console.log('Wikimedia solicita una pausa; se retoma la búsqueda.');
        await pausas(Math.max(15000, Number(response.headers.get('retry-after') || 0) * 1000));
    }
    if (!response.ok) throw new Error(`Búsqueda Wikimedia: HTTP ${response.status}`);
    const json = await response.json();
    if (json.error) throw new Error(`Wikimedia: ${json.error.info}`);
    const palabras = normalizar(consulta).split(' ');
    const candidatos = Object.values(json.query?.pages || {}).filter(p => {
        const i = p.imageinfo?.[0];
        const licencia = i?.extmetadata?.LicenseShortName?.value;
        return i?.thumburl && /\.(jpe?g|png)/i.test(i.url) && i.width >= 400 && i.height >= 300
            && licencias.includes(licencia)
            && !i.extmetadata?.Restrictions?.value
            && !/logo|diagram|map\b|flag|icon\b|advert|poster|menu\b|packag|label\b|machine|museum|museo|still life|sign\b|factory|vintage|historic|painting|drawing|racing|formula|rally|portrait|statue|encyclopedia|market|building|street|intestine|arms\b|inn\b|geograph|19[0-6]\d/i.test(p.title)
            && !(/chicken/i.test(consulta) && !/burger|sandwich/i.test(consulta) && /burger|sandwich/i.test(p.title))
            && !(/salmon/i.test(consulta) && !/sushi/i.test(consulta) && /sushi/i.test(p.title));
    }).sort((a, b) => {
        const puntaje = (p) => palabras.filter(w => normalizar(p.title).includes(w)).length;
        return puntaje(b) - puntaje(a) || a.index - b.index;
    });
    consultas.set(consulta, candidatos);
    return candidatos;
}

async function preparar(producto) {
    const numero = Number(producto.codigo.slice(5)) - 1;
    const grupo = Math.floor(numero / 10);
    const consulta = grupos[grupo]?.[numero % 10];
    if (!consulta) throw new Error(`Código demo desconocido: ${producto.codigo}`);
    // Reutilizamos fotos de familias homogéneas; otros platos se buscan por nombre.
    const termino = [5, 8, 17].includes(grupo) || (grupo === 6 && ![4, 5, 6].includes(numero % 10))
        ? alternativas[grupo] : consulta;
    for (const busqueda of [...new Set([termino, alternativas[grupo]])]) {
        const palabras = normalizar(consulta).split(' ');
        const candidatos = [...await buscar(busqueda)].sort((a, b) => {
            const puntos = (p) => palabras.filter(w => normalizar(p.title).includes(w)).length;
            return puntos(b) - puntos(a);
        });
        for (const candidato of candidatos) {
            const i = candidato.imageinfo[0];
            const url = new URL(i.thumburl);
            url.search = '';
            let descargada = descargas.get(url.href);
            if (!descargas.has(url.href)) {
                const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
                if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
                    descargas.set(url.href, null);
                    continue;
                }
                descargada = { bytes: Buffer.from(await response.arrayBuffer()), tipo: response.headers.get('content-type') };
                descargas.set(url.href, descargada);
            }
            if (!descargada) continue;
            const { bytes, tipo } = descargada;
            if (bytes.length < 2000 || bytes.length > 4000000) continue;
            const extension = tipo.includes('png') ? 'png' : 'jpg';
            const nombreArchivo = `${producto.codigo}.${extension}`;
            writeFileSync(resolve(carpeta, nombreArchivo), bytes);
            return { id: producto.id, codigo: producto.codigo, nombre: producto.nombre,
                archivo: nombreArchivo, consulta: busqueda, representativa: busqueda !== consulta,
                fuente: i.descriptionurl, descarga: url.href, titulo: candidato.title,
                licencia: i.extmetadata.LicenseShortName.value,
                licenciaUrl: i.extmetadata.LicenseUrl?.value || '',
                autor: i.extmetadata.Artist?.value || '',
                sha256: createHash('sha256').update(bytes).digest('hex') };
        }
    }
    throw new Error(`No se encontró una foto CC0/dominio público para ${producto.nombre}.`);
}

async function main() {
    if (!process.env.BARMASTER_USERNAME || !process.env.BARMASTER_PASSWORD) throw new Error('Faltan credenciales de sucursal en variables de entorno.');
    const login = await api('Login', { Username: process.env.BARMASTER_USERNAME, Password: process.env.BARMASTER_PASSWORD });
    token = login.access_token;
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (!claims.IdSucursal) throw new Error('Se requiere login de sucursal.');
    tenant = claims.TenantId;
    const productos = (await api('Productos')).filter(p => /^DEMO-\d{4}$/.test(p.codigo));
    for (const [indice, producto] of productos.entries()) {
        let foto = informe.productos.find(p => p.id === producto.id);
        if (!foto || !existsSync(resolve(carpeta, foto.archivo))) {
            if (subir) throw new Error(`Primero preparar la foto de ${producto.nombre}.`);
            foto = await preparar(producto);
            informe.productos = informe.productos.filter(p => p.id !== producto.id);
            informe.productos.push(foto);
            writeFileSync(archivo, JSON.stringify(informe, null, 2));
        }
        if (subir && (!foto.subida || producto.imagenUrl.includes('Placeholder'))) {
            const form = new FormData();
            form.append('IdProducto', producto.id);
            form.append('Imagen', new Blob([readFileSync(resolve(carpeta, foto.archivo))], { type: foto.archivo.endsWith('.png') ? 'image/png' : 'image/jpeg' }), foto.archivo);
            await api('Productos', undefined, form);
            foto.subida = new Date().toISOString();
            writeFileSync(archivo, JSON.stringify(informe, null, 2));
        }
        if ((indice + 1) % 10 === 0) console.log(`${subir ? 'Fotos cargadas' : 'Fotos preparadas'}: ${indice + 1}/${productos.length}`);
    }
    if (subir) {
        const actualizados = (await api('Productos')).filter(p => /^DEMO-\d{4}$/.test(p.codigo));
        for (const producto of actualizados) {
            if (!producto.imagenUrl || producto.imagenUrl.includes('Placeholder')) throw new Error(`Falta la imagen de ${producto.nombre}.`);
            const response = await fetch(new URL(producto.imagenUrl, base));
            if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Imagen inaccesible: ${producto.nombre}.`);
            const bytes = Buffer.from(await response.arrayBuffer());
            const foto = informe.productos.find(p => p.id === producto.id);
            if (createHash('sha256').update(bytes).digest('hex') !== foto.sha256) {
                throw new Error(`El backend devolvió otra imagen para ${producto.nombre}.`);
            }
        }
        informe.verificados = actualizados.length;
        informe.fin = new Date().toISOString();
        writeFileSync(archivo, JSON.stringify(informe, null, 2));
        console.log(`Verificados ${actualizados.length} productos con imágenes accesibles.`);
    } else console.log(`Preparación completa: ${productos.length} productos.`);
    const escapar = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const filas = informe.productos.map(p => `<tr><td>${escapar(p.nombre)}</td><td><a href="${escapar(p.fuente)}">${escapar(p.titulo)}</a></td><td>${escapar(p.autor.replace(/<[^>]*>/g, ''))}</td><td><a href="${escapar(p.licenciaUrl || p.fuente)}">${escapar(p.licencia)}</a></td></tr>`).join('\n');
    const creditos = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Créditos de fotografías demo de BarMaster</title><style>body{font:16px system-ui;margin:32px}table{border-collapse:collapse}td,th{padding:12px;border:1px solid #ddd;text-align:left}</style><h1>Fotografías del catálogo de demostración</h1><p>Fotografías procedentes de Wikimedia Commons. Cada imagen conserva la licencia indicada. Se utiliza la miniatura publicada por Wikimedia; no se hicieron otros cambios. Algunas imágenes ilustran variantes del mismo plato.</p><table><thead><tr><th>Producto</th><th>Fotografía y fuente</th><th>Autor</th><th>Licencia</th></tr></thead><tbody>${filas}</tbody></table></html>`;
    writeFileSync(resolve('tools/datos-demo/creditos-fotos.html'), creditos);
    if (subir) writeFileSync(resolve('BackEndAPI/wwwroot/uploads/ImagenesProductos/CREDITOS_FOTOS_DEMO.html'), creditos);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
