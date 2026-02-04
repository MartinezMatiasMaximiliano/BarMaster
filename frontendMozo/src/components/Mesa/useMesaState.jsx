// hooks/useMesaState.js
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useMesaState = (nombreMesa) => {
    const [checkBoxSeleccionados, setCheckBoxSeleccionados] = useState([]);
    const [show, setShow] = useState(false);
    const visitasActivas = useSelector((state) => state.visitasActivas.value);
    const [visitaMesa, setVisitaMesa] = useState(
        visitasActivas.find(visita => visita.numeroMesa === nombreMesa)
    );

    // Sincronizar visitaMesa cuando cambia visitasActivas
    useEffect(() => {
        setVisitaMesa(visitasActivas.find(visita => visita.numeroMesa === nombreMesa));
    }, [visitasActivas, nombreMesa]);

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
        visitaMesa,
        productos: visitaMesa?.productos || [],
        activarCancelarPedido,
        handleShow,
        handleClose,
        handleChangeCheckBox,
        setCheckBoxSeleccionados
    };
};