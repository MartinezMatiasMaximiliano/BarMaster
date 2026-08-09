import { Box } from "@mui/material";
import { GetChipNombreCompleto } from '../../Helpers/HelperFunctions';
import { ModificarPersonaje } from '../../API/APIPersonas';
import { guardarPersonaje } from '../PersonajeSelector';
import { authService } from '../../services/authService';

function NavBar_Chip(props) {
    if (!props.logeado) {
        return null;
    }

    const cambiarPersonaje = async (personajeId) => {
        const idPersona = localStorage.getItem('USER_id')
            || authService.decodeToken(localStorage.getItem('USER_token'))?.IdPersona;

        if (!idPersona) {
            throw new Error('No se pudo identificar al usuario logueado.');
        }

        const resultado = await ModificarPersonaje(idPersona, personajeId);
        const personajeGuardado = resultado?.personajeId ?? personajeId;
        guardarPersonaje('USER_personaje', personajeGuardado);
        return resultado;
    };

    const chip = GetChipNombreCompleto(
        undefined,
        undefined,
        localStorage.getItem('USER_personaje'),
        {
            editable: true,
            esUsuarioLogueado: true,
            onPersonajeChange: cambiarPersonaje,
        }
    );

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {chip}
        </Box>
    );
}

export default NavBar_Chip;
