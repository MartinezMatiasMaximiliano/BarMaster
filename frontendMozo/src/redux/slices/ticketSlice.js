import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: [],
}

export const ticketSlice = createSlice({
    name: 'ticket',
    initialState,
    reducers: {
        agregar: (state, action) => {
            state.value.push(action.payload);
        },
        eliminar: (state, action) => {
            // action.payload es un array de IDs de productos
            // Eliminar el ticket que contiene exactamente esos IDs
            state.value = state.value.filter(ticket => {
                // Comparar si el ticket tiene los mismos IDs que el payload
                if (ticket.length !== action.payload.length) {
                    return true; // Mantener el ticket si no tiene la misma longitud
                }
                // Comparar arrays de IDs (ordenados para comparación)
                const ticketSorted = [...ticket].sort((a, b) => a - b);
                const payloadSorted = [...action.payload].sort((a, b) => a - b);
                return JSON.stringify(ticketSorted) !== JSON.stringify(payloadSorted);
            });
        }
    },
})

// Action creators are generated for each case reducer function
export const { agregar, eliminar } = ticketSlice.actions

export default ticketSlice.reducer