import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import { modificar as modificarCodigoMozo } from '../../redux/slices/codigoMozoSlice';
import { LoginContext, AuthTypeContext } from '../../App';
import { handleConfirmarSalir } from '../../Helpers/HelperFunctions';
import { useMesaFiltering } from './hooks/useMesaFiltering.jsx';
import { useMozoCode } from './hooks/useMozoCode';
import { MesasGrid } from './components/MesasGrid';
import { BottomBar } from '../../components/BottomBar';
import { ConfirmLogoutDialog } from '../../components/ConfirmLogoutDialog';
import { LoadingState } from './components/LoadingState';
import { ObtenerCajaActiva } from '../../API/APICaja';
import { setCajaActiva } from '../../redux/slices/cajaActivaSlice';
import WarningIcon from '@mui/icons-material/Warning';

function Index(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);
    
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    // Obtener estado de caja activa desde Redux
    const hayCajaActiva = useSelector((state) => state.cajaActiva.value);

    const mesas = Array.isArray(props.mesas) ? props.mesas : [];
    const cargandoMesas = props.mesas == null;
    
    const { mesasParaMostrar } = useMesaFiltering(mesas, props.datos_mozos, hayCajaActiva);

    const { codigoMozo, mozo } = useMozoCode(props.datos_mozos);

    // Cargar estado de caja activa al montar el componente
    useEffect(() => {
        const cargarEstadoCaja = async () => {
            try {
                const caja = await ObtenerCajaActiva();
                dispatch(setCajaActiva(!!caja?.id));
            } catch (error) {
                dispatch(setCajaActiva(false));
            }
        };
        cargarEstadoCaja();
    }, [dispatch]);

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
        <Container className="position-relative" style={{ height: "calc(100vh - 32px)", overflow: "hidden" }}>
            {!hayCajaActiva && (
                <div className="position-absolute top-0 start-0 end-0 m-3" style={{ zIndex: 10 }}>
                    <Alert variant="warning" className="mb-0 d-flex align-items-center shadow-sm">
                        <WarningIcon className="me-2" style={{ fontSize: '1.5rem' }} />
                        <span>No se puede abrir mesas si no hay una caja activa</span>
                    </Alert>
                </div>
            )}
            {cargandoMesas ? (
                <LoadingState />
            ) : (
                <MesasGrid mesas={mesasParaMostrar} hayCajaActiva={hayCajaActiva} />
            )}
            
            <BottomBar
                codigoMozo={codigoMozo}
                handleChange={handleChange}
                mozo={mozo}
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

