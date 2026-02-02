import React from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { modificar as modificarCodigoMozo } from '../../redux/slices/codigoMozoSlice';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { useMozoCode } from './hooks/useMozoCode';
import { BottomBar } from './components/BottomBar';
import { ConfirmLogoutDialog } from './components/ConfirmLogoutDialog';
import { usePlanos } from './hooks/usePlanos';
import { useMesasGrid } from './hooks/useMesasGrid';
import { normalizarMesa } from './utils/mesaHelpers';
import { useLogoutHandlers } from './hooks/useLogoutHandlers';
import { PlanoSelector } from './components/PlanoSelector';
import { MesasGridLayout } from './components/MesasGridLayout';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';

function Index2(props) {
    const dispatch = useDispatch();
    
    // Hooks para datos
    const { planos, planoSeleccionado, setPlanoSeleccionado, cargando: cargandoPlanos } = usePlanos();
    const cargandoMesas = props.mesas == null;
    const mesas = props.mesas == null
        ? []
        : (Array.isArray(props.mesas) ? props.mesas.map(normalizarMesa) : []);
    const { layout, obtenerMesaPorId, obtenerDatosMesa } = useMesasGrid(mesas, planoSeleccionado);

    // Hooks para BottomBar
    const { inputRef } = useKeyboardInput();
    const { codigoMozo, mozo } = useMozoCode(props.datos_mozos || []);

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
            />
        );
    };

    return (
        <Container className="position-relative" style={{ height: "98vh" }}>
            <PlanoSelector
                planos={planos}
                planoSeleccionado={planoSeleccionado}
                onChange={handleCambiarPlano}
                disabled={cargando}
            />

            {renderContenido()}
            
            <BottomBar
                inputRef={inputRef}
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

export default Index2;

