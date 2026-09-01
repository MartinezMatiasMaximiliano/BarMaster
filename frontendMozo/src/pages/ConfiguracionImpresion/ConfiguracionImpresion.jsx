import { useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Card, CardContent, CircularProgress, FormControl,
    InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { usePrinting } from '../../contexts/PrintingContext';
import {
    fetchAssignments, getQzHealth, getQzHealthDetails, registerCurrentStation, saveAssignment,
} from '../../services/printing/printingApi';
import { getClientInstallationId, getRegisteredStationId, readCachedAssignments } from '../../services/printing/stationStorage';
import { printPdfBase64, printPngBase64, printRaw } from '../../services/printing/qzPrint';
import { createPixelTestPdfBase64, createPixelTestPngBase64 } from '../../services/printing/pixelTestDocument';
import { normalizeQzError } from '../../services/printing/qzErrors';

const REQUIRED_QZ_VERSION = '2.2.6';
const DEFAULT_ASSIGNMENT = { role: 'Preticket', qzPrinterName: '', format: 'Raw', paperWidthMm: 80, copies: 1, enabled: true };

export default function ConfiguracionImpresion() {
    const printing = usePrinting();
    const [station, setStation] = useState(null);
    const [stationName, setStationName] = useState('');
    const [assignments, setAssignments] = useState(readCachedAssignments);
    const [form, setForm] = useState(DEFAULT_ASSIGNMENT);
    const [health, setHealth] = useState(null);
    const [healthDetails, setHealthDetails] = useState(null);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState(null);
    const installationId = useMemo(() => getClientInstallationId(), []);

    useEffect(() => {
        getQzHealth().then(setHealth).catch(() => setHealth(null));
        getQzHealthDetails().then(setHealthDetails).catch(() => setHealthDetails(null));
    }, []);

    useEffect(() => {
        const saved = assignments.find((item) => item.role === form.role);
        if (saved) setForm({ ...saved });
    }, [assignments, form.role]);

    const run = async (operation, successMessage) => {
        setBusy(true);
        setNotice(null);
        try {
            await operation();
            if (successMessage) setNotice({ severity: 'success', message: successMessage });
        } catch (error) {
            setNotice({ severity: 'error', message: normalizeQzError(error).message });
        } finally {
            setBusy(false);
        }
    };

    const connectAndRefresh = () => run(async () => {
        const registered = await registerCurrentStation(stationName);
        setStation(registered);
        await printing.connect();
        await printing.refreshPrinters();
        const currentAssignments = await fetchAssignments();
        setAssignments(currentAssignments);
    }, 'QZ Tray conectado e impresoras actualizadas.');

    const persistAssignment = () => run(async () => {
        const saved = await saveAssignment(form.role, {
            qzPrinterName: form.qzPrinterName,
            format: form.format,
            paperWidthMm: Number(form.paperWidthMm),
            copies: Number(form.copies),
            enabled: form.enabled,
        });
        const next = assignments.filter((item) => item.role !== saved.role).concat(saved);
        setAssignments(next);
    }, 'Asignación guardada.');

    const testRaw = () => run(() => printRaw(
        form.qzPrinterName,
        '\x1B@\x1Ba\x01BarMaster\nPrueba QZ raw\n\n\n\x1DV\x00',
        { copies: Number(form.copies), jobName: 'BarMaster QZ Raw Test' },
    ), 'Trabajo raw enviado.');

    const testPixel = () => run(async () => {
        const options = {
            copies: Number(form.copies),
            jobName: 'BarMaster QZ Pixel Test',
        };
        if (form.format === 'Png') {
            await printPngBase64(form.qzPrinterName, createPixelTestPngBase64(), options);
        } else {
            await printPdfBase64(form.qzPrinterName, await createPixelTestPdfBase64(), options);
        }
    }, 'Trabajo pixel enviado.');

    const copyDiagnostics = () => run(async () => {
        const diagnostics = {
            capturedAt: new Date().toISOString(),
            qzState: printing.state,
            qzVersion: printing.version,
            requiredQzVersion: REQUIRED_QZ_VERSION,
            signingReady: health?.ready ?? false,
            certificateExpiresAt: healthDetails?.notAfterUtc ?? null,
            clientInstallationId: installationId,
            registeredStationId: station?.id || getRegisteredStationId(),
            printers: printing.printers,
            lastError: printing.lastError?.code ?? null,
            browser: navigator.userAgent,
        };
        await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    }, 'Diagnóstico copiado sin credenciales ni claves privadas.');

    return (
        <Stack spacing={2} sx={{ maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h4">Configuración de impresión</Typography>
            {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}
            <Card><CardContent>
                <Stack spacing={1}>
                    <Typography variant="h6">Diagnóstico</Typography>
                    <Typography>Estado QZ: {printing.state}</Typography>
                    <Typography>Versión: {printing.version || 'no detectada'} / requerida {REQUIRED_QZ_VERSION}</Typography>
                    <Typography>Firmador: {health?.ready ? 'listo' : 'no disponible'}</Typography>
                    {healthDetails?.notAfterUtc && <Typography>Certificado vence: {new Date(healthDetails.notAfterUtc).toLocaleString('es-AR')}</Typography>}
                    <Typography>Instalación local: {installationId}</Typography>
                    <Typography>Estación registrada: {station?.id || getRegisteredStationId() || 'pendiente'}</Typography>
                    {printing.lastError && <Alert severity="warning">{printing.lastError.message}</Alert>}
                    <Alert severity="info">Si el navegador solicita acceso a aplicaciones o servicios del dispositivo, permitilo. Un fallo de conexión también puede deberse a QZ cerrado, HTTPS, proxy o antivirus.</Alert>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <TextField size="small" label="Nombre de estación" value={stationName} onChange={(event) => setStationName(event.target.value)} />
                        <Button variant="contained" onClick={connectAndRefresh} disabled={busy}>Conectar y actualizar</Button>
                        <Button onClick={() => printing.disconnect()} disabled={busy}>Desconectar</Button>
                        <Button onClick={copyDiagnostics} disabled={busy}>Copiar diagnóstico</Button>
                    </Stack>
                    {station && <Typography color="success.main">Registrada: {station.name}</Typography>}
                </Stack>
            </CardContent></Card>

            <Card><CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6">Asignación de impresora</Typography>
                    <FormControl fullWidth><InputLabel>Rol</InputLabel><Select label="Rol" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                        {['Preticket', 'PaymentReceipt', 'Kitchen', 'Bar'].map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                    </Select></FormControl>
                    <FormControl fullWidth><InputLabel>Impresora Windows</InputLabel><Select label="Impresora Windows" value={form.qzPrinterName} onChange={(event) => setForm({ ...form, qzPrinterName: event.target.value })}>
                        {printing.printers.map((printer) => <MenuItem key={printer} value={printer}>{printer}</MenuItem>)}
                    </Select></FormControl>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <FormControl fullWidth><InputLabel>Formato</InputLabel><Select label="Formato" value={form.format} onChange={(event) => setForm({ ...form, format: event.target.value })}>
                            {['Raw', 'Pdf', 'Png'].map((format) => <MenuItem key={format} value={format}>{format}</MenuItem>)}
                        </Select></FormControl>
                        <FormControl fullWidth><InputLabel>Ancho</InputLabel><Select label="Ancho" value={form.paperWidthMm} onChange={(event) => setForm({ ...form, paperWidthMm: event.target.value })}>
                            <MenuItem value={58}>58 mm</MenuItem><MenuItem value={80}>80 mm</MenuItem>
                        </Select></FormControl>
                        <TextField fullWidth type="number" label="Copias" inputProps={{ min: 1, max: 10 }} value={form.copies} onChange={(event) => setForm({ ...form, copies: event.target.value })} />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button variant="contained" onClick={persistAssignment} disabled={busy || !form.qzPrinterName}>Guardar</Button>
                        <Button onClick={testRaw} disabled={busy || !form.qzPrinterName}>Prueba raw</Button>
                        <Button onClick={testPixel} disabled={busy || !form.qzPrinterName}>Prueba pixel (PDF/PNG)</Button>
                        {busy && <CircularProgress size={24} />}
                    </Stack>
                    <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(assignments, null, 2)}</Box>
                </Stack>
            </CardContent></Card>
        </Stack>
    );
}
