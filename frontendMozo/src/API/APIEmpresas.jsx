import axiosInstance from '../services/axiosInstance';
import { construirError } from './APIError';

export async function ObtenerEmpresaConSucursales() {
    try {
        const response = await axiosInstance.get('/Empresa');
        return response.data;
    } catch (error) {
        console.error('Error al obtener empresa con sucursales:', construirError(error, 'Error al obtener la empresa'));
        throw construirError(error, 'Error al obtener la empresa');
    }
}

export async function ObtenerPlanEmpresa() {
    try {
        const response = await axiosInstance.get('/Empresa/Plan');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el plan de empresa:', construirError(error, 'Error al obtener el plan de empresa'));
        throw construirError(error, 'Error al obtener el plan de empresa');
    }
}

export async function ObtenerDatosEmpresa() {
    try {
        const response = await axiosInstance.get('/Empresa');
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos de empresa:', construirError(error, 'Error al obtener los datos de la empresa'));
        throw construirError(error, 'Error al obtener los datos de la empresa');
    }
}
