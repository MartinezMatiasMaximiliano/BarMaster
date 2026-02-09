import { memo } from 'react';
import { Box } from '@mui/material';
import Lista_Items from '../../../Listas/Lista_Items';

/**
 * Componente memoizado para el contenido de cada tab
 * Optimizado para evitar re-renders innecesarios
 */
const TabContent = memo(({ visitaMesa, estado, titulo, subtitulo, PagarMesa, facturar, mostrarCheckboxes, productosSeleccionados, onToggleProducto, currencyFormatter }) => {
    return (
        <Box
            sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2,
                bgcolor: estado === false ? 'background.default' : 'transparent',
                minHeight: '25vh',
                ...(mostrarCheckboxes && {
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: '25vh'
                })
            }}
        >
            <Lista_Items
                visitaMesa={visitaMesa}
                titulo={titulo}
                subtitulo={subtitulo}
                estado={estado}
                PagarMesa={PagarMesa}
                facturar={facturar}
                mostrarCheckboxes={mostrarCheckboxes}
                productosSeleccionados={productosSeleccionados}
                onToggleProducto={onToggleProducto}
                currencyFormatter={currencyFormatter}
            />
        </Box>
    );
}, (prevProps, nextProps) => {
    // Comparación optimizada para evitar re-renders innecesarios
    if (prevProps.estado !== nextProps.estado ||
        prevProps.titulo !== nextProps.titulo ||
        prevProps.subtitulo !== nextProps.subtitulo ||
        prevProps.facturar !== nextProps.facturar ||
        prevProps.PagarMesa !== nextProps.PagarMesa ||
        prevProps.mostrarCheckboxes !== nextProps.mostrarCheckboxes ||
        prevProps.productosSeleccionados !== nextProps.productosSeleccionados ||
        prevProps.onToggleProducto !== nextProps.onToggleProducto ||
        prevProps.currencyFormatter !== nextProps.currencyFormatter) {
        return false;
    }
    
    // Comparación optimizada de visitaMesa
    if (prevProps.visitaMesa === nextProps.visitaMesa) {
        return true;
    }
    
    const prevProductos = prevProps.visitaMesa?.productosConsumidos;
    const nextProductos = nextProps.visitaMesa?.productosConsumidos;
    
    if (!prevProductos || !nextProductos) {
        return prevProductos === nextProductos;
    }
    
    if (prevProductos.length !== nextProductos.length) {
        return false;
    }
    
    // Comparación optimizada: solo verificar primeros y últimos productos
    // en lugar de crear strings completos (más eficiente)
    if (prevProductos.length > 0) {
        const firstPrev = prevProductos[0];
        const firstNext = nextProductos[0];
        const lastPrev = prevProductos[prevProductos.length - 1];
        const lastNext = nextProductos[nextProductos.length - 1];
        
        if (firstPrev.id !== firstNext.id || 
            firstPrev.estadoPagado !== firstNext.estadoPagado ||
            lastPrev.id !== lastNext.id || 
            lastPrev.estadoPagado !== lastNext.estadoPagado) {
            return false;
        }
    }
    
    return true;
});

TabContent.displayName = 'TabContent';

export default TabContent;

