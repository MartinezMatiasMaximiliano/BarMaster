/**
 * Utilidades genéricas para exportar tablas a PDF y Excel
 *
 * Este módulo proporciona funciones reutilizables para exportar cualquier tabla
 * del sistema a formatos PDF y Excel.
 *
 * Las funciones lanzan errores con mensajes amigables para el usuario.
 * El caller (hook o componente) es responsable de mostrarlos al usuario.
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import writeExcelFile from 'write-excel-file/browser';
import { brandColors } from '../styles/brandTokens';

// Inicializar las fuentes de pdfmake
if (pdfMake && !pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
}

const normalizarValorExportacion = (valor) => {
    if (valor === null || valor === undefined) {
        return '';
    }

    if (Array.isArray(valor)) {
        return valor.map(item => String(item ?? '').trim()).filter(Boolean).join(', ');
    }

    return valor;
};

const protegerTextoParaExcel = (valor) => {
    if (typeof valor !== 'string') {
        return valor;
    }

    const texto = valor.trim();

    if (/^[=+\-@]/.test(texto)) {
        return `'${texto}`;
    }

    return valor;
};

const normalizarCeldaParaExcel = (valor) => {
    const valorNormalizado = normalizarValorExportacion(valor);

    if (
        typeof valorNormalizado === 'string' ||
        typeof valorNormalizado === 'number' ||
        typeof valorNormalizado === 'boolean' ||
        valorNormalizado instanceof Date
    ) {
        return protegerTextoParaExcel(valorNormalizado);
    }

    return protegerTextoParaExcel(String(valorNormalizado));
};

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
        throw new Error('No hay datos para exportar.');
    }

    if (!columnas || !Array.isArray(columnas) || columnas.length === 0) {
        throw new Error('No hay columnas definidas para exportar.');
    }

    try {
        // Preparar encabezados de la tabla
        const headers = columnas.map(col => ({
            text: col.label || col.key || '',
            bold: true,
            fillColor: brandColors.grey[6],
            fontSize: 10
        }));

        // Preparar filas de datos
        const filas = datos.map(fila => {
            if (formatearFila && typeof formatearFila === 'function') {
                return formatearFila(fila, columnas);
            }

            // Formateo por defecto
            return columnas.map(col => {
                let valor = normalizarValorExportacion(fila[col.key]);

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
                    color: brandColors.primary.dark,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 12,
                    color: brandColors.grey[3],
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
        throw new Error('Error al exportar a PDF. Intente nuevamente.');
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
        throw new Error('No hay datos para exportar.');
    }

    if (!columnas || !Array.isArray(columnas) || columnas.length === 0) {
        throw new Error('No hay columnas definidas para exportar.');
    }

    try {
        const headers = columnas.map(col => col.label || col.key || '');

        const filas = datos.map(fila => {
            if (formatearFila && typeof formatearFila === 'function') {
                return formatearFila(fila, columnas).map(normalizarCeldaParaExcel);
            }
            return columnas.map(col => {
                let valor = normalizarValorExportacion(fila[col.key]);

                if (col.formatter && typeof col.formatter === 'function') {
                    valor = col.formatter(valor, fila);
                }

                return normalizarCeldaParaExcel(valor);
            });
        });

        // Una sola hoja: título, subtítulo, info adicional, luego tabla.
        const todasLasFilas = [];
        if (titulo) todasLasFilas.push([titulo]);
        if (subtitulo) todasLasFilas.push([subtitulo]);
        if (infoAdicional.length > 0) {
            todasLasFilas.push(['']);
            infoAdicional.forEach(info => {
                todasLasFilas.push([info.label, info.value]);
            });
        }
        todasLasFilas.push(['']);
        todasLasFilas.push(headers);
        filas.forEach(fila => todasLasFilas.push(fila));

        const nombre = nombreArchivo || `exportacion_${new Date().toISOString().split('T')[0]}`;
        await writeExcelFile(todasLasFilas, {
            sheet: 'Datos',
            columns: columnas.map(() => ({ width: 20 }))
        }).toFile(`${nombre}.xlsx`);
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        throw new Error('Error al exportar a Excel. Intente nuevamente.');
    }
};
