import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import { currencyFormatter, formatearFechaCompleta } from '../utils/constants';

export const Historial = ({ historial, loadingHistorial, cajaSeleccionada, onRefresh, onClickArqueo }) => {
    return (
        <Card variant="outlined">
            <CardHeader
                title="Arqueos"
                subheader={historial.length > 0 ? `${historial.length} arqueo${historial.length !== 1 ? 's' : ''} encontrado${historial.length !== 1 ? 's' : ''}` : "Seleccioná una fecha para ver los arqueos"}
                avatar={<HistoryIcon color="action" />}
                action={
                    <Tooltip title="Refrescar historial">
                        <span>
                            <IconButton size="small" onClick={onRefresh}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                }
            />
            <Divider />
            <CardContent>
                {loadingHistorial ? (
                    <Stack alignItems="center" py={2}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : historial.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                        No hay arqueos para la fecha seleccionada.
                    </Typography>
                ) : (
                    <Grid container spacing={1.5}>
                        {historial.map((item) => {
                            const estaSeleccionada = cajaSeleccionada?.id === item.id;
                            return (
                                <Grid item xs={12} sm={6} key={item.id ?? `${item.fechaApertura}-${item.fechaCierre}-${item.montoFinal}`}>
                                    <Box
                                        onClick={() => onClickArqueo(item)}
                                        sx={{
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: estaSeleccionada ? 'primary.main' : 'divider',
                                            backgroundColor: estaSeleccionada ? 'action.selected' : 'transparent',
                                            p: 1.5,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'relative',
                                            height: '100%',
                                            '&:hover': {
                                                backgroundColor: estaSeleccionada ? 'action.selected' : 'action.hover',
                                                borderColor: 'primary.main',
                                                transform: 'translateY(-2px)',
                                                boxShadow: 1
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle2">
                                            {formatearFechaCompleta(item.fechaApertura, item.horaApertura)} - {formatearFechaCompleta(item.fechaCierre, item.horaCierre)}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5} flexWrap="wrap">
                                            <Typography variant="body2" color="text.secondary">
                                                Cerró con {currencyFormatter.format(item.montoFinal ?? 0)}
                                            </Typography>
                                            {item.diferencia !== undefined && item.diferencia !== null && (
                                                <Chip
                                                    size="small"
                                                    label={
                                                        item.diferencia > 0
                                                            ? `Sobrante: ${currencyFormatter.format(item.diferencia)}`
                                                            : item.diferencia < 0
                                                            ? `Faltante: ${currencyFormatter.format(Math.abs(item.diferencia))}`
                                                            : 'Sin diferencia'
                                                    }
                                                    color={item.diferencia > 0 ? 'success' : item.diferencia < 0 ? 'error' : 'default'}
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

