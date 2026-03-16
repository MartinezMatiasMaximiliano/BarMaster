// import api from '../services/axiosInstance'
// TODO: Descomentar cuando se implementen las llamadas reales a la API

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

const datosPruebaEmpresasConSucursales = [
    {
        "Id": 1,
        "Nombre": "La Cafetería",
        "Emails": ["contacto@lacafeteria.com", "reservas@lacafeteria.com"],
        "Sucursales": [
            {
                "Direccion": "Santiago y 25 de Mayo",
                "Telefono": "381-445-1200",
                "IdEmpresa": 1
            },
            {
                "Direccion": "Chacabuco 136",
                "Telefono": "381-422-8899",
                "IdEmpresa": 1
            },
            {
                "Direccion": "Lavalle y 9 de Julio",
                "Telefono": "381-431-7722",
                "IdEmpresa": 1
            }
        ]
    }
];

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

/**
 * Obtiene todas las empresas con sus sucursales
 * @returns {Promise<Array>} Array de empresas con estructura:
 * [{
 *   Id: number,
 *   Nombre: string,
 *   Emails: string[],
 *   Sucursales: [{
 *     Direccion: string,
 *     Telefono: string,
 *     IdEmpresa: number
 *   }]
 * }]
 */
export async function ObtenerEmpresasConSucursales() {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const response = await axios.get(BASE_URL + "empresas-con-sucursales");
    //     return response.data;
    // } catch (error) {
    //     console.error("Error al obtener las empresas con sucursales:", error);
    //     throw error;
    // }

    // DATOS DE PRUEBA - Retorna datos simulados con latencia
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(datosPruebaEmpresasConSucursales);
        }, 300);
    });
}

