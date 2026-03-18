import axiosInstance from '../services/axiosInstance';

export async function ObtenerEmpresaConSucursales() {
    const response = await axiosInstance.get('/Empresa');
    return response.data;
}

export async function ObtenerPlanEmpresa() {
    const response = await axiosInstance.get('/Empresa/Plan');
    return response.data;
}

export async function ObtenerDatosEmpresa() {
    const response = await axiosInstance.get('/Empresa');
    return response.data;
}
