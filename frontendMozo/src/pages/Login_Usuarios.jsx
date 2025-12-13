import React, { useContext } from 'react';
import LoginForm from '../components/LoginForm';
import authService from '../connections/AuthService';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';

const LoginUsuarios = () => {
    const navigate = useNavigate();
    const loginProvider = useContext(LoginContext);

    const handleLogin = async (Dni, password) => {
        try {
            const exito = await authService.login(Dni, password);
            if (exito) {
                loginProvider.setLogeado(true);
                loginProvider.setRol(localStorage.getItem("rol"));
                navigate('/');
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

