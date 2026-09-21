import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const installer = fileURLToPath(new URL('../public/downloads/BarMaster-Impresion-Setup.exe', import.meta.url));
if (process.platform === 'win32') {
    const script = fileURLToPath(new URL('../tools/qz/windows/Build-PrintingSetup.ps1', import.meta.url));
    const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script], {
        stdio: 'inherit', windowsHide: true,
        // PowerShell 7 puede heredar rutas de módulos incompatibles con Windows PowerShell 5.1.
        env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toLowerCase() !== 'psmodulepath')),
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
} else if (!existsSync(installer)) {
    throw new Error('Falta el instalador de impresión. Generalo con frontendMozo/tools/qz/windows/Build-PrintingSetup.ps1 en Windows y copiá el artefacto a public/downloads antes de publicar.');
}
