import React from 'react';

export const MesasGrid = ({ mesas }) => {
    if (!Array.isArray(mesas) || mesas.length === 0) {
        return null;
    }

    return (
        <div className="row pt-4 g-3">
            {mesas.map((mesa, i) => (
                <div className="col-6 col-md-4 col-lg-3 d-flex justify-content-center" key={i}>
                    {mesa}
                </div>
            ))}
        </div>
    );
};

