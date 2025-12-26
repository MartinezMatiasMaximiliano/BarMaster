import axios from 'axios';

export const authService = {

    extractCompanyName: (username) => {
        if (!username || !username.includes('@')) {
            throw new Error('El formato de usuario debe ser: Empresa@empresa o Empresa@nombreSucursal');
        }
        return username.split('@')[0];
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
    }
};

