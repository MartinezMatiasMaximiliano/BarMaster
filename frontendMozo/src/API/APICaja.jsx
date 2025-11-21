import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BASE_URL}Caja/`;

export async function ObtenerCajaActiva() {
    try {
        const response = await axios.get(`${BASE_URL}actual`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener caja activa:', error);
        throw error;
    }
}

export async function AbrirCaja(datos) {
    try {
        const response = await axios.post(`${BASE_URL}abrir`, datos);
        return response.data;
    } catch (error) {
        console.error('Error al abrir la caja:', error);
        throw error;
    }
}

export async function CerrarCaja(idCaja, datos) {
    try {
        const url = idCaja ? `${BASE_URL}${idCaja}/cerrar` : `${BASE_URL}cerrar`;
        const response = await axios.post(url, datos);
        return response.data;
    } catch (error) {
        console.error('Error al cerrar la caja:', error);
        throw error;
    }
}

export async function ObtenerHistorialCaja(params = {}) {
    try {
        const response = await axios.get(`${BASE_URL}historial`, { params });
        return response.data;
    } catch (error) {
        console.error('Error al obtener el historial de caja:', error);
        throw error;
    }
}

