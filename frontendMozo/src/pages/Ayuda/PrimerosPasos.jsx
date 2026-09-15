import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { Link } from 'react-router-dom';
import InstalarImpresion from './componentes/InstalarImpresion';
import EstadoQz from '../../components/impresion/EstadoQz';

export default function PrimerosPasos() {
    return <Stack spacing={4} sx={{ maxWidth: 1100, mx: 'auto', pb: 5 }}>
        <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>Primeros pasos</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
                Prepará BarMaster para empezar a trabajar. Acá vas a encontrar los pasos de configuración inicial y podés volver a consultarlos cuando lo necesites.
            </Typography>
        </Box>
        <Stack component="section" aria-labelledby="preparar-impresion" spacing={2}>
            <Box>
                <Typography variant="overline" color="primary" fontWeight={700}>Paso 1</Typography>
                <Typography id="preparar-impresion" component="h2" variant="h5" fontWeight={700}>Configurar la impresión</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Si tenés una o más impresoras conectadas a esta PC, tenés que descargar el programa de abajo.
                </Typography>
            </Box>
            <EstadoQz />
            <InstalarImpresion />
            <Typography color="text.secondary">
                Cuando termine la instalación, <b>reiniciá la página</b>. Después abrí Impresiones, presioná Buscar y elegí los destinos en Impresión automática.
            </Typography>
            <Button component={Link} to="/impresiones" variant="contained" endIcon={<ArrowForwardOutlinedIcon />} sx={{ alignSelf: 'flex-start' }}>
                Configurar impresoras
            </Button>
        </Stack>
    </Stack>;
}
