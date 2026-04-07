import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function Authenticate(Dni, pass) {
    try {
        const response = await api.post('Login', { dni: Dni, contrasena : pass});
        return response.data;
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al iniciar sesión'));
        throw construirError(error, 'Error al iniciar sesión');
    }
}

export async function Register() {

}
