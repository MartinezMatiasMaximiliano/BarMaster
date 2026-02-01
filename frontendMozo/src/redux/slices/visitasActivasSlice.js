import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: [], // Array de visitas activas
    contador: 0,
}

export const visitasActivasSlice = createSlice({
    name: 'visitasActivas',
    initialState,
    reducers: {
        // crear - Recibe array de visitas del backend
        crear: (state, action) => {
            // Asegurar que cada producto tenga estadoPreparacion
            state.value = action.payload.map(visita => ({
                ...visita,
                productos: (visita.productos || []).map(p => ({
                    ...p,
                    estadoPreparacion: p.estadoPreparacion ?? 0
                }))
            }));
        },

        // agregarVisita - Agrega una nueva visita cuando se abre una mesa
        agregarVisita: (state, action) => {
            const visita = {
                ...action.payload,
                productos: (action.payload.productos || []).map(p => ({
                    ...p,
                    estadoPreparacion: p.estadoPreparacion ?? 0
                }))
            };
            state.value.push(visita);
        },

        // agregarProductos - Agrega productos a una visita existente
        agregarProductos: (state, action) => {
            const { productos, numeroMesa } = action.payload;
            const visita = state.value.find(v => v.mesa?.numero === numeroMesa);
            if (visita) {
                if (!visita.productos) {
                    visita.productos = [];
                }
                // Agregar estadoPreparacion local para el KDS (0: pendiente, 1: en preparación, 2: listo)
                const productosConEstado = productos.map(p => ({
                    ...p,
                    estadoPreparacion: p.estadoPreparacion ?? 0
                }));
                visita.productos.push(...productosConEstado);
            }
        },

        // cambiarEstadoPagadoProductos - Marca productos como pagados
        cambiarEstadoPagadoProductos: (state, action) => {
            const { idsProductos, pagado } = action.payload;
            state.value.forEach(visita => {
                visita.productos?.forEach(producto => {
                    if (idsProductos.includes(producto.id)) {
                        producto.estadoPagado = pagado;
                    }
                });
            });
        },

        // cambiarEstadoPagadoPorMesa - Marca todos los productos de una mesa como pagados
        cambiarEstadoPagadoPorMesa: (state, action) => {
            const { numeroMesa, pagado } = action.payload;
            const visita = state.value.find(v => v.mesa?.numero === numeroMesa);
            if (visita && visita.productos) {
                visita.productos.forEach(producto => {
                    producto.estadoPagado = pagado;
                });
            }
        },

        // eliminarProductos - Elimina productos de una visita
        eliminarProductos: (state, action) => {
            const { numeroMesa, idsProductos } = action.payload;
            const visita = state.value.find(v => v.mesa?.numero === numeroMesa);
            if (visita && visita.productos) {
                visita.productos = visita.productos.filter(
                    p => !idsProductos.includes(p.id)
                );
            }
        },

        // eliminarPorMesa - Elimina/cierra una visita completa
        eliminarPorMesa: (state, action) => {
            state.value = state.value.filter(v => v.idMesa !== action.payload);
        },

        // cambiarEstadoPreparacion - Cambia el estado de preparación local para el KDS
        cambiarEstadoPreparacion: (state, action) => {
            const { idsProductos, estadoNuevo } = action.payload;
            state.value.forEach(visita => {
                visita.productos?.forEach(producto => {
                    if (idsProductos.includes(producto.id)) {
                        producto.estadoPreparacion = estadoNuevo;
                    }
                });
            });
        },
    },
})

// Action creators are generated for each case reducer function
export const { 
    crear, 
    agregarProductos, 
    agregarVisita, 
    eliminarPorMesa, 
    eliminarProductos, 
    cambiarEstadoPagadoProductos,
    cambiarEstadoPagadoPorMesa,
    cambiarEstadoPreparacion 
} = visitasActivasSlice.actions

export default visitasActivasSlice.reducer
