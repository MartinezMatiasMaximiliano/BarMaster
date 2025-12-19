import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

const ExportarReporte = ({ onExportarPDF, onExportarExcel, tipoReporte, datos }) => {
    const handleExportarPDF = () => {
        if (onExportarPDF && datos) {
            onExportarPDF(datos, tipoReporte, `Reporte_${tipoReporte}`);
        }
    };

    const handleExportarExcel = () => {
        if (onExportarExcel && datos) {
            onExportarExcel(datos, tipoReporte, `Reporte_${tipoReporte}`);
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2}>
                <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportarPDF}
                    color="error"
                >
                    Exportar a PDF
                </Button>
                <Button
                    variant="contained"
                    startIcon={<TableChartIcon />}
                    onClick={handleExportarExcel}
                    color="success"
                >
                    Exportar a Excel
                </Button>
            </Stack>
        </Box>
    );
};

export default ExportarReporte;

