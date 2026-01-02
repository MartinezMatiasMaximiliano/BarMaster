import { Box, Typography, Pagination } from "@mui/material";

/**
 * Componente para la paginación de la tabla
 */
export default function TablaPaginacion({ 
    habilitarPaginacion, 
    totalPages, 
    page, 
    handlePageChange, 
    rowsPerPage, 
    totalFilas 
}) {
    if (!habilitarPaginacion || totalPages <= 1) {
        return null;
    }

    const inicio = ((page - 1) * rowsPerPage) + 1;
    const fin = Math.min(page * rowsPerPage, totalFilas);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
                Mostrando {inicio} - {fin} de {totalFilas}
            </Typography>
            <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="small"
            />
        </Box>
    );
}

