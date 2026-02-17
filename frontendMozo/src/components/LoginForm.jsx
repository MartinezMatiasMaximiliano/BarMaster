import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { formCentered } from '../styles/boxStyles';

const LoginForm = ({ onSubmit }) => {
    const [Dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (Dni && password) {
            onSubmit(Dni, password) // Llama a la funcion que maneja el login en el componente padre
        } else {
            setError('Por favor ingrese su Dni y contraseña');
        }
    }

    return (
        <div>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={formCentered}
            >
                <Typography variant="h6" textAlign="center">
                    Iniciar Sesión
                </Typography>

                <TextField
                    label="DNI"
                    type="text"
                    onChange={(e) => setDni(e.target.value)}
                    required
                />
                <TextField
                    label="Contraseña"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button type="submit" variant="contained" color="primary">
                    Iniciar Sesión
                </Button>
            </Box>
        </div>
    )
}

export default LoginForm;
