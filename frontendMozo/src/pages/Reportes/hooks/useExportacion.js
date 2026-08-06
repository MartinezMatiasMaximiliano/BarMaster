import { exportarTablaAExcel as exportarTablaAExcelGenerica } from '../../../utils/exportacionTabla';

export const useExportacion = () => {
    const exportarAExcel = async (datos, tipoReporte, titulo) => {
        const columnas = Object.keys(datos?.[0] ?? {}).map((key) => ({
            key,
            label: key,
        }));

        await exportarTablaAExcelGenerica({
            datos,
            columnas,
            titulo: tipoReporte || titulo || 'Reporte',
            nombreArchivo: `${titulo || 'reporte'}_${new Date().toISOString().split('T')[0]}`,
        });
    };

    const exportarTablaAExcel = async (columnas, filas, titulo) => {
        const columnasExportacion = columnas.map((columna, index) => ({
            key: String(index),
            label: columna,
        }));

        const datos = filas.map((fila) => {
            const item = {};
            columnas.forEach((_, index) => {
                item[String(index)] = fila[index];
            });
            return item;
        });

        await exportarTablaAExcelGenerica({
            datos,
            columnas: columnasExportacion,
            titulo: titulo || 'Tabla',
            nombreArchivo: `${titulo || 'tabla'}_${new Date().toISOString().split('T')[0]}`,
        });
    };

    return {
        exportarAExcel,
        exportarTablaAExcel,
        excelDisponible: true,
    };
};
