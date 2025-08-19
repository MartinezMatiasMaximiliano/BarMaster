import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL

export async function GetTicketMesa(numeroMesa) {
    try {
        const response = await axios.get(BASE_URL + 'Ticket/' + String(numeroMesa));
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
