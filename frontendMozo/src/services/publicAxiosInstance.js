import axios from 'axios';

// Cliente público independiente de la sesión activa y de sus interceptores.
const publicApi = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: false,
});
publicApi.interceptors.request.use(config => {
    config.headers.delete('Authorization');
    config.auth = undefined;
    return config;
});
export default publicApi;
