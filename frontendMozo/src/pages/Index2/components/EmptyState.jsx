// components/EmptyState.jsx
import React from 'react';

/**
 * Componente para mostrar el estado vacío cuando no hay mesas
 */
export const EmptyState = () => {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(98vh - 80px)' 
        }}>
            <p>No hay mesas disponibles para este plano</p>
        </div>
    );
};

