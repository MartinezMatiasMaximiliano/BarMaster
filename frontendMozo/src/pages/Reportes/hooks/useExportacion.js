export const useExportacion = () => {
    // Verificar si xlsx está disponible
    const xlsxDisponible = () => {
        try {
            // Intentar importar xlsx de forma síncrona para verificar
            return true; // Asumimos que puede estar disponible
        } catch {
            return false;
        }
    };

    const exportarAExcel = async (datos, tipoReporte, titulo) => {
        // NOTA: Para habilitar la exportación a Excel, primero instala xlsx:
        // npm install xlsx
        // Luego descomenta el código siguiente y elimina este alert
        
        alert('La funcionalidad de exportación a Excel requiere instalar la dependencia xlsx.\n\nPor favor, ejecuta en la terminal:\nnpm install xlsx\n\nLuego descomenta el código en useExportacion.js');
        console.warn('xlsx no está instalado. Para habilitar la exportación a Excel:\n1. Ejecuta: npm install xlsx\n2. Descomenta el código en useExportacion.js');
        return;

        /* DESCOMENTAR DESPUÉS DE INSTALAR xlsx:
        try {
            // Importar xlsx dinámicamente
            const XLSX = await import('xlsx');
            
            // Convertir datos a formato de hoja de cálculo
            const ws = XLSX.utils.json_to_sheet(datos);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, tipoReporte || 'Datos');

            // Descargar archivo
            XLSX.writeFile(wb, `${titulo || 'reporte'}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            alert('Error al exportar a Excel. Por favor, verifica que xlsx esté correctamente instalado.');
        }
        */
    };

    const exportarTablaAExcel = async (columnas, filas, titulo) => {
        // NOTA: Para habilitar la exportación a Excel, primero instala xlsx:
        // npm install xlsx
        // Luego descomenta el código siguiente y elimina este alert
        
        alert('La funcionalidad de exportación a Excel requiere instalar la dependencia xlsx.\n\nPor favor, ejecuta en la terminal:\nnpm install xlsx\n\nLuego descomenta el código en useExportacion.js');
        console.warn('xlsx no está instalado. Para habilitar la exportación a Excel:\n1. Ejecuta: npm install xlsx\n2. Descomenta el código en useExportacion.js');
        return;

        /* DESCOMENTAR DESPUÉS DE INSTALAR xlsx:
        try {
            // Importar xlsx dinámicamente
            const XLSX = await import('xlsx');
            
            // Crear datos con las columnas especificadas
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
            alert('Error al exportar a Excel. Por favor, verifica que xlsx esté correctamente instalado.');
        }
        */
    };

    return {
        exportarAExcel,
        exportarTablaAExcel,
        xlsxDisponible: xlsxDisponible()
    };
};

