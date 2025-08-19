import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Productos/"

export async function BuscarTodosLosProductos() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}