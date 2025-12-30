// hooks/useLogoutHandlers.js
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContext, AuthTypeContext } from '../../../App';
import { handleConfirmarSalir } from '../../../Helpers/HelperFunctions';

/**
 * Hook para manejar los handlers de logout y confirmación
 * @returns {Object} { openConfirmDialog, handleAbrirConfirmacion, handleCerrarConfirmacion, handleConfirmarSalirClick }
 */
export const useLogoutHandlers = () => {
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const handleAbrirConfirmacion = () => {
        setOpenConfirmDialog(true);
    };

    const handleCerrarConfirmacion = () => {
        setOpenConfirmDialog(false);
    };

    const handleConfirmarSalirClick = () => {
        handleConfirmarSalir(loginContext, authTypeContext, setOpenConfirmDialog, navigate);
    };

    return {
        openConfirmDialog,
        handleAbrirConfirmacion,
        handleCerrarConfirmacion,
        handleConfirmarSalirClick
    };
};

