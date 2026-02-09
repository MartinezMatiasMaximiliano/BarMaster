// components/Mesa/MesaGridItem.jsx
import React, { forwardRef } from 'react';
import Mesa from './Mesa';

/**
 * Wrapper para el componente Mesa que permite trabajar dentro de react-grid-layout.
 * Este componente acepta y aplica las props que react-grid-layout proporciona
 * (style, className, onMouseDown, etc.) para mantener el layout correcto.
 */
const MesaGridItem = forwardRef(({
    style,
    className,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    datos_mesa,
    variant,
    mozo,
    hayCajaActiva = true,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            style={{
                ...style,
                boxSizing: 'border-box',
                overflow: 'hidden',
                display: 'flex',
            }}
            className={className}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
        >
            <Mesa
                datos_mesa={datos_mesa}
                variant={variant}
                mozo={mozo}
                hayCajaActiva={hayCajaActiva}
                estilo={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0 }}
                simpleStyle={true}
            />
        </div>
    );
});

MesaGridItem.displayName = 'MesaGridItem';

export default MesaGridItem;

