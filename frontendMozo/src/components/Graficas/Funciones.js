export function contarMesas(arr) {
    const conteo = {};
    arr.forEach(item => {
        if (item.mesa !== undefined) {
            conteo[item.mesa] = (conteo[item.mesa] || 0) + 1;
        }
    });
    return Object.entries(conteo).map(([mesa, cantidad], index) => ({
        id: Number(mesa),
        value: cantidad,
        label: `Mesa ${mesa}`
    }));
}

export function contarPedidosPorDia(pedidos) {
    const cantidadPorDia = [0, 0, 0, 0, 0, 0, 0];
    pedidos.forEach(pedido => {
        const fechaObjeto = new Date(pedido.fecha);
        const diaSemana = fechaObjeto.getDay();
        cantidadPorDia[diaSemana]++;
    });
    return cantidadPorDia;
}

export function calcularGananciasPorFecha(pedidos) {
    const gananciasPorFecha = {};

    pedidos.forEach(pedido => {
        // Normalizamos la fecha al formato YYYY-MM-DD
        const fecha = new Date(pedido.fecha).toISOString().split("T")[0];
        const precio = Number(pedido.precio) || 0;

        gananciasPorFecha[fecha] = (gananciasPorFecha[fecha] || 0) + precio;
    });

    // Convertimos a un array ordenado por fecha (para graficar)
    return Object.entries(gananciasPorFecha)
        .sort(([fechaA], [fechaB]) => new Date(fechaA) - new Date(fechaB))
        .map(([fecha, total]) => ({ fecha, total }));
}

export function contarProductos(arr) {
    const conteo = {};
    arr.forEach(item => {
        conteo[item.nombre] = (conteo[item.nombre] || 0) + 1;
    });
    return Object.entries(conteo).map(([nombre, cantidad], index) => ({
        id: index,
        value: cantidad,
        label: nombre
    }));
}

export const mesas = 
    [
        {
            "w": 1,
            "h": 1,
            "x": 4,
            "y": 9,
            "i": "2",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 3,
            "y": 6,
            "i": "6",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 5,
            "y": 6,
            "i": "4",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 4,
            "y": 2,
            "i": "8",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 8,
            "y": 5,
            "i": "12",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 5,
            "y": 4,
            "i": "15",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 2,
            "y": 1,
            "i": "17",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 4,
            "y": 1,
            "i": "22",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 2,
            "y": 0,
            "i": "1",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 4,
            "y": 0,
            "i": "3",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 10,
            "y": 3,
            "i": "5",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 10,
            "y": 7,
            "i": "10",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 3,
            "y": 11,
            "i": "11",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 4,
            "y": 11,
            "i": "13",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 3,
            "y": 4,
            "i": "30",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 0,
            "y": 0,
            "i": "31",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 3,
            "y": 5,
            "i": "32",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 0,
            "y": 1,
            "i": "33",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 3,
            "x": 0,
            "y": 4,
            "i": "34",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 5,
            "y": 5,
            "i": "35",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 3,
            "x": 1,
            "y": 4,
            "i": "36",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 8,
            "y": 7,
            "i": "37",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 8,
            "y": 6,
            "i": "38",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 3,
            "y": 9,
            "i": "39",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 8,
            "y": 3,
            "i": "40",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 2,
            "y": 2,
            "i": "50",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 10,
            "y": 5,
            "i": "60",
            "moved": false,
            "static": false
        },
        {
            "w": 1,
            "h": 1,
            "x": 10,
            "y": 6,
            "i": "70",
            "moved": false,
            "static": false
        }
    ]

export const calcularGananciasPorHora = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    // Obtener todas las horas con ventas
    const horas = data
        .map((item) => new Date(item.fecha).getHours())
        .filter((h) => !isNaN(h));

    const minHora = Math.min(...horas);
    const maxHora = Math.max(...horas);

    // Inicializar totales de cada hora
    const totalesPorHora = {};
    for (let h = minHora; h <= maxHora; h++) {
        totalesPorHora[h] = 0;
    }

    // Sumar las ventas por hora
    data.forEach((item) => {
        if (!item.fecha || !item.precio) return;
        const hora = new Date(item.fecha).getHours();
        if (totalesPorHora[hora] !== undefined) {
            totalesPorHora[hora] += item.precio;
        }
    });

    console.log("TOTALESPORHORA: ", totalesPorHora);

    // Convertir a array para la gráfica
    return Object.entries(totalesPorHora).map(([hora, total]) => {
        const h = Number(hora);
        const siguiente = (h + 1) % 24;

        return {
            hora: `${h.toString().padStart(2, "0")}-${siguiente
                .toString()
                .padStart(2, "0")} hs`,
            total,
        };
    });
};



export function formatearFecha(fechaStr) {
    if (typeof fechaStr !== "string") return "";

    const [dia, mes, anio] = fechaStr.split("-").map(Number);
    const fecha = new Date(dia, mes - 1, anio); // mes - 1 porque Date usa meses base 0

    const opciones = { day: "numeric", month: "long", year: "numeric" };
    const fechaFormateada = fecha.toLocaleDateString("es-ES", opciones);

    // Capitaliza la primera letra
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

export function calcularCrecimientoMensual(data) {
    if (!data || !Array.isArray(data)) return [];

    // 1️⃣ Agrupar por mes
    const totalesPorMes = {};

    data.forEach((item) => {
        if (!item.fecha || !item.precio) return;

        const fecha = new Date(item.fecha);
        const anio = fecha.getUTCFullYear();
        const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, "0"); // 1-12 => 01-12

        const key = `${anio}-${mes}`; // ej: "2025-03"
        totalesPorMes[key] = (totalesPorMes[key] || 0) + item.precio;
    });

    // 2️⃣ Ordenar meses cronológicamente
    const mesesOrdenados = Object.keys(totalesPorMes).sort();

    // 3️⃣ Calcular total acumulado
    let acumulado = 0;
    const resultado = mesesOrdenados.map((mes) => {
        acumulado += totalesPorMes[mes];
        return { mes, total: acumulado };
    });

    return resultado;
};
