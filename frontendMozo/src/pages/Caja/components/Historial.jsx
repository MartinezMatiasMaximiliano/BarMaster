import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import { currencyFormatter } from '../utils/constants';

export const Historial = ({ historial, loadingHistorial, cajaSeleccionada, onRefresh, onClickArqueo }) => {
    return (
        <Card variant="outlined">
            <CardHeader
                title="Últimos arqueos"
                subheader="Referencias rápidas"
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
                    <Typography variant="body2" color="text.secondary">
                        Aún no hay movimientos recientes.
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {historial.map((item) => {
                            const estaSeleccionada = cajaSeleccionada?.id === item.id;
                            return (
                                <Box
                                    key={item.id ?? `${item.fechaApertura}-${item.fechaCierre}-${item.montoFinal}`}
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
                                        '&:hover': {
                                            backgroundColor: estaSeleccionada ? 'action.selected' : 'action.hover',
                                            borderColor: 'primary.main',
                                            transform: 'translateY(-2px)',
                                            boxShadow: 1
                                        }
                                    }}
                                >
                                    {estaSeleccionada && (
                                        <Chip
                                            size="small"
                                            label="Ver movimientos"
                                            color="primary"
                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                        />
                                    )}
                                    <Typography variant="subtitle2">
                                        {item.fechaApertura} {item.horaApertura} - {item.fechaCierre}{' '}
                                        {item.horaCierre}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
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
                            );
                        })}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

