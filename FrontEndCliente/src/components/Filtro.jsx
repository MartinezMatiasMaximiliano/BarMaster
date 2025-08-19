import React, { useState } from "react"
import { Chip } from "@mui/material";

function Filtro(props) {
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');

    const handleClick = (e) => {
        setBackgroundColor(prev => prev === '#ffe4e1' ? '#ffffff' : '#ffe4e1');
        props.handleFiltrosActivos(props.valor); // Se encarga de agregar filtros activos o quitarlos si ya están
    };

  

    return (
        <Chip
            key={props.clave}
            onClick={handleClick}
            label={props.valor}
            value={props.value}
            sx={{
                backgroundColor: backgroundColor,
                color: "#d32f2f",
                borderColor: "#ffe4e1",
                fontWeight: "bold",
                borderRadius: 3,
            }}
            variant="outlined"
        />
    );
}

export default Filtro;
