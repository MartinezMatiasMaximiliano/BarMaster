// components/Mesa/Mesa.jsx
import React from 'react';
import { MesaButton } from './MesaButton';
import { MesaModal } from './MesaModal';
import Mesa_Deshabilitada from '../Mesa_Deshabilitada';
import { useMesaState } from './useMesaState';
import { useMesaLogic } from './useMesaLogic';

export default function Mesa({ datos_mesa, estilo, variant, mozo }) {
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
        abrirMesa(datos_mesa.id, mozo.codigoDeServicio);
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
                />
            );
        }

        // Mesa deshabilitada
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