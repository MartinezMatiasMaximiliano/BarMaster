import React, { useContext } from 'react';
import LoginForm from '../components/LoginForm';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';
import { useSnackbar } from '../hooks/useSnackbar.jsx';
import { SnackbarWrapper } from '../components/common/SnackbarWrapper';

const LoginUsuarios = () => {
    const navigate = useNavigate();
    const loginProvider = useContext(LoginContext);
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const handleLogin = async (Dni, password) => {
        // Validar que se ingresaron datos
        if (!Dni || !password) {
            showSnackbar('Por favor ingrese DNI y contraseña', 'warning');
            return;
        }

        try {
            const result = await authService.loginPersona(Dni, password);
            
            if (result && result.success && result.token) {
                
                // Actualizar el contexto de login
                loginProvider.setLogeadoUsuario(true);
                loginProvider.setRol(localStorage.getItem('USER_auth_type'));
                
                // Navegar al sistema
                navigate('/sistema_sucursal');
            } else {
                showSnackbar('Credenciales incorrectas', 'error');
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            if (error.message === 'Usuario o contraseña incorrectos' || error.message === 'Usuario no encontrado') {
                showSnackbar(error.message, 'error');
            } else {
                showSnackbar('Hubo un problema al intentar iniciar sesión. Intente nuevamente.', 'error');
            }
        }
    };

    return (
        <>
            <div>
                <h1>Login</h1>
                <LoginForm onSubmit={handleLogin} />
            </div>
            <SnackbarWrapper
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
        </>
    );
};

export default LoginUsuarios;

