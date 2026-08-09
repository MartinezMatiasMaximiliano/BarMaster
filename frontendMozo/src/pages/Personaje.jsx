import { useState } from 'react';
import { Alert, Box, Paper, Typography } from '@mui/material';
import {
    GrillaPersonajes,
    guardarPersonaje,
    obtenerClavePersonaje,
    obtenerPersonajeGuardado,
    PERSONAJES,
} from '../components/PersonajeSelector';

export default function Personaje() {
    const storageKey = obtenerClavePersonaje('', '', true);
    const [seleccionado, setSeleccionado] = useState(() => obtenerPersonajeGuardado(storageKey));
    const [guardado, setGuardado] = useState(false);

    const seleccionar = (id) => {
        guardarPersonaje(storageKey, id);
        setSeleccionado(id);
        setGuardado(true);
    };

    return (
        <Box sx={{ maxWidth: 760, mx: 'auto', py: 3 }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Personaje
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Elegí el personaje que te representará junto a tu nombre en el sistema.
            </Typography>
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <Box
                        component="img"
                        src={PERSONAJES[seleccionado].src}
                        alt={`Personaje seleccionado: ${seleccionado + 1}`}
                        sx={{ width: 150, height: 150, objectFit: 'contain' }}
                    />
                </Box>
                <GrillaPersonajes value={seleccionado} onChange={seleccionar} />
                {guardado && (
                    <Alert severity="success" sx={{ mt: 3 }}>
                        Tu personaje se guardó correctamente.
                    </Alert>
                )}
            </Paper>
        </Box>
    );
}
