import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: {},
}

export const mozoSlice = createSlice({
    name: 'mozo',
    initialState,
    reducers: {
        modificar: (state, action) => {
            state.value = action.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const { modificar } = mozoSlice.actions

export default mozoSlice.reducer