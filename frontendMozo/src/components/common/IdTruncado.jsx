import { useState } from 'react';
import { Box, Button, ButtonBase, Popover, Typography } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

const copiarAlPortapapeles = async (texto) => {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(texto);
            return;
        } catch {
            // En conexiones HTTP fuera de localhost puede no estar disponible.
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    let copiado = false;
    try {
        copiado = document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }

    if (!copiado) {
        throw new Error('No se pudo copiar el identificador.');
    }
};

export default function IdTruncado({ value }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [estadoCopia, setEstadoCopia] = useState('idle');

    if (!value) return '-';

    const id = String(value);
    const valorCorto = id.length > 16
        ? `${id.slice(0, 8)}…${id.slice(-4)}`
        : id;

    const cerrarPopover = () => {
        setAnchorEl(null);
        setEstadoCopia('idle');
    };

    const copiarId = async () => {
        try {
            await copiarAlPortapapeles(id);
            setEstadoCopia('copiado');
        } catch {
            setEstadoCopia('error');
        }
    };

    return (
        <>
            <ButtonBase
                onClick={(event) => setAnchorEl(event.currentTarget)}
                aria-label="Ver identificador completo"
                sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'primary.main' }}
            >
                {valorCorto}
            </ButtonBase>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={cerrarPopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 1.5, maxWidth: 420 }}>
                    <Typography sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
                        {id}
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<ContentCopyOutlinedIcon />}
                        onClick={copiarId}
                        sx={{ mt: 1 }}
                    >
                        {estadoCopia === 'copiado'
                            ? 'Copiado'
                            : estadoCopia === 'error'
                                ? 'No se pudo copiar'
                                : 'Copiar'}
                    </Button>
                </Box>
            </Popover>
        </>
    );
}
