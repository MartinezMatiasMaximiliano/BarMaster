import { useEffect, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import EncontrarImpresoras from './componentes/EncontrarImpresoras';
import ReglasImpresion from './componentes/ReglasImpresion';
import { ObtenerCajaActiva } from '../../API/APICaja';

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
    const [estadoCaja, establecerEstadoCaja] = useState({ cargando: true, activa: false, error: false });
    useEffect(() => {
        let montado = true;
        ObtenerCajaActiva()
            .then((caja) => {
                if (montado) establecerEstadoCaja({ cargando: false, activa: Boolean(caja), error: false });
            })
            .catch(() => {
                if (montado) establecerEstadoCaja({ cargando: false, activa: false, error: true });
            });
        return () => { montado = false; };
    }, []);
    const configuracionBloqueada = estadoCaja.cargando || estadoCaja.activa || estadoCaja.error;

    return <Stack spacing={4} sx={{ maxWidth: 1100, mx: 'auto', pb: 5 }}>
        <Stack component="section" spacing={3}>
            <EncontrarImpresoras
                integrada
                bloqueadaPorCaja={configuracionBloqueada}
                encabezadoPagina={<Box>
                    <Typography variant="h4" fontWeight={700}>Impresiones</Typography>
                    <Typography color="text.secondary">Encontrá las impresoras y definí qué debe imprimir cada una.</Typography>
                </Box>}
                encabezado={<TituloSeccion numero="1" icono={<PrintOutlinedIcon />} titulo="Buscar impresoras" descripcion="Buscá las impresoras de este equipo y asignales un nombre fácil de reconocer." />}
            />
        </Stack>

        <Divider />

        <Stack component="section" spacing={3}>
            <ReglasImpresion
                integrada
                bloqueadaPorCaja={configuracionBloqueada}
                encabezado={<TituloSeccion numero="2" icono={<RuleOutlinedIcon />} titulo="Reglas de impresión" descripcion="Elegí la impresora, qué se imprime y en qué momento debe imprimirse." />}
            />
        </Stack>
    </Stack>;
}
