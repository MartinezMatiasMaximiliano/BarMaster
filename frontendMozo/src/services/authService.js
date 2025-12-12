import axios from 'axios';

/**
 * Servicio para manejar autenticación de Empresas y Sucursales
 */
export const authService = {
    /**
     * Extrae el nombre de la empresa del username
     * @param {string} username - Usuario en formato Empresa@empresa o Empresa@nombreSucursal
     * @returns {string} - Nombre de la empresa
     * @throws {Error} - Si el formato no es válido
     */
    extractCompanyName: (username) => {
        if (!username || !username.includes('@')) {
            throw new Error('El formato de usuario debe ser: Empresa@empresa o Empresa@nombreSucursal');
        }
        return username.split('@')[0];
    },

    /**
     * Realiza el login de empresa o sucursal
     * @param {string} username - Usuario en formato Empresa@empresa o Empresa@nombreSucursal
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} - Respuesta del servidor con token y auth_type
     * @throws {Error} - Si la petición falla
     */
    loginEmpresaSucursal: async (username, password) => {
        try {
            const companyName = authService.extractCompanyName(username);
            const url = `${import.meta.env.VITE_BASE_URL}Login`;
            
            const response = await axios.post(
                url,
                { username, password },
                {
                    headers: {
                        "X-Tenant-ID": companyName,
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error en login de empresa/sucursal:", error);
            throw error;
        }
    }
};

