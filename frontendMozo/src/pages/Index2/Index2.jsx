import React, { useEffect, useRef } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { modificar as modificarCodigoMozo } from '../../redux/slices/codigoMozoSlice';
import { ObtenerCajaActiva } from '../../API/APICaja';
import { setCajaActiva } from '../../redux/slices/cajaActivaSlice';
import { useOperadorMesas } from '../../hooks/useOperadorMesas';
import { BottomBar } from '../../components/BottomBar';
import { ConfirmLogoutDialog } from '../../components/ConfirmLogoutDialog';
import { PlanoSelector } from '../../components/PlanoSelector';
import { usePlanos } from './hooks/usePlanos';
import { useMesasGrid } from './hooks/useMesasGrid';
import { normalizarMesa } from './utils/mesaHelpers';
import { useLogoutHandlers } from './hooks/useLogoutHandlers';
import { MesasGridLayout } from './components/MesasGridLayout';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import WarningIcon from '@mui/icons-material/Warning';
import { useCodigoMozoTeclado } from '../../hooks/useCodigoMozoTeclado';

function Index2(props) {
    const indexContainerRef = useRef(null);
    const { codigoMozo, mozo, accesoGlobal } = useOperadorMesas(props.datos_mozos || []);
    const codigoMozoInputRef = useCodigoMozoTeclado({ activo: !accesoGlobal });
    const dispatch = useDispatch();
    const hayCajaActiva = useSelector((state) => state.cajaActiva.value);

    useEffect(() => {
        const indexHost = indexContainerRef.current?.closest('main');
        if (!indexHost) return undefined;
        indexHost.classList.add('bm-index-host');
        return () => indexHost.classList.remove('bm-index-host');
    }, []);

    // Cargar estado de caja activa al montar
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

    // Hooks para datos
    const { planos, planoSeleccionado, setPlanoSeleccionado, cargando: cargandoPlanos } = usePlanos();
    const cargandoMesas = props.mesas == null;
    const mesas = props.mesas == null
        ? []
        : (Array.isArray(props.mesas) ? props.mesas.map(normalizarMesa) : []);
    const { layout, obtenerMesaPorId, obtenerDatosMesa } = useMesasGrid(mesas, planoSeleccionado, { mozo, accesoGlobal });

    // Hooks para logout
    const {
        openConfirmDialog,
        handleAbrirConfirmacion,
        handleCerrarConfirmacion,
        handleConfirmarSalirClick
    } = useLogoutHandlers();

    // Handlers
    const handleCambiarPlano = (event) => {
        setPlanoSeleccionado(event.target.value);
    };

    const handleChange = (event) => {
        dispatch(modificarCodigoMozo(event.target.value));
    };

    const cargando = cargandoPlanos || cargandoMesas;

    // Renderizado condicional
    const renderContenido = () => {
        if (cargando) {
            return <LoadingState />;
        }

        if (layout.length === 0) {
            return <EmptyState />;
        }

        return (
            <MesasGridLayout
                layout={layout}
                obtenerMesaPorId={obtenerMesaPorId}
                obtenerDatosMesa={obtenerDatosMesa}
                hayCajaActiva={hayCajaActiva}
            />
        );
    };

    return (
        <Container
            fluid
            ref={indexContainerRef}
            className="position-relative px-0"
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
            <PlanoSelector
                planos={planos}
                planoSeleccionado={planoSeleccionado}
                onChange={handleCambiarPlano}
                disabled={cargando}
            />

            {renderContenido()}
            
            <BottomBar
                codigoMozo={codigoMozo}
                codigoMozoInputRef={codigoMozoInputRef}
                handleChange={handleChange}
                mozo={mozo}
                onSalirClick={handleAbrirConfirmacion}
                ocultarCodigo={accesoGlobal}
            />

            <ConfirmLogoutDialog
                open={openConfirmDialog}
                onClose={handleCerrarConfirmacion}
                onConfirm={handleConfirmarSalirClick}
            />
        </Container>
    );
}

export default Index2;

