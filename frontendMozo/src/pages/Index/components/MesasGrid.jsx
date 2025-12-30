import React from 'react';

export const MesasGrid = ({ mesas }) => {
    if (!Array.isArray(mesas) || mesas.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <p className="text-muted">No hay mesas disponibles</p>
            </div>
        );
    }

    return (
        <div className="row pt-4 g-3" style={{ margin: 0 }}>
            {mesas.map((mesa, i) => (
                <div 
                    className="col-6 col-md-4 col-lg-3 col-xl-2 d-flex justify-content-center" 
                    key={i}
                    style={{ padding: '8px' }}
                >
                    {mesa}
                </div>
            ))}
        </div>
    );
};

