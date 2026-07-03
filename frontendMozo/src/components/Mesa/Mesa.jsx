// components/Mesa/Mesa.jsx
import React from 'react';
import { MesaButton } from './MesaButton';
import { MesaModalUnificado } from './MesaModalUnificado';
import Mesa_Deshabilitada from '../Mesa_Deshabilitada';
import { useMesaState } from './useMesaState';
import { useMesaLogic } from './useMesaLogic';

export default function Mesa({ datos_mesa, estilo, variant, mozo, simpleStyle = false, hayCajaActiva = true, esVistaPlano = false }) {
    const {
        show,
        visitaMesa,
        handleShow,
        handleClose,
        setCheckBoxSeleccionados
    } = useMesaState(datos_mesa.nombre);


    const { cancelarPedidos, cerrarMesa, abrirMesa } = useMesaLogic();

    // Handlers con contexto
    const handleCancelarPedidos = (idsProductos) => {
        const idVisita = visitaMesa?.id || visitaMesa?.Id || datos_mesa.visita?.id || datos_mesa.visita?.Id;
        if (!idVisita) return;
        cancelarPedidos(
            idsProductos,
            idVisita,
            datos_mesa.nombre,
            () => setCheckBoxSeleccionados([])
        );
    };

    const handleCerrarMesa = (mesaId) => {
        cerrarMesa(mesaId, datos_mesa.nombre, visitaMesa?.productosConsumidos || [], esVistaPlano);
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
        abrirMesa(request, esVistaPlano);
    };

    // Wrapper para handleShow que verifica si hay caja activa
    const handleShowConValidacion = () => {
        if (!hayCajaActiva) {
            return;
        }
        handleShow();
    };

    const renderMesaActiva = () => (
        <>
            <MesaButton
                numeroMesa={datos_mesa.nombre}
                estilo={estilo}
                variant={variant}
                onClick={handleShowConValidacion}
                simpleStyle={simpleStyle}
                disabled={!hayCajaActiva}
            />
            <MesaModalUnificado
                show={show}
                handleClose={handleClose}
                datos_mesa={datos_mesa}
                visitaMesa={visitaMesa}
                onCancelarPedidos={handleCancelarPedidos}
                onCerrarMesa={handleCerrarMesa}
            />
        </>
    );

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
                    disabled={!mozo?.codigoDeServicio || !hayCajaActiva}
                    prefix="Abrir"
                    simpleStyle={simpleStyle}
                />
            );
        }

        // Si simpleStyle (Index2): sin código correcto -> Mesa_Deshabilitada; si no -> MesaButton + modal unificado.
        if (simpleStyle) {
            if (variant !== "success") {
                return (
                    <Mesa_Deshabilitada
                        visitaMesa={visitaMesa}
                        estilo={estilo}
                        datos_mesa={datos_mesa}
                        deshabilitadaPorCaja={!hayCajaActiva}
                        simpleStyle={true}
                    />
                );
            }
            return (
                renderMesaActiva()
            );
        }

        // Mesa deshabilitada (Index, sin simpleStyle)
        if (variant !== "success") {
            return (
                <Mesa_Deshabilitada
                    visitaMesa={visitaMesa}
                    estilo={estilo}
                    datos_mesa={datos_mesa}
                    deshabilitadaPorCaja={!hayCajaActiva}
                    simpleStyle={false}
                />
            );
        }

        // Mesa activa con modal
        return (
            renderMesaActiva()
        );
    };

    return renderMesa();
}
