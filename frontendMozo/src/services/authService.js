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
    },

    // Función para decodificar el token JWT y extraer claims
    decodeToken: (token) => {
        try {
            if (!token) return null;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error al decodificar token:', error);
            return null;
        }
    },

    // Función para obtener el IdSucursal del token
    getIdSucursal: () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const decoded = authService.decodeToken(token);
        return decoded?.IdSucursal || null;
    }
};

