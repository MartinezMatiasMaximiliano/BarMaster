export const prioridadDisponibilidad = { verde: 0, amarilla: 1, roja: 2, desconocida: 3 };

export const estiloEstado = {
    verde: { bgcolor: '#d7f4df', borderColor: '#16833b', color: '#0b4720' },
    amarilla: { bgcolor: '#fff0a8', borderColor: '#d18b00', color: '#694500' },
    roja: { bgcolor: '#ffd9dc', borderColor: '#c62828', color: '#701515' },
    desconocida: { bgcolor: '#eeeeee', borderColor: '#757575', color: '#424242' },
};

export const estadoMesa = mesa => prioridadDisponibilidad[mesa?.estadoDisponibilidad] === undefined
    ? 'desconocida' : mesa.estadoDisponibilidad;

export function agruparYOrdenarMesas(mesas = [], orden = 'disponibilidad', direccion = 'asc') {
    const grupos = mesas.reduce((resultado, mesa) => {
        const id = mesa.plano?.id || 'sin-plano';
        if (!resultado[id]) resultado[id] = { nombre: mesa.plano?.nombre || 'Sin plano', mesas: [] };
        resultado[id].mesas.push(mesa);
        return resultado;
    }, {});
    Object.values(grupos).forEach(grupo => grupo.mesas.sort((a, b) => {
        const valorA = orden === 'personas' ? a.capacidad : prioridadDisponibilidad[estadoMesa(a)];
        const valorB = orden === 'personas' ? b.capacidad : prioridadDisponibilidad[estadoMesa(b)];
        const comparacion = valorA - valorB;
        return (direccion === 'asc' ? comparacion : -comparacion) || a.numero - b.numero;
    }));
    return grupos;
}
