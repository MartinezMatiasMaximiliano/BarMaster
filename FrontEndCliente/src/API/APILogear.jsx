import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL

export async function VerificarCodigo(codigoMesa) {
    try {
        const response = await axios.get(`${BASE_URL}Mesas/VerificarCodigo?codigo=${codigoMesa}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

