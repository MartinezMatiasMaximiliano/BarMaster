import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { ModificarPassword } from '../API/APIPersonas';

const PasswordChangeForm = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newPassword || !confirmPassword) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }

        // AquÃ­ podrÃ­as hacer una llamada a una API para cambiar la contraseña
        ModificarPassword(localStorage.getItem('id'), newPassword, localStorage.getItem('token'));
        // Por ahora simulamos Ã©xito:
        setSuccess('Contraseña cambiada exitosamente.');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 400, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
            <Typography variant="h6" textAlign="center">
                Cambiar Contraseña
            </Typography>

            <TextField
                label="Nueva Contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
            />
            <TextField
                label="Confirmar Nueva Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Button type="submit" variant="contained" color="primary">
                Cambiar Contraseña
            </Button>
        </Box>
    );
};

export default PasswordChangeForm;

