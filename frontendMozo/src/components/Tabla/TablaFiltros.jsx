import { Box } from "@mui/material";

/**
 * Componente para los filtros y ordenamiento de la tabla
 */
export default function TablaFiltros({ renderFiltros, renderOrdenar }) {
    const tieneFiltros = typeof renderFiltros === "function";
    const tieneOrdenar = typeof renderOrdenar === "function";

    if (!tieneFiltros && !tieneOrdenar) {
        return null;
    }

    return (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {tieneFiltros && (
                <Box sx={{ flex: 1, minWidth: 200 }}>
                    {renderFiltros()}
                </Box>
            )}
            {tieneOrdenar && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {renderOrdenar()}
                </Box>
            )}
        </Box>
    );
}

