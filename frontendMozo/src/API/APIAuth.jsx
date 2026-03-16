import api from '../services/axiosInstance'

export async function Authenticate(Dni, pass) {
    try {
        const response = await api.post('Login', { dni: Dni, contrasena : pass});
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function Register() {

}
