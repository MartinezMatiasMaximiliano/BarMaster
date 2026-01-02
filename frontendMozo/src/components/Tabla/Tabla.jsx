import { Box, Card, CardContent, CardHeader, Divider, Table, TableContainer, TableHead, TableRow } from "@mui/material";
import { StyledTableCell } from "./Tabla.styles";
import { usePaginacion } from "./usePaginacion";
import TablaHeader from "./TablaHeader";
import TablaBody from "./TablaBody";
import TablaPaginacion from "./TablaPaginacion";
import TablaFiltros from "./TablaFiltros";

/**
 * Componente principal de tabla con paginación, filtros y ordenamiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.filas - Array de filas a mostrar
 * @param {Array} props.columnas - Array de configuración de columnas
 * @param {string} props.titulo - Título de la tabla
 * @param {number} [props.rowsPerPage=10] - Número de filas por página
 * @param {boolean} [props.paginacion=true] - Si la paginación está habilitada
 * @param {Function} [props.renderAgregar] - Función para renderizar botón de agregar
 * @param {Function} [props.renderFiltros] - Función para renderizar filtros
 * @param {Function} [props.renderOrdenar] - Función para renderizar ordenamiento
 * @param {Function} [props.onRefresh] - Callback para refrescar la tabla
 */
export default function Tabla(props) {
    const rowsPerPage = props.rowsPerPage || 10;
    const habilitarPaginacion = props.paginacion !== false;

    const {
        filasPaginadas,
        page,
        totalPages,
        handlePageChange,
        rowsPerPage: rowsPerPageValue
    } = usePaginacion(props.filas, rowsPerPage, habilitarPaginacion);

    const getTableContainerStyles = () => {
        if (habilitarPaginacion) {
            return {
                maxHeight: "70vh",
                overflow: "hidden",
                flex: "1 1 0",
                minHeight: 0,
            };
        }
        return {
            maxHeight: "70vh",
            overflowY: "auto",
        };
    };

    return (
        <Box sx={{ mt: 2 }}>
            <TablaFiltros 
                renderFiltros={props.renderFiltros}
                renderOrdenar={props.renderOrdenar}
            />
            <Card variant="outlined">
                <CardHeader
                    title={
                        <TablaHeader
                            titulo={props.titulo}
                            renderAgregar={props.renderAgregar}
                            onRefresh={props.onRefresh}
                        />
                    }
                    sx={{ pb: 1 }}
                />
                <Divider />
                <CardContent 
                    sx={{ 
                        p: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        ...(habilitarPaginacion && {
                            minHeight: '80vh',
                        }),
                    }}
                >
                    <TableContainer 
                        sx={{
                            ...getTableContainerStyles(),
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Table size="small" stickyHeader={!habilitarPaginacion}>
                            <TableHead>
                                <TableRow>
                                    {props.columnas.map((col, i) => (
                                        <StyledTableCell key={col.key ?? i} align={col.align || "left"}>
                                            {col.label ?? ""}
                                        </StyledTableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TablaBody 
                                filasPaginadas={filasPaginadas}
                                columnas={props.columnas}
                            />
                        </Table>
                    </TableContainer>
                    <Box sx={{ flexShrink: 0, mt: 'auto' }}>
                        <TablaPaginacion
                            habilitarPaginacion={habilitarPaginacion}
                            totalPages={totalPages}
                            page={page}
                            handlePageChange={handlePageChange}
                            rowsPerPage={rowsPerPageValue}
                            totalFilas={props.filas.length}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
