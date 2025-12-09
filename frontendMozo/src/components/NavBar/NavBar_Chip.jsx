import React from "react";
import { Box } from "@mui/material";
import { GetChipNombreCompleto } from '../../Helpers/HelperFunctions';

const chip = GetChipNombreCompleto();

function NavBar_Chip(props) {
    if (!props.logeado) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {chip}
        </Box>
    );
}

export default NavBar_Chip;
