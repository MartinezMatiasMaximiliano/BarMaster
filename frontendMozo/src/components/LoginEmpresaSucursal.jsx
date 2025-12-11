import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import axios from 'axios';

/**
 * Componente de Login para Empresas y Sucursales
 * 
 * Formato de usuario:
 * - Empresa: Empresa@empresa (ej: LaCafeteria@empresa)
 * - Sucursal: Empresa@nombreSucursal (ej: LaCafeteria@SucursalCentro)
 */
const LoginEmpresaSucursal = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    /**
     * Extrae el nombre de la empresa (lo que va antes del @)
     * @param {string} username - Usuario en formato Empresa@empresa o Empresa@nombreSucursal
     * @returns {string} - Nombre de la empresa
     */
    const extraerNombreEmpresa = (username) => {
        if (!username.includes('@')) {
            throw new Error('El formato de usuario debe ser: Empresa@empresa o Empresa@nombreSucursal');
        }
        return username.split('@')[0];
    };

    /**
     * Función que hace el POST con headers personalizados
     * @param {string} url - URL del endpoint
     * @param {object} data - Datos a enviar (username y password)
     * @param {string} tenantId - ID del tenant (nombre de la empresa)
     * @returns {Promise} - Respuesta de la API
     */
    const postWithHeaders = async (url, data, tenantId) => {
        try {
            const response = await axios.post(
                url,
                data,
                {
                    headers: {
                        "X-Tenant-ID": tenantId,
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("POST error:", error);
            throw error;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        
        if (!username || !password) {
            setError('Por favor ingrese usuario y contraseña');
            return;
        }

        // Validar formato de usuario
        if (!username.includes('@')) {
            setError('El formato de usuario debe ser: Empresa@empresa o Empresa@nombreSucursal');
            return;
        }

        setLoading(true);

        try {
            // Extraer el nombre de la empresa para el header X-Tenant-ID
            const nombreEmpresa = extraerNombreEmpresa(username);

            // Construir la URL del endpoint desde .env
            const url = import.meta.env.VITE_BASE_URL + "Login";

            // Preparar los datos del body
            const data = {
                username: username,
                password: password
            };

            // Hacer la llamada a la API
            const response = await postWithHeaders(url, data, nombreEmpresa);

            // Si llegamos aquí, el login fue exitoso
            setSuccess('Login exitoso! Respuesta recibida.');
            console.log('Respuesta del servidor:', response);
            
            // Aquí puedes manejar la respuesta según necesites
            // Por ahora solo mostramos un mensaje de éxito
            
        } catch (error) {
            // Manejar errores
            if (error.response) {
                // El servidor respondió con un código de error
                setError(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`);
            } else if (error.request) {
                // La petición se hizo pero no se recibió respuesta
                setError('No se pudo conectar al servidor. Verifique su conexión.');
            } else {
                // Algo pasó al configurar la petición
                setError(error.message || 'Error al realizar el login');
            }
            console.error('Error en login:', error);
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
                <Typography variant="h5" component="h1" textAlign="center" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    Iniciar Sesión
                </Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ej: LaCafeteria@empresa o LaCafeteria@SucursalCentro"
                        required
                        fullWidth
                        helperText="Formato: Empresa@empresa o Empresa@nombreSucursal"
                        disabled={loading}
                    />

                    <TextField
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                        disabled={loading}
                    />

                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" onClose={() => setSuccess('')}>
                            {success}
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
            </Paper>
        </Box>
    );
};

export default LoginEmpresaSucursal;

