import { useCallback } from 'react';
import { exportarTablaAPDF, exportarTablaAExcel } from '../utils/exportacionTabla';

/**
 * Hook reutilizable para facilitar la exportación de tablas
 * 
 * @param {Object} config
 * @param {Array} config.datos - Datos de la tabla a exportar
 * @param {Array} config.columnas - Configuración de columnas
 * @param {string} config.titulo - Título del documento
 * @param {string} [config.subtitulo] - Subtítulo del documento
 * @param {Array} [config.infoAdicional] - Información adicional a mostrar
 * @param {string} [config.nombreArchivo] - Nombre del archivo (sin extensión)
 * @param {Function} [config.formatearFila] - Función personalizada para formatear filas
 * 
 * @returns {Object} Objeto con funciones handleExportarPDF y handleExportarExcel
 */
export const useExportacionTabla = (config) => {
    const handleExportarPDF = useCallback(async () => {
        try {
            await exportarTablaAPDF(config);
        } catch (error) {
            console.error('Error en handleExportarPDF:', error);
        }
    }, [config]);

    const handleExportarExcel = useCallback(async () => {
        try {
            await exportarTablaAExcel(config);
        } catch (error) {
            console.error('Error en handleExportarExcel:', error);
        }
    }, [config]);

    return {
        handleExportarPDF,
        handleExportarExcel
    };
};

