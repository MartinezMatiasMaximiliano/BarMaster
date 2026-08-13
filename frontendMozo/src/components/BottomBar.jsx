import React from 'react';
import { Form } from 'react-bootstrap';
import { Chip, Box, Typography, Stack, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { keyframes } from '@mui/material/styles';
import { GetChipNombreCompleto, formatearFechaCompleta, formatearHoraCompleta } from '../Helpers/HelperFunctions';
import { useDateTime } from '../hooks/useDateTime';
import { ModificarPersonaje } from '../API/APIPersonas';

const animacionIconoTema = keyframes`
    from {
        opacity: 0;
        transform: rotate(-45deg) scale(0.75);
    }
    to {
        opacity: 1;
        transform: rotate(0deg) scale(1);
    }
`;

const animacionTextoTema = keyframes`
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const BottomBar = ({
    codigoMozo,
    handleChange,
    mozo,
    fechaHora: fechaHoraProp,
    themeMode,
    onThemeToggle,
    onSalirClick
}) => {
    const fechaHoraFromHook = useDateTime();
    const fechaHora = fechaHoraProp ?? fechaHoraFromHook;
    return (
        <div className="position-absolute bottom-0 start-0 w-100 p-3 d-flex align-items-end gap-3 flex-wrap">
            <Form.Group controlId="exampleForm.ControlInput1" className="mb-0">
                <Form.Label>Código</Form.Label>
                <Form.Control
                    onChange={handleChange}
                    type="password"
                    value={codigoMozo}
                    className="w-100"
                />
            </Form.Group>
            {mozo?.nombre ? GetChipNombreCompleto(
                mozo.nombre,
                mozo.apellido,
                mozo.personajeId,
                {
                    editable: true,
                    validarCodigo: true,
                    onPersonajeChange: (personajeId) => ModificarPersonaje(mozo.id, personajeId),
                }
            ) : (
                <Chip
                    label="Código incorrecto"
                    variant="outlined"
                    color="error"
                    sx={(theme) => {
                        const colorCodigoIncorrecto = theme.palette.mode === 'dark'
                            ? theme.palette.error.light
                            : theme.palette.error.main;

                        return {
                            color: colorCodigoIncorrecto,
                            borderColor: colorCodigoIncorrecto,
                        };
                    }}
                />
            )}

            <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                    <Typography variant="caption" color="text.secondary">
                        {formatearFechaCompleta(fechaHora)}
                    </Typography>
                    <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14, ml: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                        {formatearHoraCompleta(fechaHora)}
                    </Typography>
                </Stack>
                {localStorage.getItem('token') && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                            <Typography variant="caption" color="text.secondary">
                                {localStorage.getItem('username')}
                            </Typography>
                        </Stack>
                        {onThemeToggle && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={themeMode === 'dark'
                                    ? <LightModeIcon sx={{ animation: `${animacionIconoTema} 550ms ease-out` }} />
                                    : <DarkModeIcon sx={{ animation: `${animacionIconoTema} 550ms ease-out` }} />}
                                onClick={onThemeToggle}
                                aria-label={`Cambiar a modo ${themeMode === 'dark' ? 'claro' : 'oscuro'}`}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    px: 1.5,
                                    width: 132,
                                    minWidth: 132,
                                    boxSizing: 'border-box',
                                    transition: 'background-color 500ms ease, color 500ms ease, transform 220ms ease, box-shadow 500ms ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: 2,
                                    },
                                    '&:active': {
                                        transform: 'scale(0.96)',
                                    },
                                }}
                            >
                                <Typography
                                    key={themeMode}
                                    component="span"
                                    sx={{
                                        fontSize: 'inherit',
                                        fontWeight: 'inherit',
                                        animation: `${animacionTextoTema} 550ms ease-out`,
                                    }}
                                >
                                    Modo {themeMode === 'dark' ? 'claro' : 'oscuro'}
                                </Typography>
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<LogoutIcon />}
                            onClick={onSalirClick}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.5,
                                borderWidth: 1.5,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderWidth: 1.5,
                                    transform: 'translateY(-1px)',
                                    boxShadow: 2,
                                    bgcolor: 'error.light',
                                    color: 'error.dark'
                                }
                            }}
                        >
                            Salir
                        </Button>
                    </Stack>
                )}
            </Box>
        </div>
    );
};
