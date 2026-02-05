import axios from 'axios';

const AuthService = {
    login: async (Dni, contrasena) => {
        try {
            // El backend espera Username y Password (PascalCase)
            const response = await axios.post(import.meta.env.VITE_BASE_URL + "Login", { 
                username: Dni, 
                password: contrasena 
            });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('nombres', response.data.nombres);
                localStorage.setItem('apellido', response.data.apellido);
                localStorage.setItem('id', response.data.id);
                localStorage.setItem('rol', response.data.rol);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error en la autenticacion:', error);
            return false;
        }
    },
}

export default AuthService;