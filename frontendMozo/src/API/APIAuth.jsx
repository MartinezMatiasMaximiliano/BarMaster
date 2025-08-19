import axios from 'axios'

export async function Authenticate(Dni, pass) {
    try {
        const response = await axios.post(import.meta.env.VITE_BASE_URL + 'Login', { dni: Dni, contrasena : pass});
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function Register() {

}
