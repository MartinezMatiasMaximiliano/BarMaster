import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

// Request interceptor: agrega headers de auth automáticamente
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');

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
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido — limpiar sesión y redirigir al login
            localStorage.removeItem('token');
            localStorage.removeItem('auth_type');
            localStorage.removeItem('tenantId');
            localStorage.removeItem('USER_token');
            localStorage.removeItem('USER_auth_type');

            // Solo redirigir si no estamos ya en la página de login
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
