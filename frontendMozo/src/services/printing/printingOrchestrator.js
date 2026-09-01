import { ensureCurrentStationRegistered, fetchAssignments } from './printingApi';
import { buildPreticketRaw } from './preticketFormatter';
import { printRaw } from './qzPrint';
import { readCachedAssignments } from './stationStorage';

async function resolveAssignment(role) {
    let assignments = readCachedAssignments();
    let assignment = assignments.find((item) => item.role === role && item.enabled);
    if (!assignment) {
        await ensureCurrentStationRegistered();
        assignments = await fetchAssignments();
        assignment = assignments.find((item) => item.role === role && item.enabled);
    }
    if (!assignment) throw new Error('PRINTER_NOT_CONFIGURED');
    return assignment;
}

export async function printPreticket(document) {
    const assignment = await resolveAssignment('Preticket');
    if (assignment.format !== 'Raw') throw new Error('PRETICKET_REQUIRES_RAW');
    const raw = buildPreticketRaw({ ...document, paperWidthMm: assignment.paperWidthMm });
    await printRaw(assignment.qzPrinterName, raw, {
        copies: assignment.copies,
        jobName: `BarMaster Preticket ${document.tableName || ''}`.trim(),
    });
}
