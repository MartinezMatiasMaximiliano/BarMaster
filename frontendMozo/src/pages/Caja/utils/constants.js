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

// Función para formatear fecha en el formato: "Sábado 3 de Enero 16:40hs"
export const formatearFechaCompleta = (fecha, hora) => {
    if (!fecha) return '';
    
    const fechaObj = new Date(`${fecha}T${hora || '00:00'}`);
    if (isNaN(fechaObj.getTime())) return fecha;
    
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const diaSemana = diasSemana[fechaObj.getDay()];
    const dia = fechaObj.getDate();
    const mes = meses[fechaObj.getMonth()];
    const horaFormateada = hora || '00:00';
    
    return `${diaSemana} ${dia} de ${mes} ${horaFormateada}hs`;
};

