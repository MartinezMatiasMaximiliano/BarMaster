import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (!pdfMake.vfs) pdfMake.vfs = pdfFonts.vfs;

export function createPixelTestPdfBase64() {
    return new Promise((resolve) => {
        pdfMake.createPdf({
            pageSize: { width: 226.77, height: 340 },
            pageMargins: [12, 12, 12, 12],
            content: [
                { text: 'BarMaster', alignment: 'center', bold: true, fontSize: 16 },
                { text: 'Prueba de impresión QZ pixel', alignment: 'center', margin: [0, 8] },
                { text: new Date().toLocaleString('es-AR'), alignment: 'center' },
            ],
            defaultStyle: { fontSize: 9 },
        }).getBase64(resolve);
    });
}

export function createPixelTestPngBase64() {
    const canvas = document.createElement('canvas');
    canvas.width = 576;
    canvas.height = 360;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no pudo crear la imagen de prueba.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.font = 'bold 42px sans-serif';
    context.fillText('BarMaster', canvas.width / 2, 90);
    context.font = '28px sans-serif';
    context.fillText('Prueba QZ pixel PNG', canvas.width / 2, 155);
    context.font = '22px sans-serif';
    context.fillText(new Date().toLocaleString('es-AR'), canvas.width / 2, 215);
    context.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
    return canvas.toDataURL('image/png').split(',', 2)[1];
}
