import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

export default function InstalarImpresion() {
    return <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            <Box>
                <Typography fontWeight={700}>Prepará este equipo para imprimir</Typography>
                <Typography color="text.secondary" variant="body2">
                    Para que BarMaster funcione correctamente, primero tenés que instalar este programa en cada estación que tenga una o más impresoras conectadas.
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                    Descargá y ejecutá el instalador.
                </Typography>
            </Box>
            <Button component="a" href={`${import.meta.env.BASE_URL}downloads/BarMaster-Impresion-Setup.exe`} download variant="outlined" startIcon={<DownloadOutlinedIcon />} sx={{ flexShrink: 0 }}>
                Descargar para Windows
            </Button>
        </Stack>
    </Paper>;
}
