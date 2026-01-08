import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

/**
 * Componente reutilizable para botones de exportación (PDF y Excel)
 * 
 * @param {Object} props
 * @param {Function} props.onExportarPDF - Función a ejecutar al hacer clic en PDF
 * @param {Function} props.onExportarExcel - Función a ejecutar al hacer clic en Excel
 * @param {boolean} [props.deshabilitado] - Si los botones deben estar deshabilitados
 * @param {string} [props.tooltipPDF] - Texto del tooltip para el botón PDF
 * @param {string} [props.tooltipExcel] - Texto del tooltip para el botón Excel
 */
export const BotonesExportacion = ({
    onExportarPDF,
    onExportarExcel,
    deshabilitado = false,
    tooltipPDF = 'Exportar a PDF',
    tooltipExcel = 'Exportar a Excel'
}) => {
    return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onExportarPDF && (
                <Tooltip title={tooltipPDF}>
                    <span>
                        <IconButton
                            onClick={onExportarPDF}
                            disabled={deshabilitado}
                            size="small"
                            sx={{
                                color: deshabilitado ? 'action.disabled' : '#d32f2f', // Rojo
                                '&:hover': {
                                    backgroundColor: deshabilitado ? 'transparent' : 'rgba(211, 47, 47, 0.08)'
                                }
                            }}
                        >
                            <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            {onExportarExcel && (
                <Tooltip title={tooltipExcel}>
                    <span>
                        <IconButton
                            onClick={onExportarExcel}
                            disabled={deshabilitado}
                            size="small"
                            sx={{
                                color: deshabilitado ? 'action.disabled' : '#2e7d32', // Verde
                                '&:hover': {
                                    backgroundColor: deshabilitado ? 'transparent' : 'rgba(46, 125, 50, 0.08)'
                                }
                            }}
                        >
                            <TableChartIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
        </Box>
    );
};

