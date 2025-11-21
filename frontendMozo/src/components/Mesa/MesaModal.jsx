// components/Mesa/MesaModal.jsx
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import Alert from '@mui/material/Alert';
import Lista from "../Listas/Lista";
import Modal_Generico from "../Modals/Modal_Generico";
import Modal_Ver_Cuenta from "../Modals/Modal_Ver_Cuenta";
import { formatearFecha, calcularTotalPrecio } from './dateFormatter';

export const MesaModal = ({
    show,
    handleClose,
    datos_mesa,
    pedidoMesa,
    checkBoxSeleccionados,
    handleChangeCheckBox,
    activarCancelarPedido,
    onCancelarPedidos,
    onCerrarMesa
}) => {
    const fechaFormateada = formatearFecha(pedidoMesa?.fechaRealizado);
    const totalPrecio = calcularTotalPrecio(pedidoMesa?.items);

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Mesa {datos_mesa.numeroMesa}</Modal.Title>
                {datos_mesa.codigoParaPedir && (
                    <Alert 
                        icon={false} 
                        severity="warning" 
                        sx={{ fontSize: '1.2rem', ml: ".7em" }}
                    >
                        {datos_mesa.codigoParaPedir}
                    </Alert>
                )}
            </Modal.Header>
            
            <Modal.Body>
                <h3>{fechaFormateada} - Total ${totalPrecio}</h3>
                <div>
                    <Lista 
                        items={pedidoMesa?.items || []} 
                        handleCheckBox={handleChangeCheckBox} 
                        checkBoxSeleccionados={checkBoxSeleccionados}
                    />
                </div>
                
                {datos_mesa.codigoParaPedir && (
                    <div>
                        <Modal_Ver_Cuenta
                            titulo="Ver cuenta"
                            numeroMesa={datos_mesa.numeroMesa}
                            datos_mesa={datos_mesa}
                            textoBoton="Ver cuenta"
                            cerrar_modal={handleClose}
                            func={handleClose}
                            cerrar_modal_mesa={handleClose}
                        />
                        
                        <Modal_Generico
                            confirmar={true}
                            titulo="¿Seguro que desea cerrar la mesa?"
                            cuerpo="Todos los pedidos pendientes se marcarán como pagados"
                            textoBoton="Cerrar mesa"
                            func={onCerrarMesa}
                            param={datos_mesa.id}
                            cerrar_modal={handleClose}
                            disabled={false}
                        />
                        
                        <Modal_Generico
                            confirmar={true}
                            titulo="Cancelar pedidos"
                            cuerpo="¿Seguro que desea cancelar los pedidos?"
                            textoBoton="Cancelar pedidos"
                            func={onCancelarPedidos}
                            param={checkBoxSeleccionados}
                            cerrar_modal={handleClose}
                            disabled={activarCancelarPedido}
                        />
                    </div>
                )}
            </Modal.Body>
            
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};