import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: [],
}

export const codigoMozoSlice = createSlice({
    name: 'codigoMozo',
    initialState,
    reducers: {
        modificar: (state, action) => {
            state.value = action.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const { modificar } = codigoMozoSlice.actions

export default codigoMozoSlice.reducer