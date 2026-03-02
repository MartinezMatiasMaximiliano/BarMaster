import React, { useState } from 'react';
import { ModificarPassword } from '../API/APIPersonas';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { LoadingButton } from '../components/common/LoadingButton';
import { formCentered } from '../styles/boxStyles';

const PasswordChangeForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }

        const token = localStorage.getItem('USER_token');

        if (!token) {
            setError('No se encontró información de sesión. Por favor, inicia sesión nuevamente.');
            return;
        }

        try {
            await ModificarPassword(currentPassword, newPassword, confirmPassword);
            setSuccess('Contraseña cambiada exitosamente.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const errorMessage = error.response?.data
                || error.message
                || 'Error al cambiar la contraseña. Por favor, intenta nuevamente.';
            setError(errorMessage);
        }
    };

    return (
        <Container maxWidth="sm" sx={{py:4}}>
            <Card variant="outlined">
                <CardHeader title="Cambiar Contraseña"/>
                <CardContent>
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
                    <Box component="form" sx={formCentered}>
                        <TextField label="Contraseña Actual" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        <TextField label="Nueva Contraseña" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <TextField label="Confirmar Nueva Contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                        <LoadingButton
                            onClick={handleSubmit}
                            variant="contained"
                            startIcon={<LockResetIcon />}
                        >
                            Guardar
                        </LoadingButton>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PasswordChangeForm;

