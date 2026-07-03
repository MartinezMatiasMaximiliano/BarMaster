export const periodosPanelSucursales = [
    {
        label: 'Hoy',
        dias: 1,
        titulo: 'últimas 24 horas',
        fraseEn: 'en las últimas 24 horas',
        fraseDe: 'de las últimas 24 horas'
    },
    {
        label: '7 días',
        dias: 7,
        titulo: 'últimos 7 días',
        fraseEn: 'en los últimos 7 días',
        fraseDe: 'de los últimos 7 días'
    },
    {
        label: '30 días',
        dias: 30,
        titulo: 'últimos 30 días',
        fraseEn: 'en los últimos 30 días',
        fraseDe: 'de los últimos 30 días'
    }
];

export const obtenerPeriodoPanel = (dias) =>
    periodosPanelSucursales.find(periodo => periodo.dias === dias) ?? periodosPanelSucursales[0];

export const calcularRangoPanel = (dias) => {
    const hasta = new Date();
    const desde = new Date();
<<<<<<< Updated upstream
    desde.setDate(hasta.getDate() - (dias - 1));
    desde.setHours(0, 0, 0, 0);
    hasta.setHours(23, 59, 59, 999);

    return {
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
        desdeLabel: toDateInputValue(desde),
        hastaLabel: toDateInputValue(hasta)
=======
    desde.setTime(hasta.getTime() - (dias * 24 * 60 * 60 * 1000));

    return {
        desde: desde.toISOString(),
        hasta: hasta.toISOString()
>>>>>>> Stashed changes
    };
};
