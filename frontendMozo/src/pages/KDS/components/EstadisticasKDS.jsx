import { memo } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import KitchenIcon from '@mui/icons-material/Kitchen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Componente para mostrar estadísticas del KDS
 */
const EstadisticasKDS = memo(({ estadisticas }) => {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                mb: 3
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Resumen de Pedidos
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Chip
                    icon={<RestaurantMenuIcon />}
                    label={`Total: ${estadisticas.total}`}
                    color="default"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
                <Chip
                    icon={<HourglassEmptyIcon />}
                    label={`Pendientes: ${estadisticas.pendientes}`}
                    color="warning"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
                <Chip
                    icon={<KitchenIcon />}
                    label={`En Preparación: ${estadisticas.enPreparacion}`}
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
                <Chip
                    icon={<CheckCircleIcon />}
                    label={`Listos: ${estadisticas.listos}`}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
            </Stack>
        </Box>
    );
});

EstadisticasKDS.displayName = 'EstadisticasKDS';

export default EstadisticasKDS;

