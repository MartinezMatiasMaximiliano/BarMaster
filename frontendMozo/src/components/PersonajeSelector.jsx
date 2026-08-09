import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Chip, Tooltip, Typography } from '@mui/material';

export const PERSONAJES = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    src: `/personajes/personaje${index}.png`,
    nombre: `Personaje ${index + 1}`,
}));

export const PERSONAJE_ACTUALIZADO_EVENT = 'barmaster:personaje-actualizado';

const normalizarIdentidad = (valor = '') => valor
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export const obtenerClavePersonaje = (nombre, apellido, esUsuarioLogueado = false) => {
    if (esUsuarioLogueado || (!nombre && !apellido)) return 'USER_personaje';
    return `PERSONAJE_${normalizarIdentidad(`${nombre} ${apellido}`) || 'invitado'}`;
};

export const obtenerPersonajeGuardado = (storageKey) => {
    const valor = Number(localStorage.getItem(storageKey));
    return Number.isInteger(valor) && valor >= 0 && valor < PERSONAJES.length ? valor : 0;
};

export const guardarPersonaje = (storageKey, personajeId) => {
    localStorage.setItem(storageKey, String(personajeId));
    window.dispatchEvent(new CustomEvent(PERSONAJE_ACTUALIZADO_EVENT, {
        detail: { storageKey, personajeId },
    }));
};

export function GrillaPersonajes({ value, onChange, compacta = false }) {
    return (
        <Box
            role="radiogroup"
            aria-label="Elegir personaje"
            sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${compacta ? 5 : 5}, minmax(0, 1fr))`,
                gap: compacta ? 0.75 : 1.5,
            }}
        >
            {PERSONAJES.map((personaje) => {
                const seleccionado = value === personaje.id;
                return (
                    <Box
                        component="button"
                        type="button"
                        role="radio"
                        aria-checked={seleccionado}
                        aria-label={personaje.nombre}
                        key={personaje.id}
                        onClick={() => onChange(personaje.id)}
                        sx={{
                            border: seleccionado ? 3 : 1,
                            borderColor: seleccionado ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            bgcolor: seleccionado ? 'primary.50' : 'background.paper',
                            p: compacta ? 0.25 : 0.75,
                            cursor: 'pointer',
                            transition: 'transform 120ms ease, border-color 120ms ease',
                            '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
                            '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light' },
                        }}
                    >
                        <Box
                            component="img"
                            src={personaje.src}
                            alt=""
                            sx={{ width: compacta ? 42 : 72, height: compacta ? 42 : 72, objectFit: 'contain', display: 'block' }}
                        />
                    </Box>
                );
            })}
        </Box>
    );
}

export function ChipNombreCompleto({ nombre, apellido, editable = true, esUsuarioLogueado = false }) {
    const nombres = nombre || localStorage.getItem('USER_nombres') || '';
    const apellidos = apellido || localStorage.getItem('USER_apellido') || '';
    const storageKey = useMemo(
        () => obtenerClavePersonaje(nombre, apellido, esUsuarioLogueado),
        [nombre, apellido, esUsuarioLogueado]
    );
    const [personajeId, setPersonajeId] = useState(() => obtenerPersonajeGuardado(storageKey));
    const [tooltipAbierto, setTooltipAbierto] = useState(false);

    useEffect(() => {
        setPersonajeId(obtenerPersonajeGuardado(storageKey));
        const actualizar = (event) => {
            if (!event.detail || event.detail.storageKey === storageKey) {
                setPersonajeId(obtenerPersonajeGuardado(storageKey));
            }
        };
        window.addEventListener(PERSONAJE_ACTUALIZADO_EVENT, actualizar);
        window.addEventListener('storage', actualizar);
        return () => {
            window.removeEventListener(PERSONAJE_ACTUALIZADO_EVENT, actualizar);
            window.removeEventListener('storage', actualizar);
        };
    }, [storageKey]);

    const seleccionar = (id) => {
        guardarPersonaje(storageKey, id);
        setPersonajeId(id);
        setTooltipAbierto(false);
    };

    const chip = (
        <Chip
            avatar={<Avatar src={PERSONAJES[personajeId].src} alt={`Personaje de ${nombres}`} />}
            label={`${nombres} ${apellidos}`.trim()}
            variant="outlined"
            color="success"
            clickable={editable}
            onClick={editable ? () => setTooltipAbierto((actual) => !actual) : undefined}
            aria-label={editable ? `Elegir personaje de ${nombres} ${apellidos}`.trim() : undefined}
        />
    );

    if (!editable) return chip;

    return (
        <Tooltip
            open={tooltipAbierto}
            onClose={() => setTooltipAbierto(false)}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            arrow
            placement="top"
            slotProps={{
                tooltip: { sx: { bgcolor: 'background.paper', color: 'text.primary', boxShadow: 6, p: 1.5, maxWidth: 300 } },
                arrow: { sx: { color: 'background.paper' } },
            }}
            title={
                <Box onClick={(event) => event.stopPropagation()}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Elegí un personaje</Typography>
                    <GrillaPersonajes value={personajeId} onChange={seleccionar} compacta />
                </Box>
            }
        >
            {chip}
        </Tooltip>
    );
}
