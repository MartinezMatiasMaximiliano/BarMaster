import qz from './qzClient';
import { connectQz } from './qzConnection';

export async function findPrinters() {
    await connectQz();
    const printers = await qz.printers.find();
    return [...printers].sort((a, b) => a.localeCompare(b));
}

export async function requirePrinter(printerName) {
    if (!printerName?.trim()) throw new Error('PRINTER_NOT_CONFIGURED');
    const printers = await findPrinters();
    if (!printers.includes(printerName)) throw new Error('PRINTER_NOT_FOUND');
    return printerName;
}
