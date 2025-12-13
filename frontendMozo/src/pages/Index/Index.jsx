import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { modificar as modificarCodigoMozo } from '../../redux/slices/codigoMozoSlice';
import { LoginContext, AuthTypeContext } from '../../App';
import { handleConfirmarSalir } from '../../Helpers/HelperFunctions';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { useMesaFiltering } from './hooks/useMesaFiltering.jsx';
import { useMozoCode } from './hooks/useMozoCode';
import { useDateTime } from './hooks/useDateTime';
import { MesasGrid } from './components/MesasGrid';
import { BottomBar } from './components/BottomBar';
import { ConfirmLogoutDialog } from './components/ConfirmLogoutDialog';

function Index(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);
    
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    
    const { inputRef } = useKeyboardInput();
    const { mesasParaMostrar } = useMesaFiltering(props.mesas, props.datos_mozos);
    const { codigoMozo, mozo } = useMozoCode(props.datos_mozos);
    const fechaHora = useDateTime();

    const handleChange = (event) => {
        dispatch(modificarCodigoMozo(event.target.value));
    };

    const handleAbrirConfirmacion = () => {
        setOpenConfirmDialog(true);
    };

    const handleCerrarConfirmacion = () => {
        setOpenConfirmDialog(false);
    };

    const handleConfirmarSalirClick = () => {
        handleConfirmarSalir(loginContext, authTypeContext, setOpenConfirmDialog, navigate);
    };

    return (
        <Container className="position-relative" style={{ height: "98vh" }}>
            <MesasGrid mesas={mesasParaMostrar} />
            
            <BottomBar
                inputRef={inputRef}
                codigoMozo={codigoMozo}
                handleChange={handleChange}
                mozo={mozo}
                fechaHora={fechaHora}
                onSalirClick={handleAbrirConfirmacion}
            />

            <ConfirmLogoutDialog
                open={openConfirmDialog}
                onClose={handleCerrarConfirmacion}
                onConfirm={handleConfirmarSalirClick}
            />
        </Container>
    );
}

export default Index;

