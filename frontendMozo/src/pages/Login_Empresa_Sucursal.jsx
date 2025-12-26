import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LoginContext, AuthTypeContext } from '../App';
import { authService } from '../services/authService';

const LoginEmpresaSucursal = () => {
    // Estados del formulario
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hooks
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);

    /**
     * Maneja los cambios en los campos del formulario
     */
    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError('');
    };

    /**
     * Valida que los campos requeridos estén completos
     */
    const validateForm = () => {
        if (!formData.username || !formData.password) {
            setError('Por favor ingrese usuario y contraseña');
            return false;
        }

        if (!formData.username.includes('@')) {
            setError('El formato de usuario debe ser: Empresa@empresa o Empresa@nombreSucursal');
            return false;
        }

        return true;
    };

    /**
     * Procesa la respuesta exitosa del login
     */
    const handleLoginSuccess = (response) => {
        const authType = response.auth_type;
        // Extraer y guardar el tenant ID (parte antes del @)
        const tenantId = authService.extractCompanyName(formData.username);
        
        // Guardar datos en localStorage
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('auth_type', authType);
        localStorage.setItem('username', formData.username);
        localStorage.setItem('tenantId', tenantId);

        // Actualizar contextos
        loginContext.setLogeadoEmpresaSucursal(true);
        if (authTypeContext?.setAuthType) {
            authTypeContext.setAuthType(authType);
        }

        // Redirigir según el tipo de autenticación
        const redirectPath = authType === 'sucursal' ? '/sistema_sucursal' : '/panel_sucursales';

        navigate(redirectPath);
    };

    /**
     * Maneja los errores de la petición
     */
    const handleLoginError = (error) => {
        if (error.response) {
            setError(
                error.response.data?.message || 
                `Error ${error.response.status}: ${error.response.statusText}`
            );
        } else if (error.request) {
            setError('No se pudo conectar al servidor. Verifique su conexión.');
        } else {
            setError(error.message || 'Error al realizar el login');
        }
        console.error('Error en login:', error);
    };

    /**
     * Maneja el envío del formulario
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.loginEmpresaSucursal(
                formData.username,
                formData.password
            );
            handleLoginSuccess(response);
        } catch (error) {
            handleLoginError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: 2
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 450,
                    width: '100%'
                }}
            >
                <Typography 
                    variant="h5" 
                    component="h1" 
                    textAlign="center" 
                    gutterBottom 
                    sx={{ mb: 3, fontWeight: 600 }}
                >
                    Iniciar Sesión
                </Typography>

                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    textAlign="center" 
                    sx={{ mb: 3 }}
                >
                    Ingrese sus credenciales para acceder al sistema
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <TextField
                        label="Usuario"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        placeholder="Ej: LaCafeteria@empresa o LaCafeteria@SucursalCentro"
                        required
                        fullWidth
                        helperText="Formato: Empresa@empresa o Empresa@nombreSucursal"
                        disabled={loading}
                        autoComplete="username"
                    />

                    <TextField
                        label="Contraseña"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        required
                        fullWidth
                        disabled={loading}
                        autoComplete="current-password"
                    />

                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </Box>

                <InfoBox />
            </Paper>
        </Box>
    );
};

/**
 * Componente para mostrar información de formato de usuario
 */
const InfoBox = () => (
    <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 600 }}>
            Información:
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
            • Para acceder como Empresa, use: Empresa@empresa
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
            • Para acceder como Sucursal, use: Empresa@nombreSucursal
        </Typography>
    </Box>
);

export default LoginEmpresaSucursal;

