import { useCallback, useEffect, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import EncontrarImpresoras from './componentes/EncontrarImpresoras';
import ReglasImpresion from './componentes/ReglasImpresion';
import { ObtenerCajaActiva } from '../../API/APICaja';
import EstadoQz from '../../components/impresion/EstadoQz';

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
    const [versionImpresoras, establecerVersionImpresoras] = useState(0);
    const actualizarDestinos = useCallback(() => establecerVersionImpresoras((version) => version + 1), []);
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
        <EstadoQz />
        <Stack component="section" spacing={3}>
            <EncontrarImpresoras
                integrada
                onImpresorasActualizadas={actualizarDestinos}
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
                versionImpresoras={versionImpresoras}
                bloqueadaPorCaja={configuracionBloqueada}
                encabezado={<TituloSeccion numero="2" icono={<RuleOutlinedIcon />} titulo="Impresión automática" descripcion="Elegí dónde imprimir las comandas, la cuenta previa y los comprobantes de pago." />}
            />
        </Stack>
    </Stack>;
}
