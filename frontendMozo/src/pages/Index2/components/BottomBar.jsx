import React from 'react';
import { Form } from 'react-bootstrap';
import { Chip, Box, Typography, Stack, Button } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { GetChipNombreCompleto, formatearFechaCompleta, formatearHoraCompleta } from '../../../Helpers/HelperFunctions';

export const BottomBar = ({ 
    inputRef, 
    codigoMozo, 
    handleChange, 
    mozo, 
    fechaHora, 
    onSalirClick 
}) => {
    return (
        <div className="position-absolute bottom-0 start-0 w-100 p-3 d-flex align-items-end gap-3 flex-wrap">
            <Form.Group controlId="exampleForm.ControlInput1" className="mb-0">
                <Form.Label>Código</Form.Label>
                <Form.Control
                    ref={inputRef}
                    onChange={handleChange}
                    type="password"
                    value={codigoMozo}
                    className="w-100"
                />
            </Form.Group>
            {mozo?.nombre ? GetChipNombreCompleto(mozo.nombre, mozo.apellido) : (
                <Chip label="Codigo incorrecto" variant="outlined" color="error" />
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
                                {localStorage.getItem("username")}
                            </Typography>
                        </Stack>
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

