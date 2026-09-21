import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Chip, CircularProgress, Tooltip, Typography, useTheme } from '@mui/material';

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

export function GrillaPersonajes({ value, onChange, compacta = false, disabled = false }) {
    return (
        <Box
            role="radiogroup"
            aria-label="Elegir personaje"
            sx={{
                display: 'grid',
                gridTemplateColumns: compacta
                    ? 'repeat(5, minmax(0, 1fr))'
                    : { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' },
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
                        disabled={disabled}
                        onClick={() => onChange(personaje.id)}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            minWidth: 0,
                            boxSizing: 'border-box',
                            border: seleccionado ? 3 : 1,
                            borderColor: seleccionado ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            bgcolor: seleccionado ? 'primary.50' : 'background.paper',
                            p: compacta ? 0.25 : 0.75,
                            cursor: disabled ? 'wait' : 'pointer',
                            opacity: disabled ? 0.65 : 1,
                            transition: 'transform 120ms ease, border-color 120ms ease',
                            '&:hover': disabled ? {} : { transform: 'translateY(-2px)', borderColor: 'primary.main' },
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

export function ChipNombreCompleto({
    nombre,
    apellido,
    personajeIdInicial,
    editable = true,
    esUsuarioLogueado = false,
    validarCodigo = false,
    onPersonajeChange,
}) {
    const theme = useTheme();
    const nombres = nombre || localStorage.getItem('USER_nombres') || '';
    const apellidos = apellido || localStorage.getItem('USER_apellido') || '';
    const storageKey = useMemo(
        () => obtenerClavePersonaje(nombre, apellido, esUsuarioLogueado),
        [nombre, apellido, esUsuarioLogueado]
    );
    const obtenerValorInicial = () => {
        const valor = Number(personajeIdInicial);
        return Number.isInteger(valor) && valor >= 0 && valor < PERSONAJES.length
            ? valor
            : obtenerPersonajeGuardado(storageKey);
    };
    const [personajeId, setPersonajeId] = useState(obtenerValorInicial);
    const [tooltipAbierto, setTooltipAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const colorCodigoCorrecto = theme.palette.mode === 'dark'
        ? theme.palette.success.light
        : theme.palette.success.main;

    useEffect(() => {
        setPersonajeId(obtenerValorInicial());
        setTooltipAbierto(false);
        setError('');
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
    }, [storageKey, personajeIdInicial]);

    const seleccionar = async (id) => {
        if (guardando || id === personajeId || !onPersonajeChange) return;

        setGuardando(true);
        setError('');

        try {
            const resultado = await onPersonajeChange(id);
            const personajeGuardado = resultado?.personajeId ?? id;
            setPersonajeId(personajeGuardado);
            setTooltipAbierto(false);
        } catch (err) {
            setError(err.message || 'No se pudo guardar el personaje.');
        } finally {
            setGuardando(false);
        }
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
            sx={{
                ...(validarCodigo ? {
                    color: colorCodigoCorrecto,
                    borderColor: colorCodigoCorrecto,
                } : {}),
                '& .MuiChip-avatar': {
                    width: '27.6px',
                    height: '27.6px',
                },
            }}
        />
    );

    if (!editable) return chip;

    return (
        <Tooltip
            open={tooltipAbierto}
            onClose={() => !guardando && setTooltipAbierto(false)}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            arrow
            placement="top-start"
            slotProps={{
                tooltip: {
                    sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 6,
                        width: 330,
                        maxWidth: 'calc(100vw - 32px)',
                        boxSizing: 'border-box',
                    },
                },
                arrow: { sx: { color: 'background.paper' } },
            }}
            title={
                <Box
                    onClick={(event) => event.stopPropagation()}
                    sx={{ p: 1, width: '100%', boxSizing: 'border-box' }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Elegí un personaje</Typography>
                    <GrillaPersonajes
                        value={personajeId}
                        onChange={seleccionar}
                        compacta
                        disabled={guardando}
                    />
                    {guardando && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <CircularProgress size={14} />
                            <Typography variant="caption">Guardando...</Typography>
                        </Box>
                    )}
                    {error && (
                        <Typography variant="caption" color="error.dark" sx={{ display: 'block', mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            }
        >
            {chip}
        </Tooltip>
    );
}
