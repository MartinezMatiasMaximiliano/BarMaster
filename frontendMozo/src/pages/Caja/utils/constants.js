export const buildTimestampDefaults = () => {
    const now = new Date();
    const pad = (value) => value.toString().padStart(2, '0');
    return {
        fecha: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        hora: `${pad(now.getHours())}:${pad(now.getMinutes())}`
    };
};

export const initialApertura = () => ({
    ...buildTimestampDefaults(),
    montoInicial: ''
});

export const initialCierre = () => ({
    ...buildTimestampDefaults(),
    montoFinal: '',
    observaciones: ''
});

export const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
});

export const obtenerMensajeError = (err, fallback) =>
    err?.response?.data?.error?.mensaje ||
    err?.response?.data?.mensaje ||
    err?.message ||
    fallback;

