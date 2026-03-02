import React, { useState, useRef } from 'react';
import {
    Alert, Box, Card, CardContent, CardHeader, Chip, Container,
    FormControl, IconButton, InputLabel, MenuItem, Select, Stack,
    TextField, Typography
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '../components/common/LoadingButton';

const tiposMensaje = [
    { value: 'consulta', label: 'Consulta' },
    { value: 'sugerencia', label: 'Sugerencia' },
    { value: 'bug', label: 'Bug / Error' },
    { value: 'queja', label: 'Queja' },
];

const Enviar_Comentarios = () => {
    const [tipo, setTipo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [archivos, setArchivos] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleAgregarArchivos = (e) => {
        const nuevosArchivos = Array.from(e.target.files);
        setArchivos(prev => [...prev, ...nuevosArchivos]);
        e.target.value = '';
    };

    const handleEliminarArchivo = (index) => {
        setArchivos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!tipo) {
            setError('Seleccioná un tipo de mensaje.');
            return;
        }

        if (!mensaje.trim()) {
            setError('Escribí tu mensaje.');
            return;
        }

        // TODO: enviar al backend cuando el endpoint esté disponible
        setSuccess('Comentario enviado. Gracias por tu feedback.');
        setTipo('');
        setMensaje('');
        setArchivos([]);
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Card variant="outlined">
                <CardHeader title="Enviar Comentarios" />
                <CardContent>
                    {error && (
                        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Stack spacing={3}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de mensaje</InputLabel>
                            <Select
                                value={tipo}
                                label="Tipo de mensaje"
                                onChange={(e) => setTipo(e.target.value)}
                            >
                                {tiposMensaje.map(t => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Mensaje"
                            multiline
                            rows={5}
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            placeholder="Describí tu consulta, sugerencia o problema..."
                        />

                        <Box>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAgregarArchivos}
                                multiple
                                accept="image/*,video/*"
                                style={{ display: 'none' }}
                            />
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <IconButton onClick={() => fileInputRef.current?.click()} color="primary">
                                    <AttachFileIcon />
                                </IconButton>
                                <Typography variant="body2" color="text.secondary">
                                    Adjuntar imágenes o videos
                                </Typography>
                            </Stack>

                            {archivos.length > 0 && (
                                <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                                    {archivos.map((archivo, index) => (
                                        <Chip
                                            key={index}
                                            label={archivo.name}
                                            onDelete={() => handleEliminarArchivo(index)}
                                            deleteIcon={<CloseIcon />}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        <Stack direction="row" justifyContent="flex-end">
                            <LoadingButton
                                onClick={handleSubmit}
                                variant="contained"
                                startIcon={<SendOutlinedIcon />}
                            >
                                Enviar
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Enviar_Comentarios;
