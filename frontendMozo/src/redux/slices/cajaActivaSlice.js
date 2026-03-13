import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: null, // null = no hay caja activa, objeto = caja activa con sus datos
}

export const cajaActivaSlice = createSlice({
    name: 'cajaActiva',
    initialState,
    reducers: {
        setCajaActiva: (state, action) => {
            state.value = action.payload // objeto caja o null
        },
    },
})

// Action creators are generated for each case reducer function
export const { setCajaActiva } = cajaActivaSlice.actions

export default cajaActivaSlice.reducer

