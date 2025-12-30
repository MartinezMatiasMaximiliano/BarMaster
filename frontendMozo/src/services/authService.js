import axios from 'axios';

export const authService = {

    extractCompanyName: (username) => {
        if (!username) {
            throw new Error('El nombre de usuario es requerido');
        }
        // Si tiene @, es sucursal: extraer la parte antes del @
        // Si no tiene @, es empresa: devolver el username completo
        return username.includes('@') ? username.split('@')[0] : username;
    },

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
    },

    // Función helper para obtener los headers de autorización y tenant
    getAuthHeaders: () => {
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId');
        return {
            headers: {
                Authorization: 'Bearer ' + token,
                'X-Tenant-ID': tenantId || ''
            }
        };
    }
};

