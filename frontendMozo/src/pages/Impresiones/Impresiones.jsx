import { Box, Divider, Stack, Typography } from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import HistoryIcon from '@mui/icons-material/History';
import EncontrarImpresoras from './componentes/EncontrarImpresoras';
import ReglasImpresion from './componentes/ReglasImpresion';
import EstadoImpresiones from './componentes/EstadoImpresiones';

function TituloSeccion({ numero, icono, titulo, descripcion }) {
    return <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {icono}
        </Box>
        <Box>
            <Typography variant="overline" color="primary" fontWeight={700}>Paso {numero}</Typography>
            <Typography variant="h5" fontWeight={700}>{titulo}</Typography>
            <Typography color="text.secondary">{descripcion}</Typography>
        </Box>
    </Stack>;
}

export default function Impresiones() {
    return <Stack spacing={4} sx={{ maxWidth: 1100, mx: 'auto', pb: 5 }}>
        <Box>
            <Typography variant="h4" fontWeight={700}>Impresiones</Typography>
            <Typography color="text.secondary">Encontrá las impresoras, definí qué debe imprimir cada una y controlá los trabajos enviados.</Typography>
        </Box>

        <Stack component="section" spacing={3}>
            <TituloSeccion numero="1" icono={<PrintOutlinedIcon />} titulo="Encontrar impresoras" descripcion="Buscá las impresoras de este equipo y asignales un nombre fácil de reconocer." />
            <EncontrarImpresoras integrada />
        </Stack>

        <Divider />

        <Stack component="section" spacing={3}>
            <TituloSeccion numero="2" icono={<RuleOutlinedIcon />} titulo="Reglas de impresión" descripcion="Elegí la impresora, qué se imprime y en qué momento debe imprimirse." />
            <ReglasImpresion integrada />
        </Stack>

        <Divider />

        <Stack component="section" spacing={3}>
            <TituloSeccion numero="3" icono={<HistoryIcon />} titulo="Estado de impresiones" descripcion="Consultá el estado de cada trabajo y cancelá o rehacé los que necesiten intervención." />
            <EstadoImpresiones integrada />
        </Stack>
    </Stack>;
}
