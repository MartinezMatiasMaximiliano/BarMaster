import { Box, Card, CardContent, CardHeader, Divider, Table, TableContainer, TableHead, TableRow } from "@mui/material";
import { StyledTableCell } from "./Tabla.styles";
import { usePaginacion } from "./usePaginacion";
import TablaHeader from "./TablaHeader";
import TablaBody from "./TablaBody";
import TablaPaginacion from "./TablaPaginacion";
import TablaFiltros from "./TablaFiltros";
import { useExportacionTabla } from "../../hooks/useExportacionTabla";
import { useMemo } from "react";

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
 * @param {Function} [props.onExportarPDF] - Función personalizada para exportar a PDF (opcional, se genera automáticamente si no se proporciona)
 * @param {Function} [props.onExportarExcel] - Función personalizada para exportar a Excel (opcional, se genera automáticamente si no se proporciona)
 * @param {boolean} [props.deshabilitarExportacion] - Si las exportaciones están deshabilitadas
 * @param {boolean} [props.mostrarExportacion] - Si se deben mostrar los botones de exportación (por defecto true, solo se ocultan si se pasa false explícitamente)
 * @param {Object} [props.exportacionConfig] - Configuración personalizada para exportación (opcional)
 */
export default function Tabla(props) {
    const rowsPerPage = props.rowsPerPage || 10;
    const habilitarPaginacion = props.paginacion !== false;
    const minHeightContenido = props.minHeightContenido || '80vh';
    const ajustarAlturaAlContenido = props.ajustarAlturaAlContenido === true;
    // Los botones se muestran siempre por defecto, solo se ocultan si mostrarExportacion es explícitamente false
    const mostrarExportacion = props.mostrarExportacion === undefined ? true : props.mostrarExportacion;

    const {
        filasPaginadas,
        page,
        totalPages,
        handlePageChange,
        rowsPerPage: rowsPerPageValue
    } = usePaginacion(props.filas, rowsPerPage, habilitarPaginacion);

    // Filtrar columnas para exportación (excluir solo acciones)
    const columnasExportacion = useMemo(() => {
        return props.columnas.filter(col => {
            // Excluir solo columnas de acciones
            if (col.key === '__acciones' || col.key === 'acciones') {
                return false;
            }
            return true;
        }).map(col => ({
            key: col.key,
            label: col.label || col.key || '',
            formatter: col.formatter // Mantener formatters si existen
        }));
    }, [props.columnas]);

    // Filtrar filas para exportación (excluir filas de grupo)
    const filasParaExportar = useMemo(() => {
        return props.filas.filter(fila => !fila.esGrupo);
    }, [props.filas]);

    // Configurar exportación automática si no se proporcionan funciones personalizadas
    const configExportacion = useMemo(() => {
        if (props.exportacionConfig) {
            return {
                ...props.exportacionConfig,
                datos: props.exportacionConfig.datos || filasParaExportar,
                columnas: props.exportacionConfig.columnas || columnasExportacion
            };
        }
        return {
            datos: filasParaExportar,
            columnas: columnasExportacion,
            titulo: props.titulo || 'Exportación de Tabla',
            subtitulo: `Total de registros: ${filasParaExportar.length}`,
            infoAdicional: [
                { label: 'Fecha de exportación', value: new Date().toLocaleDateString('es-AR') }
            ],
            nombreArchivo: `${(props.titulo || 'tabla').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
        };
    }, [filasParaExportar, columnasExportacion, props.titulo, props.exportacionConfig]);

    // Configurar exportación (siempre se inicializa, pero solo se usa si mostrarExportacion es true)
    const { handleExportarPDF: handleExportarPDFAuto, handleExportarExcel: handleExportarExcelAuto } = useExportacionTabla(configExportacion);

    // Usar funciones personalizadas si se proporcionan, sino usar las automáticas (solo si mostrarExportacion es true)
    const handleExportarPDF = mostrarExportacion ? (props.onExportarPDF || handleExportarPDFAuto) : null;
    const handleExportarExcel = mostrarExportacion ? (props.onExportarExcel || handleExportarExcelAuto) : null;

    const getTableContainerStyles = () => {
        if (habilitarPaginacion) {
            if (ajustarAlturaAlContenido) {
                return {
                    overflowY: "auto",
                };
            }
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
                            onExportarPDF={mostrarExportacion ? handleExportarPDF : null}
                            onExportarExcel={mostrarExportacion ? handleExportarExcel : null}
                            deshabilitarExportacion={props.deshabilitarExportacion !== undefined ? props.deshabilitarExportacion : props.filas.length === 0}
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
                        ...(habilitarPaginacion && !ajustarAlturaAlContenido && {
                            minHeight: minHeightContenido,
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
                                onRowClick={props.onRowClick}
                                getRowSx={props.getRowSx}
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
