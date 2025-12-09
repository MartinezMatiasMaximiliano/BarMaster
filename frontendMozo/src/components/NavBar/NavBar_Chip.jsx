import React from "react";
import { Box } from "@mui/material";
import { GetChipNombreCompleto } from '../../Helpers/HelperFunctions';

function NavBar_Chip(props) {
    if (!props.logeado) {
        return null;
    }

    // Llamar a GetChipNombreCompleto dentro del componente para que lea los valores actuales de localStorage
    const chip = GetChipNombreCompleto();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {chip}
        </Box>
    );
}

export default NavBar_Chip;
