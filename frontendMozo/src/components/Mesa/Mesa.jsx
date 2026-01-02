// components/Mesa/Mesa.jsx
import React from 'react';
import { MesaButton } from './MesaButton';
import { MesaModal } from './MesaModal';
import Mesa_Deshabilitada from '../Mesa_Deshabilitada';
import { useMesaState } from './useMesaState';
import { useMesaLogic } from './useMesaLogic';

export default function Mesa({ datos_mesa, estilo, variant, mozo, simpleStyle = false }) {
    const {
        checkBoxSeleccionados,
        show,
        pedidoMesa,
        activarCancelarPedido,
        handleShow,
        handleClose,
        handleChangeCheckBox,
        setCheckBoxSeleccionados
    } = useMesaState(datos_mesa.numeroMesa);

    const { cancelarPedidos, cerrarMesa, abrirMesa } = useMesaLogic();

    // Handlers con contexto
    const handleCancelarPedidos = (idCheckboxs) => {
        cancelarPedidos(
            idCheckboxs, 
            datos_mesa.numeroMesa,
            () => setCheckBoxSeleccionados([])
        );
    };

    const handleCerrarMesa = (mesaId) => {
        cerrarMesa(mesaId, datos_mesa.numeroMesa, pedidoMesa?.items || []);
    };

    const handleAbrirMesa = () => {
        var request = {
            idMesa: datos_mesa.id,
            codigoServicioMozo: mozo.codigoDeServicio,
            abrir: true,
        }
        abrirMesa(request);
    };

    // Renderizado condicional simplificado
    const renderMesa = () => {
        // Mesa sin código (inactiva)
        if (!datos_mesa.codigoParaPedir) {
            return (
                <MesaButton
                    numeroMesa={datos_mesa.numeroMesa}
                    estilo={estilo}
                    variant="secondary"
                    onClick={handleAbrirMesa}
                    disabled={!mozo}
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
                        numeroMesa={datos_mesa.numeroMesa}
                        estilo={estilo}
                        variant={variant}
                        onClick={handleShow}
                        simpleStyle={simpleStyle}
                    />
                    
                    <MesaModal
                        show={show}
                        handleClose={handleClose}
                        datos_mesa={datos_mesa}
                        pedidoMesa={pedidoMesa}
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
                    pedidoMesa={pedidoMesa} 
                    estilo={estilo}  
                    datos_mesa={datos_mesa}
                />
            );
        }

        // Mesa activa con modal
        return (
            <>
                <MesaButton
                    numeroMesa={datos_mesa.numeroMesa}
                    estilo={estilo}
                    variant={variant}
                    onClick={handleShow}
                    simpleStyle={simpleStyle}
                />
                
                <MesaModal
                    show={show}
                    handleClose={handleClose}
                    datos_mesa={datos_mesa}
                    pedidoMesa={pedidoMesa}
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