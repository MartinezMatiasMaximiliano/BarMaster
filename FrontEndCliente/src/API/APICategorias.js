import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Categorias/"


export async function BuscarTodasLasCategorias() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}