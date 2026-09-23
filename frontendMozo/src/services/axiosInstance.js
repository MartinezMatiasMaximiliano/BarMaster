import axios from 'axios';
import { clearBranchSession, clearPersonSession } from './sessionCleanup';
import { authService } from './authService';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

// Request interceptor: agrega headers de auth automáticamente
axiosInstance.interceptors.request.use((config) => {
    const idRolPersona = Number(authService.decodeToken(localStorage.getItem('USER_token'))?.IdRol);
    const tokenPersona = localStorage.getItem('USER_token');
    const usarTokenPersona = Boolean(tokenPersona && (idRolPersona === 1 || idRolPersona === 4));
    const token = usarTokenPersona ? tokenPersona : localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');

    // Permite que el interceptor de respuesta sepa cuál de las dos sesiones falló.
    config.barmasterAuthScope = usarTokenPersona ? 'persona' : 'sucursal';

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
});

// Response interceptor: manejo centralizado de 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            if (error.config?.barmasterAuthScope === 'persona') {
                // La sucursal continúa autenticada: sólo venció o es inválida la sesión personal.
                clearPersonSession();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            } else {
                await clearBranchSession();
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
