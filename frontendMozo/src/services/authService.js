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
    getAuthHeaders: (key = 'token') => {
        const token = localStorage.getItem(key);
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
    },

    // Función para login de personas (empleados)
    loginPersona: async (dni, password) => {
        try {
            const url = `${import.meta.env.VITE_BASE_URL}LoginPersona`;
            
            const response = await axios.post(
                url,
                { 
                    Username: dni,  // El backend espera Username (DNI)
                    Password: password 
                }, authService.getAuthHeaders()
            );

            if (response.status === 200 && response.data) {
                const tokenData = response.data;
                
                // Guardar el token
                localStorage.setItem('USER_token', tokenData.access_token);
                localStorage.setItem('USER_auth_type', tokenData.auth_type);
                
                // Decodificar el token para extraer información de la persona
                const decoded = authService.decodeToken(tokenData.access_token);
                
                if (decoded) {
                    // Extraer nombres y apellido del claim RequestedBy
                    const requestedBy = decoded.RequestedBy || '';
                    if (requestedBy) {
                        const [apellido, nombres] = requestedBy.split(',');
                        localStorage.setItem('USER_apellido', apellido?.trim() || '');
                        localStorage.setItem('USER_nombres', nombres?.trim() || '');
                    }
                }
                
                return {
                    success: true,
                    token: tokenData.access_token,
                    authType: tokenData.auth_type
                };
            }
            
            return { success: false };
        } catch (error) {
            console.error('Error en login de persona:', error);
            
            // Manejar errores específicos del backend
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data || error.message;
                
                if (status === 401) {
                    throw new Error('Usuario o contraseña incorrectos');
                } else if (status === 400) {
                    throw new Error(message || 'Usuario no encontrado');
                } else {
                    throw new Error(message || 'Error al iniciar sesión');
                }
            }
            
            throw new Error('Error de conexión. Por favor, intente nuevamente');
        }
    }
};

