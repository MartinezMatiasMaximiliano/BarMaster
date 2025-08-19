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
            state.value = state.value.filter(ticket => {
                return !ticket.some(itemTicket =>
                    action.payload.some(itemPayload =>
                        JSON.stringify(itemTicket) === JSON.stringify(itemPayload)
                    )
                );
            });
        }
    },
})

// Action creators are generated for each case reducer function
export const { agregar, eliminar } = ticketSlice.actions

export default ticketSlice.reducer