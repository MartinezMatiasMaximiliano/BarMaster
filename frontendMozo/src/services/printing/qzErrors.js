const messages = {
    PRINTER_NOT_CONFIGURED: 'No hay una impresora configurada para esta operación.',
    PRINTER_NOT_FOUND: 'La impresora configurada no está disponible en Windows.',
    QZ_RATE_LIMITED: 'Se realizaron demasiadas solicitudes de impresión. Esperá un momento.',
    STATION_NOT_AUTHORIZED: 'Esta estación no está habilitada para imprimir.',
    PRETICKET_REQUIRES_RAW: 'La impresora de preticket debe configurarse con formato Raw.',
    NO_PRINTABLE_PRODUCTS: 'No hay productos pendientes para imprimir.',
};

export function normalizeQzError(error) {
    const backendCode = error?.response?.data?.error?.code;
    const code = backendCode || error?.message || 'QZ_UNAVAILABLE';
    return {
        code,
        message: messages[code]
            || 'No fue posible conectar con QZ Tray. Verificá que esté abierto, HTTPS y el permiso de red local del navegador.',
        technicalMessage: error?.message || String(error),
    };
}
