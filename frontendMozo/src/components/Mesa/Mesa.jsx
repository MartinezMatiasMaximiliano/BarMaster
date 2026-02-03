// components/Mesa/Mesa.jsx
import React from 'react';
import { MesaButton } from './MesaButton';
import { MesaModal } from './MesaModal';
import Mesa_Deshabilitada from '../Mesa_Deshabilitada';
import { useMesaState } from './useMesaState';
import { useMesaLogic } from './useMesaLogic';

export default function Mesa({ datos_mesa, estilo, variant, mozo, simpleStyle = false, hayCajaActiva = true }) {
    const {
        checkBoxSeleccionados,
        show,
        visitaMesa,
        productos,
        activarCancelarPedido,
        handleShow,
        handleClose,
        handleChangeCheckBox,
        setCheckBoxSeleccionados
    } = useMesaState(datos_mesa.nombre);

    const { cancelarPedidos, cerrarMesa, abrirMesa } = useMesaLogic();

    // Handlers con contexto
    const handleCancelarPedidos = (idsProductos) => {
        cancelarPedidos(
            idsProductos, 
            datos_mesa.nombre,
            () => setCheckBoxSeleccionados([])
        );
    };

    const handleCerrarMesa = (mesaId) => {
        cerrarMesa(mesaId, datos_mesa.nombre, productos);
    };

    const handleAbrirMesa = () => {
        // No permitir abrir mesa si no hay caja activa
        if (!hayCajaActiva) {
            return;
        }
        var request = {
            idMesa: datos_mesa.id,
            numeroMesa: datos_mesa.nombre, // Necesario para crear la visita en Redux
            codigoServicioMozo: mozo.codigoDeServicio,
            abrir: true,
        }
        abrirMesa(request);
    };

    // Wrapper para handleShow que verifica si hay caja activa
    const handleShowConValidacion = () => {
        if (!hayCajaActiva) {
            return;
        }
        handleShow();
    };

    // Renderizado condicional simplificado
    const renderMesa = () => {
        // Mesa sin código (inactiva)
        if (!datos_mesa.codigoParaPedir) {
            return (
                <MesaButton
                    numeroMesa={datos_mesa.nombre}
                    estilo={estilo}
                    variant="secondary"
                    onClick={handleAbrirMesa}
                    disabled={!mozo || !hayCajaActiva}
                    prefix="Abrir"
                    simpleStyle={simpleStyle}
                />
            );
        }

        // Si simpleStyle está activo, siempre usar MesaButton para mantener consistencia visual
        if (simpleStyle) {
            return (
                <>
                    <MesaButton
                        numeroMesa={datos_mesa.nombre}
                        estilo={estilo}
                        variant={variant}
                        onClick={handleShowConValidacion}
                        simpleStyle={simpleStyle}
                        disabled={!hayCajaActiva}
                    />
                    
                    <MesaModal
                        show={show}
                        handleClose={handleClose}
                        datos_mesa={datos_mesa}
                        productos={productos}
                        checkBoxSeleccionados={checkBoxSeleccionados}
                        handleChangeCheckBox={handleChangeCheckBox}
                        activarCancelarPedido={activarCancelarPedido}
                        onCancelarPedidos={handleCancelarPedidos}
                        onCerrarMesa={handleCerrarMesa}
                    />
                </>
            );
        }

        // Mesa deshabilitada (solo cuando simpleStyle es false)
        if (variant !== "success") {
            return (
                <Mesa_Deshabilitada 
                    visitaMesa={visitaMesa}
                    productos={productos}
                    estilo={estilo}  
                    datos_mesa={datos_mesa}
                    deshabilitadaPorCaja={!hayCajaActiva}
                />
            );
        }

        // Mesa activa con modal
        return (
            <>
                <MesaButton
                    numeroMesa={datos_mesa.nombre}
                    estilo={estilo}
                    variant={variant}
                    onClick={handleShowConValidacion}
                    simpleStyle={simpleStyle}
                    disabled={!hayCajaActiva}
                />
                
                <MesaModal
                    show={show}
                    handleClose={handleClose}
                    datos_mesa={datos_mesa}
                    productos={productos}
                    checkBoxSeleccionados={checkBoxSeleccionados}
                    handleChangeCheckBox={handleChangeCheckBox}
                    activarCancelarPedido={activarCancelarPedido}
                    onCancelarPedidos={handleCancelarPedidos}
                    onCerrarMesa={handleCerrarMesa}
                />
            </>
        );
    };

    return renderMesa();
}