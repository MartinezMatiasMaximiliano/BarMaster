// components/Mesa/MesaButton.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBurger } from '@fortawesome/free-solid-svg-icons';

export const MesaButton = ({ numeroMesa, estilo, variant, onClick, disabled = false, prefix = "Mesa" }) => {
    return (
        <Button 
            className="boton-mesa mx-2" 
            style={estilo} 
            variant={variant}
            onClick={onClick}
            disabled={disabled}
        >
            <FontAwesomeIcon icon={faBurger} />
            <p>{prefix} {numeroMesa}</p>
        </Button>
    );
};