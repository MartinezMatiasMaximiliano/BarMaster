import api from './axiosInstance';
import { authService } from './authService';

export function esOperadorPersonal() {
    const token = localStorage.getItem('USER_token');
    const idRol = Number(authService.decodeToken(token)?.IdRol);
    return Boolean(token && (idRol === 1 || idRol === 4));
}

export default api;
