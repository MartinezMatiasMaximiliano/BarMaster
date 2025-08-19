import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: [],
}

export const notificacionesSlice = createSlice({
    name: 'notificaciones',
    initialState,
    reducers: {
        agregar: (state, action) => {
            state.value.push(action.payload);
        },
        eliminar: (state, action) => {
            state.value = state.value.filter(notificacion => notificacion.fecha !== action.payload);
        }
    },
})

// Action creators are generated for each case reducer function
export const { agregar, eliminar } = notificacionesSlice.actions

export default notificacionesSlice.reducer