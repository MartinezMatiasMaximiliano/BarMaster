import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: false, // false por defecto (no hay caja activa)
}

export const cajaActivaSlice = createSlice({
    name: 'cajaActiva',
    initialState,
    reducers: {
        setCajaActiva: (state, action) => {
            state.value = action.payload // true o false
        },
    },
})

// Action creators are generated for each case reducer function
export const { setCajaActiva } = cajaActivaSlice.actions

export default cajaActivaSlice.reducer

