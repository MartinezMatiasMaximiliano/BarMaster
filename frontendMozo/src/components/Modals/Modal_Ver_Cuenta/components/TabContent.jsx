import { memo } from 'react';
import { Box } from '@mui/material';
import Lista_Items from '../../../Listas/Lista_Items';

/**
 * Componente memoizado para el contenido de cada tab
 * Optimizado para evitar re-renders innecesarios
 */
const TabContent = memo(({ pedidosMesa, estado, titulo, subtitulo, PagarMesa, facturar }) => {
    return (
        <Box
            sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2,
                bgcolor: estado === false ? 'background.default' : 'transparent',
                minHeight: 200
            }}
        >
            <Lista_Items
                pedidosMesa={pedidosMesa}
                titulo={titulo}
                subtitulo={subtitulo}
                estado={estado}
                PagarMesa={PagarMesa}
                facturar={facturar}
            />
        </Box>
    );
}, (prevProps, nextProps) => {
    // Comparación optimizada para evitar re-renders innecesarios
    if (prevProps.estado !== nextProps.estado ||
        prevProps.titulo !== nextProps.titulo ||
        prevProps.subtitulo !== nextProps.subtitulo ||
        prevProps.facturar !== nextProps.facturar ||
        prevProps.PagarMesa !== nextProps.PagarMesa) {
        return false;
    }
    
    // Comparación optimizada de pedidosMesa
    if (prevProps.pedidosMesa === nextProps.pedidosMesa) {
        return true;
    }
    
    const prevItems = prevProps.pedidosMesa?.[0]?.items;
    const nextItems = nextProps.pedidosMesa?.[0]?.items;
    
    if (!prevItems || !nextItems) {
        return prevItems === nextItems;
    }
    
    if (prevItems.length !== nextItems.length) {
        return false;
    }
    
    // Comparación optimizada: solo verificar primeros y últimos items
    // en lugar de crear strings completos (más eficiente)
    if (prevItems.length > 0) {
        const firstPrev = prevItems[0];
        const firstNext = nextItems[0];
        const lastPrev = prevItems[prevItems.length - 1];
        const lastNext = nextItems[nextItems.length - 1];
        
        if (firstPrev.id !== firstNext.id || 
            firstPrev.estado !== firstNext.estado ||
            lastPrev.id !== lastNext.id || 
            lastPrev.estado !== lastNext.estado) {
            return false;
        }
    }
    
    return true;
});

TabContent.displayName = 'TabContent';

export default TabContent;

