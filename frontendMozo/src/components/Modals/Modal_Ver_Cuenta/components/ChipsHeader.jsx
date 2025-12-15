import { memo } from 'react';
import { Chip, Stack } from '@mui/material';

/**
 * Componente memoizado para mostrar los chips del header
 * Muestra código de pedido, cantidad de items y total
 */
const ChipsHeader = memo(({ codigoParaPedir, cantidadItems, totalPedidos, currencyFormatter }) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ px: 3, pt: 2, pb: 1 }}>
        {codigoParaPedir && (
            <Chip
                label={`Código: ${codigoParaPedir}`}
                color="warning"
                variant="outlined"
            />
        )}
        <Chip label={`Items: ${cantidadItems}`} variant="outlined" />
        <Chip
            label={`Total: ${currencyFormatter.format(totalPedidos)}`}
            color="primary"
        />
    </Stack>
), (prevProps, nextProps) => {
    return prevProps.codigoParaPedir === nextProps.codigoParaPedir &&
           prevProps.cantidadItems === nextProps.cantidadItems &&
           prevProps.totalPedidos === nextProps.totalPedidos;
});

ChipsHeader.displayName = 'ChipsHeader';

export default ChipsHeader;

