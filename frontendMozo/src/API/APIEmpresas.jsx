import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + "Empresas/";

// DATOS DE PRUEBA - Simular respuesta de la API
const datosPruebaPlan = {
    idSubscripcion: 12345,
    Plan: "Plan Avanzado",
    fechaInicio: "2024-01-15T00:00:00",
    fechaFin: "2025-01-15T00:00:00",
    modulos: [
        "Monitor de Cocina (KDS)",
        "Gestión de Mesas",
        "Facturación Electrónica",
        "Delivery/Take Away"
    ],
    precio: 15000.00,
    nombreEmpresa: "Restaurante El Buen Sabor",
    numeroSucursal: "001",
    direccion: "Av. Corrientes 1234, CABA"
};

const datosPruebaEmpresa = {
    nombreEmpresa: "Restaurante El Buen Sabor",
    numeroSucursal: "001",
    direccion: "Av. Corrientes 1234, CABA"
};

/**
 * Obtiene la información del plan de suscripción de la empresa actual
 * @returns {Promise<Object>} Datos del plan con estructura:
 * {
 *   idSubscripcion: number,
 *   Plan: string, // "Plan Inicial", "Plan Avanzado", "Plan Pro"
 *   fechaInicio: string,
 *   fechaFin: string,
 *   modulos: string[], // ["Monitor de Cocina (KDS)", "Gestión de Mesas", etc.]
 *   precio: number
 * }
 */
export async function ObtenerPlanEmpresa() {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const response = await axios.get(BASE_URL + "plan");
    //     return response.data;
    // } catch (error) {
    //     console.error("Error al obtener el plan de la empresa:", error);
    //     throw error;
    // }

    // DATOS DE PRUEBA - Retorna datos simulados con latencia
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(datosPruebaPlan);
        }, 300);
    });
}

/**
 * Obtiene la información básica de la empresa
 * @returns {Promise<Object>} Datos de la empresa:
 * {
 *   nombreEmpresa: string,
 *   numeroSucursal: string,
 *   direccion: string
 * }
 */
export async function ObtenerDatosEmpresa() {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const response = await axios.get(BASE_URL + "datos");
    //     return response.data;
    // } catch (error) {
    //     console.error("Error al obtener los datos de la empresa:", error);
    //     throw error;
    // }

    // DATOS DE PRUEBA - Retorna datos simulados con latencia
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(datosPruebaEmpresa);
        }, 200);
    });
}

