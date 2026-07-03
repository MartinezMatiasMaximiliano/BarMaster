export const periodosPanelSucursales = [
    { label: 'Hoy', dias: 1 },
    { label: '7 días', dias: 7 },
    { label: '30 días', dias: 30 }
];

const toDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const calcularRangoPanel = (dias) => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - (dias - 1));
    desde.setHours(0, 0, 0, 0);
    hasta.setHours(23, 59, 59, 999);

    return {
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
        desdeLabel: toDateInputValue(desde),
        hastaLabel: toDateInputValue(hasta)
    };
};
