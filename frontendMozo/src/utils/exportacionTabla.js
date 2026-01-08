/**
 * Utilidades genéricas para exportar tablas a PDF y Excel
 * 
 * Este módulo proporciona funciones reutilizables para exportar cualquier tabla
 * del sistema a formatos PDF y Excel.
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Inicializar las fuentes de pdfmake
if (pdfMake && !pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
}

/**
 * Exporta una tabla a PDF
 * 
 * @param {Object} config - Configuración de la exportación
 * @param {Array} config.datos - Array de objetos con los datos de la tabla
 * @param {Array} config.columnas - Array de configuración de columnas { key, label, formatter }
 * @param {string} config.titulo - Título del documento
 * @param {string} [config.subtitulo] - Subtítulo del documento
 * @param {Array} [config.infoAdicional] - Array de objetos { label, value } para información adicional
 * @param {string} [config.nombreArchivo] - Nombre del archivo (sin extensión)
 * @param {Function} [config.formatearFila] - Función personalizada para formatear cada fila
 */
export const exportarTablaAPDF = async (config) => {
    try {
        const {
            datos,
            columnas,
            titulo,
            subtitulo,
            infoAdicional = [],
            nombreArchivo,
            formatearFila
        } = config;

        if (!datos || !Array.isArray(datos) || datos.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        if (!columnas || !Array.isArray(columnas) || columnas.length === 0) {
            alert('No hay columnas definidas para exportar.');
            return;
        }

        // Preparar encabezados de la tabla
        const headers = columnas.map(col => ({
            text: col.label || col.key || '',
            bold: true,
            fillColor: '#eeeeee',
            fontSize: 10
        }));

        // Preparar filas de datos
        const filas = datos.map(fila => {
            if (formatearFila && typeof formatearFila === 'function') {
                return formatearFila(fila, columnas);
            }

            // Formateo por defecto
            return columnas.map(col => {
                let valor = fila[col.key];

                // Aplicar formatter personalizado si existe
                if (col.formatter && typeof col.formatter === 'function') {
                    valor = col.formatter(valor, fila);
                } else if (valor === null || valor === undefined) {
                    valor = '';
                } else if (typeof valor === 'number') {
                    valor = valor.toString();
                } else {
                    valor = String(valor);
                }

                return {
                    text: valor,
                    fontSize: 9
                };
            });
        });

        // Construir contenido del PDF
        const contenido = [
            { text: titulo || 'Exportación de Tabla', style: 'header' },
            ...(subtitulo ? [{ text: subtitulo, style: 'subheader' }] : []),
            ...(infoAdicional.length > 0 ? [
                { text: '', margin: [0, 5, 0, 5] },
                ...infoAdicional.map(info => ({
                    text: `${info.label}: ${info.value}`,
                    margin: [0, 0, 0, 5],
                    fontSize: 10
                }))
            ] : []),
            { text: '', margin: [0, 10, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: columnas.map(() => 'auto'), // Ancho automático, se puede personalizar
                    body: [headers, ...filas]
                },
                layout: 'lightHorizontalLines'
            }
        ];

        const docDefinition = {
            content: contenido,
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    color: '#1976d2',
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 12,
                    color: '#666666',
                    margin: [0, 5, 0, 5]
                }
            },
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            }
        };

        const nombre = nombreArchivo || `exportacion_${new Date().toISOString().split('T')[0]}`;
        pdfMake.createPdf(docDefinition).download(`${nombre}.pdf`);
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
        alert(`Error al exportar a PDF: ${error.message || 'Error desconocido'}\n\nPor favor, verifica que pdfmake esté correctamente instalado.`);
        throw error;
    }
};

/**
 * Exporta una tabla a Excel
 * 
 * @param {Object} config - Configuración de la exportación
 * @param {Array} config.datos - Array de objetos con los datos de la tabla
 * @param {Array} config.columnas - Array de configuración de columnas { key, label, formatter }
 * @param {string} config.titulo - Título del documento
 * @param {string} [config.subtitulo] - Subtítulo del documento
 * @param {Array} [config.infoAdicional] - Array de objetos { label, value } para información adicional
 * @param {string} [config.nombreArchivo] - Nombre del archivo (sin extensión)
 * @param {Function} [config.formatearFila] - Función personalizada para formatear cada fila
 */
export const exportarTablaAExcel = async (config) => {
    try {
        // Importar xlsx dinámicamente
        const XLSX = await import('xlsx').catch(error => {
            console.error('Error al importar xlsx:', error);
            alert('La funcionalidad de exportación a Excel requiere instalar la dependencia xlsx.\n\nPor favor, ejecuta en la terminal:\nnpm install xlsx');
            throw new Error('xlsx no está instalado.');
        });

        const {
            datos,
            columnas,
            titulo,
            subtitulo,
            infoAdicional = [],
            nombreArchivo,
            formatearFila
        } = config;

        if (!datos || !Array.isArray(datos) || datos.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        if (!columnas || !Array.isArray(columnas) || columnas.length === 0) {
            alert('No hay columnas definidas para exportar.');
            return;
        }

        // Crear workbook
        const wb = XLSX.utils.book_new();

        // Preparar datos para la hoja de información (si hay info adicional)
        if (infoAdicional.length > 0 || titulo || subtitulo) {
            const infoData = [];
            if (titulo) infoData.push([titulo]);
            if (subtitulo) infoData.push([subtitulo]);
            if (infoAdicional.length > 0) {
                infoData.push(['']); // Línea vacía
                infoAdicional.forEach(info => {
                    infoData.push([info.label, info.value]);
                });
            }

            const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
            XLSX.utils.book_append_sheet(wb, wsInfo, 'Información');
        }

        // Preparar datos para la hoja de datos
        const headers = columnas.map(col => col.label || col.key || '');
        
        const filas = datos.map(fila => {
            if (formatearFila && typeof formatearFila === 'function') {
                return formatearFila(fila, columnas);
            }

            // Formateo por defecto
            return columnas.map(col => {
                let valor = fila[col.key];

                // Aplicar formatter personalizado si existe
                if (col.formatter && typeof col.formatter === 'function') {
                    valor = col.formatter(valor, fila);
                } else if (valor === null || valor === undefined) {
                    valor = '';
                }

                // Para Excel, mantener números como números
                return valor;
            });
        });

        // Crear hoja de datos con headers
        const datosConHeaders = [headers, ...filas];
        const ws = XLSX.utils.aoa_to_sheet(datosConHeaders);

        // Ajustar ancho de columnas (opcional, se puede personalizar)
        const colWidths = columnas.map(() => ({ wch: 20 })); // Ancho por defecto
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Datos');

        const nombre = nombreArchivo || `exportacion_${new Date().toISOString().split('T')[0]}`;
        XLSX.writeFile(wb, `${nombre}.xlsx`);
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        if (!error.message || !error.message.includes('xlsx no está instalado')) {
            alert('Error al exportar a Excel. Por favor, verifica la consola para más detalles.');
        }
        throw error;
    }
};

