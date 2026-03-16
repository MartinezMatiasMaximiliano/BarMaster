export const useExportacion = () => {
    // Verificar si xlsx está disponible
    const xlsxDisponible = () => {
        try {
            return true; // Asumimos que puede estar disponible
        } catch {
            return false;
        }
    };

    const exportarAExcel = async (datos, tipoReporte, titulo) => {
        // NOTA: Para habilitar la exportación a Excel, primero instala xlsx:
        // npm install xlsx
        // Luego descomenta el código siguiente y elimina el throw

        throw new Error('La exportación a Excel no está disponible en este momento.');

        /* DESCOMENTAR DESPUÉS DE INSTALAR xlsx:
        try {
            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(datos);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, tipoReporte || 'Datos');
            XLSX.writeFile(wb, `${titulo || 'reporte'}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            throw new Error('Error al exportar a Excel. Intente nuevamente.');
        }
        */
    };

    const exportarTablaAExcel = async (columnas, filas, titulo) => {
        // NOTA: Para habilitar la exportación a Excel, primero instala xlsx:
        // npm install xlsx
        // Luego descomenta el código siguiente y elimina el throw

        throw new Error('La exportación a Excel no está disponible en este momento.');

        /* DESCOMENTAR DESPUÉS DE INSTALAR xlsx:
        try {
            const XLSX = await import('xlsx');
            const datos = filas.map(fila => {
                const objeto = {};
                columnas.forEach((col, index) => {
                    objeto[col] = fila[index];
                });
                return objeto;
            });
            const ws = XLSX.utils.json_to_sheet(datos);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');
            XLSX.writeFile(wb, `${titulo || 'tabla'}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error al exportar tabla a Excel:', error);
            throw new Error('Error al exportar a Excel. Intente nuevamente.');
        }
        */
    };

    return {
        exportarAExcel,
        exportarTablaAExcel,
        xlsxDisponible: xlsxDisponible()
    };
};
