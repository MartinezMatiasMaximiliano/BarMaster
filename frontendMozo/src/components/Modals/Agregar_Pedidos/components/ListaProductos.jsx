import { Box } from '@mui/material';
import { ProductoCard } from './ProductoCard';

export const ListaProductos = ({ productos, onAgregarProducto }) => {
    return (
        <Box
            sx={{
                width: '100%',
                minWidth: 0,
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 1,
                contain: 'layout style paint',
                willChange: 'scroll-position',
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)'
                },
                gap: 2
            }}
        >
            {productos.map((producto) => (
                <Box key={producto.id} sx={{ height: 240, minWidth: 0, contentVisibility: 'auto' }}>
                    <ProductoCard 
                        producto={producto} 
                        onAgregar={onAgregarProducto}
                    />
                </Box>
            ))}
        </Box>
    );
};

