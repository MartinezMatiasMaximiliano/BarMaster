import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BASE_URL}Caja/`;

// ============================================
// DATOS DE PRUEBA - TEMPORAL (hasta que esté lista la API)
// ============================================

const datosPruebaCajaActiva = {
    id: 100, // ID único para la caja activa (diferente a los del historial)
    fechaApertura: '2025-01-15',
    horaApertura: '08:00',
    fecha: '2025-01-15',
    montoInicial: 50000,
    montoEsperado: 125000,
    totalEsperado: 125000,
    responsable: 'Juan Pérez',
    usuario: 'Juan Pérez',
    estado: 'abierta'
};

const datosPruebaHistorial = [
    {
        id: 5,
        fechaApertura: '2025-01-14',
        horaApertura: '08:00',
        fechaCierre: '2025-01-14',
        horaCierre: '22:30',
        montoInicial: 50000,
        montoFinal: 180000,
        montoEsperado: 175000,
        diferencia: 5000,
        observaciones: 'Todo correcto',
        responsable: 'María González',
        estado: 'cerrada'
    },
    {
        id: 4,
        fechaApertura: '2025-01-13',
        horaApertura: '08:00',
        fechaCierre: '2025-01-13',
        horaCierre: '22:15',
        montoInicial: 50000,
        montoFinal: 165000,
        montoEsperado: 160000,
        diferencia: 5000,
        observaciones: '',
        responsable: 'Carlos Rodríguez',
        estado: 'cerrada'
    },
    {
        id: 3,
        fechaApertura: '2025-01-12',
        horaApertura: '08:00',
        fechaCierre: '2025-01-12',
        horaCierre: '22:45',
        montoInicial: 50000,
        montoFinal: 195000,
        montoEsperado: 190000,
        diferencia: 5000,
        observaciones: 'Día muy movido',
        responsable: 'Ana Martínez',
        estado: 'cerrada'
    },
    {
        id: 2,
        fechaApertura: '2025-01-11',
        horaApertura: '08:00',
        fechaCierre: '2025-01-11',
        horaCierre: '22:00',
        montoInicial: 50000,
        montoFinal: 140000,
        montoEsperado: 145000,
        diferencia: -5000,
        observaciones: 'Faltante menor',
        responsable: 'Luis Fernández',
        estado: 'cerrada'
    },
    {
        id: 1,
        fechaApertura: '2025-01-10',
        horaApertura: '08:00',
        fechaCierre: '2025-01-10',
        horaCierre: '21:30',
        montoInicial: 50000,
        montoFinal: 155000,
        montoEsperado: 150000,
        diferencia: 5000,
        observaciones: '',
        responsable: 'Juan Pérez',
        estado: 'cerrada'
    }
];

// Movimientos por ID de caja
const datosPruebaMovimientosPorCaja = {
    // Caja activa (id: 100) - 2025-01-15
    100: [
        { id: 1, fecha: '2025-01-15', hora: '08:00', tipo: 'apertura', descripcion: 'Apertura de caja', monto: 50000, saldo: 50000 },
        { id: 2, fecha: '2025-01-15', hora: '09:15', tipo: 'venta', descripcion: 'Mesa 5 - Pedido #123', monto: 12500, saldo: 62500, mesa: 5, pedidoId: 123 },
        { id: 3, fecha: '2025-01-15', hora: '10:30', tipo: 'venta', descripcion: 'Mesa 12 - Pedido #124', monto: 18900, saldo: 81400, mesa: 12, pedidoId: 124 },
        { id: 4, fecha: '2025-01-15', hora: '11:45', tipo: 'venta', descripcion: 'Delivery - Pedido #125', monto: 15200, saldo: 96600, mesa: null, pedidoId: 125 },
        { id: 5, fecha: '2025-01-15', hora: '13:20', tipo: 'venta', descripcion: 'Mesa 3 - Pedido #126', monto: 22100, saldo: 118700, mesa: 3, pedidoId: 126 },
        { id: 6, fecha: '2025-01-15', hora: '14:10', tipo: 'venta', descripcion: 'Mesa 8 - Pedido #127', monto: 16300, saldo: 135000, mesa: 8, pedidoId: 127 },
        { id: 7, fecha: '2025-01-15', hora: '15:30', tipo: 'venta', descripcion: 'Take Away - Pedido #128', monto: 8500, saldo: 143500, mesa: null, pedidoId: 128 },
        { id: 8, fecha: '2025-01-15', hora: '16:45', tipo: 'venta', descripcion: 'Mesa 15 - Pedido #129', monto: 19500, saldo: 163000, mesa: 15, pedidoId: 129 },
        { id: 9, fecha: '2025-01-15', hora: '18:00', tipo: 'venta', descripcion: 'Mesa 7 - Pedido #130', monto: 14200, saldo: 177200, mesa: 7, pedidoId: 130 },
        { id: 10, fecha: '2025-01-15', hora: '19:15', tipo: 'venta', descripcion: 'Mesa 2 - Pedido #131', monto: 27800, saldo: 205000, mesa: 2, pedidoId: 131 },
        { id: 11, fecha: '2025-01-15', hora: '20:30', tipo: 'venta', descripcion: 'Delivery - Pedido #132', monto: 18900, saldo: 223900, mesa: null, pedidoId: 132 },
        { id: 12, fecha: '2025-01-15', hora: '21:45', tipo: 'venta', descripcion: 'Mesa 10 - Pedido #133', monto: 16100, saldo: 240000, mesa: 10, pedidoId: 133 }
    ],
    // Caja historial id: 5 - 2025-01-14
    5: [
        { id: 1, fecha: '2025-01-14', hora: '08:00', tipo: 'apertura', descripcion: 'Apertura de caja', monto: 50000, saldo: 50000 },
        { id: 2, fecha: '2025-01-14', hora: '09:30', tipo: 'venta', descripcion: 'Mesa 4 - Pedido #101', monto: 18200, saldo: 68200, mesa: 4, pedidoId: 101 },
        { id: 3, fecha: '2025-01-14', hora: '10:45', tipo: 'venta', descripcion: 'Mesa 9 - Pedido #102', monto: 15400, saldo: 83600, mesa: 9, pedidoId: 102 },
        { id: 4, fecha: '2025-01-14', hora: '12:00', tipo: 'venta', descripcion: 'Delivery - Pedido #103', monto: 21300, saldo: 104900, mesa: null, pedidoId: 103 },
        { id: 5, fecha: '2025-01-14', hora: '13:15', tipo: 'venta', descripcion: 'Mesa 6 - Pedido #104', monto: 19700, saldo: 124600, mesa: 6, pedidoId: 104 },
        { id: 6, fecha: '2025-01-14', hora: '14:30', tipo: 'venta', descripcion: 'Mesa 11 - Pedido #105', monto: 16800, saldo: 141400, mesa: 11, pedidoId: 105 },
        { id: 7, fecha: '2025-01-14', hora: '16:00', tipo: 'venta', descripcion: 'Take Away - Pedido #106', monto: 9200, saldo: 150600, mesa: null, pedidoId: 106 },
        { id: 8, fecha: '2025-01-14', hora: '17:20', tipo: 'venta', descripcion: 'Mesa 13 - Pedido #107', monto: 24300, saldo: 174900, mesa: 13, pedidoId: 107 },
        { id: 9, fecha: '2025-01-14', hora: '20:00', tipo: 'venta', descripcion: 'Mesa 1 - Pedido #108', monto: 5100, saldo: 180000, mesa: 1, pedidoId: 108 }
    ],
    // Caja historial id: 4 - 2025-01-13
    4: [
        { id: 1, fecha: '2025-01-13', hora: '08:00', tipo: 'apertura', descripcion: 'Apertura de caja', monto: 50000, saldo: 50000 },
        { id: 2, fecha: '2025-01-13', hora: '09:00', tipo: 'venta', descripcion: 'Mesa 2 - Pedido #91', monto: 11200, saldo: 61200, mesa: 2, pedidoId: 91 },
        { id: 3, fecha: '2025-01-13', hora: '10:20', tipo: 'venta', descripcion: 'Mesa 5 - Pedido #92', monto: 18900, saldo: 80100, mesa: 5, pedidoId: 92 },
        { id: 4, fecha: '2025-01-13', hora: '11:40', tipo: 'venta', descripcion: 'Delivery - Pedido #93', monto: 14500, saldo: 94600, mesa: null, pedidoId: 93 },
        { id: 5, fecha: '2025-01-13', hora: '13:00', tipo: 'venta', descripcion: 'Mesa 8 - Pedido #94', monto: 20300, saldo: 114900, mesa: 8, pedidoId: 94 },
        { id: 6, fecha: '2025-01-13', hora: '14:30', tipo: 'venta', descripcion: 'Mesa 12 - Pedido #95', monto: 17600, saldo: 132500, mesa: 12, pedidoId: 95 },
        { id: 7, fecha: '2025-01-13', hora: '16:00', tipo: 'venta', descripcion: 'Take Away - Pedido #96', monto: 7800, saldo: 140300, mesa: null, pedidoId: 96 },
        { id: 8, fecha: '2025-01-13', hora: '18:30', tipo: 'venta', descripcion: 'Mesa 14 - Pedido #97', monto: 24700, saldo: 165000, mesa: 14, pedidoId: 97 }
    ],
    // Caja historial id: 3 - 2025-01-12
    3: [
        { id: 1, fecha: '2025-01-12', hora: '08:00', tipo: 'apertura', descripcion: 'Apertura de caja', monto: 50000, saldo: 50000 },
        { id: 2, fecha: '2025-01-12', hora: '09:15', tipo: 'venta', descripcion: 'Mesa 3 - Pedido #81', monto: 13400, saldo: 63400, mesa: 3, pedidoId: 81 },
        { id: 3, fecha: '2025-01-12', hora: '10:30', tipo: 'venta', descripcion: 'Mesa 7 - Pedido #82', monto: 20100, saldo: 83500, mesa: 7, pedidoId: 82 },
        { id: 4, fecha: '2025-01-12', hora: '11:50', tipo: 'venta', descripcion: 'Delivery - Pedido #83', monto: 16700, saldo: 100200, mesa: null, pedidoId: 83 },
        { id: 5, fecha: '2025-01-12', hora: '13:10', tipo: 'venta', descripcion: 'Mesa 9 - Pedido #84', monto: 21900, saldo: 122100, mesa: 9, pedidoId: 84 },
        { id: 6, fecha: '2025-01-12', hora: '14:45', tipo: 'venta', descripcion: 'Mesa 11 - Pedido #85', monto: 18500, saldo: 140600, mesa: 11, pedidoId: 85 },
        { id: 7, fecha: '2025-01-12', hora: '16:20', tipo: 'venta', descripcion: 'Take Away - Pedido #86', monto: 8900, saldo: 149500, mesa: null, pedidoId: 86 },
        { id: 8, fecha: '2025-01-12', hora: '17:40', tipo: 'venta', descripcion: 'Mesa 15 - Pedido #87', monto: 25600, saldo: 175100, mesa: 15, pedidoId: 87 },
        { id: 9, fecha: '2025-01-12', hora: '19:00', tipo: 'venta', descripcion: 'Mesa 6 - Pedido #88', monto: 14900, saldo: 190000, mesa: 6, pedidoId: 88 }
    ],
    // Caja historial id: 2 - 2025-01-11
    2: [
        { id: 1, fecha: '2025-01-11', hora: '08:00', tipo: 'apertura', descripcion: 'Apertura de caja', monto: 50000, saldo: 50000 },
        { id: 2, fecha: '2025-01-11', hora: '09:30', tipo: 'venta', descripcion: 'Mesa 1 - Pedido #71', monto: 9800, saldo: 59800, mesa: 1, pedidoId: 71 },
        { id: 3, fecha: '2025-01-11', hora: '10:45', tipo: 'venta', descripcion: 'Mesa 4 - Pedido #72', monto: 17200, saldo: 77000, mesa: 4, pedidoId: 72 },
        { id: 4, fecha: '2025-01-11', hora: '12:00', tipo: 'venta', descripcion: 'Delivery - Pedido #73', monto: 13800, saldo: 90800, mesa: null, pedidoId: 73 },
        { id: 5, fecha: '2025-01-11', hora: '13:30', tipo: 'venta', descripcion: 'Mesa 10 - Pedido #74', monto: 19400, saldo: 110200, mesa: 10, pedidoId: 74 },
        { id: 6, fecha: '2025-01-11', hora: '15:00', tipo: 'venta', descripcion: 'Mesa 13 - Pedido #75', monto: 16100, saldo: 126300, mesa: 13, pedidoId: 75 },
        { id: 7, fecha: '2025-01-11', hora: '16:30', tipo: 'venta', descripcion: 'Take Away - Pedido #76', monto: 7200, saldo: 133500, mesa: null, pedidoId: 76 },
        { id: 8, fecha: '2025-01-11', hora: '18:00', tipo: 'venta', descripcion: 'Mesa 8 - Pedido #77', monto: 6500, saldo: 140000, mesa: 8, pedidoId: 77 }
    ],
    // Caja historial id: 1 - 2025-01-10
    1: [
        { id: 1, fecha: '2025-01-10', hora: '08:00', tipo: 'apertura', descripcion: 'Apertura de caja', monto: 50000, saldo: 50000 },
        { id: 2, fecha: '2025-01-10', hora: '09:00', tipo: 'venta', descripcion: 'Mesa 2 - Pedido #61', monto: 12300, saldo: 62300, mesa: 2, pedidoId: 61 },
        { id: 3, fecha: '2025-01-10', hora: '10:15', tipo: 'venta', descripcion: 'Mesa 5 - Pedido #62', monto: 17800, saldo: 80100, mesa: 5, pedidoId: 62 },
        { id: 4, fecha: '2025-01-10', hora: '11:30', tipo: 'venta', descripcion: 'Delivery - Pedido #63', monto: 15200, saldo: 95300, mesa: null, pedidoId: 63 },
        { id: 5, fecha: '2025-01-10', hora: '12:45', tipo: 'venta', descripcion: 'Mesa 9 - Pedido #64', monto: 20700, saldo: 116000, mesa: 9, pedidoId: 64 },
        { id: 6, fecha: '2025-01-10', hora: '14:00', tipo: 'venta', descripcion: 'Mesa 12 - Pedido #65', monto: 17300, saldo: 133300, mesa: 12, pedidoId: 65 },
        { id: 7, fecha: '2025-01-10', hora: '15:30', tipo: 'venta', descripcion: 'Take Away - Pedido #66', monto: 8200, saldo: 141500, mesa: null, pedidoId: 66 },
        { id: 8, fecha: '2025-01-10', hora: '17:00', tipo: 'venta', descripcion: 'Mesa 14 - Pedido #67', monto: 13500, saldo: 155000, mesa: 14, pedidoId: 67 }
    ]
};

// ============================================
// FUNCIONES CON DATOS DE PRUEBA
// ============================================

export async function ObtenerCajaActiva() {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const response = await axios.get(`${BASE_URL}actual`);
    //     return response.data;
    // } catch (error) {
    //     console.error('Error al obtener caja activa:', error);
    //     throw error;
    // }
    
    // DATOS DE PRUEBA
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simular que hay una caja abierta (cambiar a null para simular caja cerrada)
            resolve(datosPruebaCajaActiva);
            // resolve(null); // Descomentar para simular caja cerrada
        }, 300);
    });
}

export async function AbrirCaja(datos) {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const response = await axios.post(`${BASE_URL}abrir`, datos);
    //     return response.data;
    // } catch (error) {
    //     console.error('Error al abrir la caja:', error);
    //     throw error;
    // }
    
    // DATOS DE PRUEBA
    return new Promise((resolve) => {
        setTimeout(() => {
            const nuevaCaja = {
                id: 100, // ID fijo para la caja activa de prueba
                fechaApertura: datos.fechaApertura,
                horaApertura: datos.horaApertura,
                fecha: datos.fechaApertura,
                montoInicial: datos.montoInicial,
                montoEsperado: datos.montoInicial,
                totalEsperado: datos.montoInicial,
                responsable: 'Usuario Actual',
                usuario: 'Usuario Actual',
                estado: 'abierta'
            };
            resolve(nuevaCaja);
        }, 500);
    });
}

export async function CerrarCaja(idCaja, datos) {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const url = idCaja ? `${BASE_URL}${idCaja}/cerrar` : `${BASE_URL}cerrar`;
    //     const response = await axios.post(url, datos);
    //     return response.data;
    // } catch (error) {
    //     console.error('Error al cerrar la caja:', error);
    //     throw error;
    // }
    
    // DATOS DE PRUEBA
    return new Promise((resolve) => {
        setTimeout(() => {
            const resultado = {
                id: idCaja,
                mensaje: 'Caja cerrada exitosamente',
                fechaCierre: datos.fechaCierre,
                horaCierre: datos.horaCierre,
                montoFinal: datos.montoFinal,
                observaciones: datos.observaciones
            };
            resolve(resultado);
        }, 500);
    });
}

export async function ObtenerHistorialCaja(params = {}) {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const response = await axios.get(`${BASE_URL}historial`, { params });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error al obtener el historial de caja:', error);
    //     throw error;
    // }
    
    // DATOS DE PRUEBA
    return new Promise((resolve) => {
        setTimeout(() => {
            const limite = params.limite || 10;
            const historialLimitado = datosPruebaHistorial.slice(0, limite);
            resolve(historialLimitado);
        }, 300);
    });
}

export async function ObtenerMovimientosCaja(idCaja) {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const response = await axios.get(`${BASE_URL}${idCaja}/movimientos`);
    //     return response.data;
    // } catch (error) {
    //     console.error('Error al obtener movimientos de la caja:', error);
    //     throw error;
    // }
    
    // DATOS DE PRUEBA - Retorna movimientos según el ID de la caja
    return new Promise((resolve) => {
        setTimeout(() => {
            const movimientos = datosPruebaMovimientosPorCaja[idCaja] || [];
            resolve(movimientos);
        }, 300);
    });
}

