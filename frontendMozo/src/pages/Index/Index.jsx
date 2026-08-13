import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import { ThemeProvider } from '@mui/material';
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
import { useIndexTheme } from './hooks/useIndexTheme';
import { createIndexTheme } from './indexTheme';
import './IndexTheme.css';

function Index(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);
    
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const indexContainerRef = useRef(null);
    const { themeMode, toggleThemeMode } = useIndexTheme();
    const indexTheme = useMemo(() => createIndexTheme(themeMode), [themeMode]);

    useEffect(() => {
        const indexHost = indexContainerRef.current?.closest('main');
        if (!indexHost) return undefined;

        indexHost.classList.add('bm-index-host', `bm-index-host--${themeMode}`);

        return () => {
            indexHost.classList.remove('bm-index-host', `bm-index-host--${themeMode}`);
        };
    }, [themeMode]);

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
                dispatch(setCajaActiva(caja || null));
            } catch (error) {
                dispatch(setCajaActiva(null));
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
        <ThemeProvider theme={indexTheme}>
            <Container
                ref={indexContainerRef}
                className={`position-relative bm-index-theme bm-index-theme--${themeMode}`}
                style={{ height: "calc(100vh - 32px)", overflow: "hidden" }}
            >
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
                    themeMode={themeMode}
                    onThemeToggle={toggleThemeMode}
                    onSalirClick={handleAbrirConfirmacion}
                />

                <ConfirmLogoutDialog
                    open={openConfirmDialog}
                    onClose={handleCerrarConfirmacion}
                    onConfirm={handleConfirmarSalirClick}
                />
            </Container>
        </ThemeProvider>
    );
}

export default Index;

