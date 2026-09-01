import qz from './qzClient';
import { requirePrinter } from './qzPrinters';

function createConfig(printerName, options = {}) {
    const config = {
        copies: options.copies ?? 1,
        jobName: options.jobName ?? 'BarMaster',
        encoding: options.encoding ?? 'CP858',
    };
    if (options.size !== undefined) config.size = options.size;
    if (options.margins !== undefined) config.margins = options.margins;
    return qz.configs.create(printerName, config);
}

export async function printRaw(printerName, rawData, options = {}) {
    await requirePrinter(printerName);
    const config = createConfig(printerName, options);
    return qz.print(config, [{ type: 'raw', format: 'plain', data: rawData }]);
}

export async function printPdfBase64(printerName, pdfBase64, options = {}) {
    await requirePrinter(printerName);
    const config = createConfig(printerName, options);
    return qz.print(config, [{ type: 'pixel', format: 'pdf', flavor: 'base64', data: pdfBase64 }]);
}

export async function printPngBase64(printerName, pngBase64, options = {}) {
    await requirePrinter(printerName);
    const config = createConfig(printerName, options);
    return qz.print(config, [{ type: 'pixel', format: 'image', flavor: 'base64', data: pngBase64 }]);
}
