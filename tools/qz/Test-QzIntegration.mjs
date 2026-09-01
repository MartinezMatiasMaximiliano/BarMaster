import qz from '../../frontendMozo/node_modules/qz-tray/qz-tray.js';

const required = ['BARMASTER_QZ_BACKEND', 'BARMASTER_QZ_TOKEN', 'BARMASTER_QZ_TENANT', 'BARMASTER_QZ_STATION'];
for (const name of required) {
    if (!process.env[name]) throw new Error(`Falta la variable temporal ${name}.`);
}

const backend = process.env.BARMASTER_QZ_BACKEND.replace(/\/+$/, '');
const stationId = process.env.BARMASTER_QZ_STATION;
const headers = {
    Authorization: `Bearer ${process.env.BARMASTER_QZ_TOKEN}`,
    'X-Tenant-ID': process.env.BARMASTER_QZ_TENANT,
};

qz.security.setCertificatePromise((resolve, reject) => {
    fetch(`${backend}/api/qz/certificate`, { cache: 'no-store' })
        .then(async (response) => {
            if (!response.ok) throw new Error(`certificate HTTP ${response.status}`);
            return response.text();
        })
        .then(resolve, reject);
});
qz.security.setSignatureAlgorithm('SHA512');
qz.security.setSignaturePromise((request) => async (resolve, reject) => {
    try {
        const response = await fetch(`${backend}/api/qz/sign`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json', 'X-Printing-Station-ID': stationId },
            body: JSON.stringify({ request, stationId }),
        });
        if (!response.ok) throw new Error(`sign HTTP ${response.status}: ${await response.text()}`);
        resolve(await response.text());
    } catch (error) {
        reject(error);
    }
});

try {
    await qz.websocket.connect({ retries: 2, delay: 1 });
    const [version, printers] = await Promise.all([qz.api.getVersion(), qz.printers.find()]);
    process.stdout.write(`${JSON.stringify({ connected: true, version, printers }, null, 2)}\n`);
} finally {
    if (qz.websocket.isActive()) await qz.websocket.disconnect();
}
// qz-tray conserva temporizadores de reconexión en Node; esta herramienta CLI debe terminar al completar la prueba.
process.exit(0);
