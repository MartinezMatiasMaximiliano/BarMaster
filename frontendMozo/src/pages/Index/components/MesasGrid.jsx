import React from 'react';

export const MesasGrid = ({ mesas, hayCajaActiva }) => {
    if (!Array.isArray(mesas) || mesas.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                <p className="text-muted">No hay mesas disponibles</p>
            </div>
        );
    }

    return (
        <div className="bm-index-mesas-grid">
            {mesas.map((mesa, i) => (
                <div 
                    className="bm-index-mesa"
                    key={i}
                >
                    {mesa}
                </div>
            ))}
        </div>
    );
};

