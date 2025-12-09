// hooks/useMesaState.js
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useMesaState = (numeroMesa) => {
    const [checkBoxSeleccionados, setCheckBoxSeleccionados] = useState([]);
    const [show, setShow] = useState(false);
    const pedidosActivos = useSelector((state) => state.pedidosActivos.value);
    const [pedidoMesa, setPedidoMesa] = useState(
        pedidosActivos.find(pedido => pedido.numeroMesa === numeroMesa)
    );

    // Sincronizar pedidoMesa cuando cambia pedidosActivos
    useEffect(() => {
        setPedidoMesa(pedidosActivos.find(pedido => pedido.numeroMesa === numeroMesa));
    }, [pedidosActivos, numeroMesa]);

    const handleShow = () => setShow(true);
    
    const handleClose = () => {
        setShow(false);
        setCheckBoxSeleccionados([]);
    };

    const handleChangeCheckBox = (idCheckbox) => {
        setCheckBoxSeleccionados((prev) =>
            prev.includes(idCheckbox) 
                ? prev.filter(id => id !== idCheckbox) 
                : [...prev, idCheckbox]
        );
    };

    const activarCancelarPedido = checkBoxSeleccionados.length === 0;

    return {
        checkBoxSeleccionados,
        show,
        pedidoMesa,
        activarCancelarPedido,
        handleShow,
        handleClose,
        handleChangeCheckBox,
        setCheckBoxSeleccionados
    };
};