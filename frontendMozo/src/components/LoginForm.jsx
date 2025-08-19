import react, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

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
                sx={{ maxWidth: 400, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}
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
