import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: [], // Array de visitas activas
    contador: 0,
}

export const visitasActivasSlice = createSlice({
    name: 'visitasActivas',
    initialState,
    reducers: {
        // cargarVisitasActivas - Carga todas las visitas activas desde el backend (estadoPedido viene de API; estadoPreparacion se deriva para Lista_Items)
        cargarVisitasActivas: (state, action) => {
            const visitas = Array.isArray(action.payload) ? action.payload : [];
            const estadoANumero = (s) => (s === 'Listo' ? 2 : s === 'En Preparación' ? 1 : 0);
            visitas.forEach(visita => {
                // Normalizar id (el backend puede devolver Id en PascalCase)
                visita.id = visita.id || visita.Id;
                (visita.productosConsumidos || []).forEach(p => {
                    const ep = p.estadoPedido ?? p.EstadoPedido ?? 'Pendiente';
                    p.estadoPedido = ep;
                    p.estadoPreparacion = p.estadoPreparacion ?? estadoANumero(ep);
                });
            });
            state.value = visitas;
        },

        // agregarVisita - Agrega una nueva visita cuando se abre una mesa
        agregarVisita: (state, action) => {
            state.value.push(action.payload);
        },


        // cambiarEstadoPagadoProductos - Marca productos como pagados
        cambiarEstadoPagadoProductos: (state, action) => {
            const { idsProductos, pagado } = action.payload;
            state.value.forEach(visita => {
                visita.productosConsumidos?.forEach(producto => {
                    if (idsProductos.includes(producto.id)) {
                        producto.estadoPagado = pagado;
                    }
                });
            });
        },

        // cambiarEstadoPagadoPorMesa - Marca todos los productos de una mesa como pagados
        cambiarEstadoPagadoPorMesa: (state, action) => {
            const { numeroMesa, pagado } = action.payload;
            const visita = state.value.find(v => v.numeroMesa === numeroMesa);
            if (visita && visita.productosConsumidos) {
                visita.productosConsumidos.forEach(producto => {
                    producto.estadoPagado = pagado;
                });
            }
        },

        // eliminarProductos - Elimina productos de una visita (por ID de producto)
        eliminarProductos: (state, action) => {
            const { numeroMesa, idsProductos } = action.payload;
            const visita = state.value.find(v => v.numeroMesa === numeroMesa);
            if (visita && visita.productosConsumidos) {
                visita.productosConsumidos = visita.productosConsumidos.filter(
                    p => !idsProductos.includes(p.id)
                );
            }
        },

        // eliminarPorMesa - Elimina/cierra una visita completa
        eliminarPorMesa: (state, action) => {
            state.value = state.value.filter(v => v.idMesa !== action.payload);
        },

        // cambiarEstadoPreparacion - estadoNuevo: "Pendiente" | "En Preparación" | "Listo" (igual que API/DB)
        cambiarEstadoPreparacion: (state, action) => {
            const { idsProductos, estadoNuevo } = action.payload;
            const estadoANumero = (s) => (s === 'Listo' ? 2 : s === 'En Preparación' ? 1 : 0);
            const num = estadoANumero(estadoNuevo);
            state.value.forEach(visita => {
                visita.productosConsumidos?.forEach(producto => {
                    if (idsProductos.includes(producto.id)) {
                        producto.estadoPedido = estadoNuevo;
                        producto.estadoPreparacion = num; // Lista_Items sigue filtrando por número
                    }
                });
            });
        },

        // actualizarVisita - Actualiza una visita existente con datos nuevos del backend
        actualizarVisita: (state, action) => {
            const visitaActualizada = action.payload;
            const estadoPedidoANumero = (estadoPedido) => {
                if (!estadoPedido) return 0;
                if (estadoPedido === 'Listo') return 2;
                if (estadoPedido === 'En Preparación') return 1;
                return 0;
            };
            const visitaNormalizada = {
                id: visitaActualizada.id || visitaActualizada.Id,
                fechaHora: visitaActualizada.fechaHora || visitaActualizada.FechaHora,
                estado: visitaActualizada.estado || visitaActualizada.Estado,
                idMesa: visitaActualizada.idMesa || visitaActualizada.IdMesa,
                numeroMesa: visitaActualizada.numeroMesa || visitaActualizada.NumeroMesa,
                productosConsumidos: (visitaActualizada.productosConsumidos || visitaActualizada.ProductosConsumidos || []).map(p => {
                    const estadoPedido = p.estadoPedido ?? p.EstadoPedido ?? 'Pendiente';
                    return {
                        id: p.id || p.Id,
                        nombre: p.nombre || p.Nombre,
                        indicaciones: p.indicaciones || p.Indicaciones || '',
                        precio: p.precio || p.Precio || 0,
                        precioDelMomento: p.precioDelMomento || p.Precio || p.precio || 0,
                        estadoPagado: p.estadoPagado !== undefined ? p.estadoPagado : (p.EstadoPagado !== undefined ? p.EstadoPagado : false),
                        estadoPedido,
                        estadoPreparacion: p.estadoPreparacion ?? estadoPedidoANumero(estadoPedido)
                    };
                })
            };

            // Buscar la visita por id o por numeroMesa
            const index = state.value.findIndex(
                v => v.id === visitaNormalizada.id || 
                v.numeroMesa === visitaNormalizada.numeroMesa ||
                (v.mesa?.numero === visitaNormalizada.numeroMesa)
            );

            if (index !== -1) {
                // Mantener la estructura existente (como mesa) pero actualizar con los nuevos datos
                state.value[index] = {
                    ...state.value[index],
                    ...visitaNormalizada,
                    // Preservar el objeto mesa si existe
                    mesa: state.value[index].mesa || (visitaNormalizada.numeroMesa ? {
                        id: visitaNormalizada.idMesa,
                        numero: visitaNormalizada.numeroMesa
                    } : undefined)
                };
            }
        },
    },
})

// Action creators are generated for each case reducer function
export const { 
    cargarVisitasActivas,
    agregarVisita, 
    eliminarPorMesa, 
    eliminarProductos, 
    cambiarEstadoPagadoProductos,
    cambiarEstadoPagadoPorMesa,
    cambiarEstadoPreparacion,
    actualizarVisita
} = visitasActivasSlice.actions

export default visitasActivasSlice.reducer
