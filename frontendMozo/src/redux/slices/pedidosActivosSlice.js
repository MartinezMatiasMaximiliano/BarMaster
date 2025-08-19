import { createSlice } from '@reduxjs/toolkit'
import { act } from 'react';

const initialState = {
    value: [],
    contador : 0,
}

export const pedidosActivosSlice = createSlice({
    name: 'pedidosActivos',
    initialState,
    reducers: {

        crear: (state, action) => {
            state.value = action.payload;
        },

        agregarPedido: (state, action) => {
            state.value.push(action.payload);
        },

        agregarItems: (state, action) => {

            const { items, numeroMesa } = action.payload;

            // Se agregan los items en el pedido correspondiente

            state.value.find(pedido => pedido.numeroMesa === numeroMesa).items.push(...items);

        },

        cambiarEstadoItems: (state, action) => {
            const { idsItems, estadoNuevo } = action.payload;

            state.value.forEach(pedido => {
                pedido.items.forEach(item => {
                    if (idsItems.includes(item.id)) {
                        item.estado = estadoNuevo;
                    }
                });
            })
        },

        cambiarEstadoItemsPorMesa: (state, action) => {
            const { numeroMesa, estadoNuevo } = action.payload;

            const pedidoIndex = state.value.findIndex(pedido => pedido.numeroMesa === numeroMesa);

            state.value[pedidoIndex].items.forEach(item => {
                item.estado = estadoNuevo;
            });
        },

        eliminarPorMesa: (state, action) => { // Se elimina los items coincidentes
            state.value = state.value.filter(item => item.idMesa !== action.payload);
        },

        eliminarItems: (state, action) => {
            const { numeroMesa, idsItems } = action.payload;

            // Buscar el pedido en state.value

            const pedidoIndex = state.value.findIndex(pedido => pedido.numeroMesa === numeroMesa);

            // Filtrar los items que NO están en la lista de eliminados
            state.value[pedidoIndex].items = state.value[pedidoIndex].items.filter(
                item => !idsItems.includes(item.id)
            );
        },
    },
})

// Action creators are generated for each case reducer function
export const { crear, agregarItems, agregarPedido, eliminarPorMesa, eliminarItems, cambiarEstadoItems, cambiarEstadoItemsPorMesa } = pedidosActivosSlice.actions

export default pedidosActivosSlice.reducer