import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import { BotonesExportacion } from './BotonesExportacion';

/**
 * Componente para el header de la tabla
 */
export default function TablaHeader({ titulo, renderAgregar, onRefresh, onExportarPDF, onExportarExcel, deshabilitarExportacion }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'
            }}
        >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                {typeof renderAgregar === "function" ? renderAgregar() : null}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    {titulo}
                </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                {(onExportarPDF || onExportarExcel) && (
                    <BotonesExportacion
                        onExportarPDF={onExportarPDF}
                        onExportarExcel={onExportarExcel}
                        deshabilitado={deshabilitarExportacion}
                    />
                )}
                {typeof onRefresh === "function" && (
                    <Tooltip title="Recargar">
                        <IconButton onClick={onRefresh} size="small">
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}

