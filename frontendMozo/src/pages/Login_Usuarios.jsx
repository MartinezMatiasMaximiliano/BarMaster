import React, { useContext } from 'react';
import LoginForm from '../components/LoginForm';
import authService from '../connections/AuthService';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';

const LoginUsuarios = () => {
    const navigate = useNavigate();
    const loginProvider = useContext(LoginContext);

    // TEMPORAL: Bypass para desarrollo - permite login con cualquier usuario
    const BYPASS_MODE = true; // Cambiar a false cuando se implemente el login real

    const handleLoginBypass = (Dni, password) => {
        // Validar que se ingresó algo
        if (!Dni || !password) {
            alert('Por favor ingrese DNI y contraseña');
            return;
        }

        // Guardar datos temporales en localStorage
        localStorage.setItem('token', 'temp_token_' + Date.now());
        localStorage.setItem('nombres', 'Usuario');
        localStorage.setItem('apellido', 'Temporal');
        localStorage.setItem('id', '1');
        localStorage.setItem('rol', 'Encargado'); // Rol con acceso completo
        localStorage.setItem('auth_type', 'sucursal'); // Necesario para que funcione el sistema

        loginProvider.setLogeadoUsuario(true);
        loginProvider.setRol('Encargado');

        // Navegar al sistema
        navigate('/sistema_sucursal');
    };

    const handleLogin = async (Dni, password) => {
        // TEMPORAL: Bypass activado
        if (BYPASS_MODE) {
            handleLoginBypass(Dni, password);
            return;
        }

        // Código original del login
        try {
            const exito = await authService.login(Dni, password);
            if (exito) {
                loginProvider.setLogeadoUsuario(true);
                loginProvider.setRol(localStorage.getItem("rol"));
                navigate('/sistema_sucursal');
            } else {
                alert('Credenciales incorrectas.');
            }
        } catch (error) {
            console.error('Error durante el login', error);
            alert('Hubo un problema al intentar iniciar sesión');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <LoginForm onSubmit={handleLogin} />
        </div>
    );
};

export default LoginUsuarios;

