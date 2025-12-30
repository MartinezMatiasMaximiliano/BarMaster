// components/LoadingState.jsx
import React from 'react';

/**
 * Componente para mostrar el estado de carga
 */
export const LoadingState = () => {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(98vh - 80px)' 
        }}>
            <p>Cargando mesas...</p>
        </div>
    );
};

