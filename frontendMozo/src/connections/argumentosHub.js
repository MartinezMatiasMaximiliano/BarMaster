export function normalizarArgumentosHub(metodo, argumentos) {
    const indiceMesa = { RecargarTicket: 0, MesaCerrada: 0, GuardarCarrito: 1 }[metodo];
    if (indiceMesa === undefined) return argumentos;
    const valor = argumentos[indiceMesa];
    const numero = typeof valor === 'number' || (typeof valor === 'string' && valor.trim() !== '') ? Number(valor) : NaN;
    if (!Number.isInteger(numero) || numero < -2147483648 || numero > 2147483647)
        throw new Error(`Número de mesa inválido para ${metodo}.`);
    return argumentos.map((arg, index) => index === indiceMesa ? numero : arg);
}
