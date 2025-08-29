import React from "react";
import { GetChipNombreCompleto } from '../../Helpers/HelperFunctions';

const chip = GetChipNombreCompleto();
function NavBar_Chip(props) {

    if (props.logeado) {
        return (
            <div className="mt-auto mb-3 d-flex justify-content-center">
                {chip}
            </div>
        )
    }
}

export default NavBar_Chip;
