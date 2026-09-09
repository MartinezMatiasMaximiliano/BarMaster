const CLAVE_REGISTRO = 'barmaster_impresion_diagnostico';
const MAXIMO_ENTRADAS = 1000;

function leerEntradas() {
    try {
        const entradas = JSON.parse(localStorage.getItem(CLAVE_REGISTRO) || '[]');
        return Array.isArray(entradas) ? entradas : [];
    } catch {
        return [];
    }
}

function normalizarDetalles(detalles) {
    if (detalles instanceof Error) {
        return { error: detalles.message, stack: detalles.stack };
    }
    return detalles || {};
}

export function registrarDiagnosticoImpresion(etapa, detalles = {}) {
    const entrada = {
        timestamp: new Date().toISOString(),
        relojMonotonicMs: Math.round(performance.now()),
        etapa,
        ...normalizarDetalles(detalles),
    };

    try {
        const entradas = leerEntradas();
        entradas.push(entrada);
        localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(entradas.slice(-MAXIMO_ENTRADAS)));
    } catch {
        // El diagnóstico nunca debe interrumpir una impresión.
    }

    console.info(`[IMPRESION ${entrada.timestamp}] ${etapa}`, detalles);
    return entrada;
}

export function limpiarDiagnosticoImpresion() {
    localStorage.removeItem(CLAVE_REGISTRO);
    registrarDiagnosticoImpresion('diagnostico.iniciado');
}

export function descargarDiagnosticoImpresion() {
    const contenido = leerEntradas().map((entrada) => JSON.stringify(entrada)).join('\n');
    const blob = new Blob([contenido], { type: 'application/x-ndjson;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `barmaster-impresion-${new Date().toISOString().replaceAll(':', '-')}.log`;
    enlace.click();
    URL.revokeObjectURL(url);
}
