import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBurger } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal } from 'react-bootstrap';
import { useState } from 'react';
import Lista from "./Lista";
import Modal_Generico from "./Modals/Modal_Generico";
import Modal_Ver_Cuenta from "./Modals/Modal_Ver_Cuenta";
import { AbrirMesa, CerrarMesa } from '../API/APIMesas';
import { useSelector, useDispatch } from 'react-redux'
import { cambiarEstadoItemsPorMesa, eliminarItems as eliminarItemsDePedido, agregarPedido } from '../redux/slices/pedidosActivosSlice'
import { EliminarItems } from '../API/APIItems';
import Mesa_Deshabilitada from './Mesa_Deshabilitada';
import Alert from '@mui/material/Alert';
import connection from '../connections/HubConnMozo'
import { GenerarTicketPDF } from '../API/APIPedidos';
import { useNavigate } from 'react-router-dom';

export default function Mesa(props) {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const [checkBoxSeleccionados, setCheckBoxSeleccionados] = useState([]);

    const [activarCancelarPedido, setActivarCancelarPedido] = useState(true);

    const pedidosActivos = useSelector((state) => state.pedidosActivos.value);

    const [pedidoMesa, setPedidoMesa] = useState(pedidosActivos.find(pedido => pedido.numeroMesa === props.datos_mesa.numeroMesa));

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        setCheckBoxSeleccionados([]);
    }

    useEffect(() => {
        setActivarCancelarPedido(checkBoxSeleccionados.length > 0 ? false : true);
    }, [checkBoxSeleccionados])

    function handleChangeCheckBox(idCheckbox) {
        setCheckBoxSeleccionados((prev) =>
            prev.includes(idCheckbox) ? prev.filter(id => id !== idCheckbox) : [...prev, idCheckbox]
        );
    }

    function cancelarPedidos(idCheckboxs) {
        EliminarItems(idCheckboxs, props.datos_mesa.numeroMesa); //Modifico la DB
        setCheckBoxSeleccionados([]); //Actualizo los checkbox
        dispatch(eliminarItemsDePedido({ numeroMesa: props.datos_mesa.numeroMesa, idsItems: idCheckboxs })); //Actualizo el state
       
    }

    async function cerrarMesa(mesaId) {
        const itemsPendientes = obtenerIdItemsPendientes();

        // Genero la factura
        if (itemsPendientes.length > 0) {
            GenerarTicketPDF(props.datos_mesa.numeroMesa, itemsPendientes);
        }

        //Actualizo el state
        dispatch(cambiarEstadoItemsPorMesa({ numeroMesa: props.datos_mesa.numeroMesa, estadoNuevo: 2 }));

        //Actualizo la DB
        await CerrarMesa(mesaId);

        //Mensaje al cliente asi se desloguea de su mesa
        connection.send("MesaCerrada", props.datos_mesa.numeroMesa);

        //Recargo la vista
        navigate('/?=' + Date.now());
    }

    async function abrirMesa(mesaId, codigoServicio) {
        const response = await AbrirMesa(mesaId, codigoServicio);
        // Desestructuramos directamente los campos de 'pedido' y los asignamos a datosPedido
        const { pedido: { id, fechaRealizado, idMesa, numeroMesa, activo, items } } = response;

        // Creamos el objeto directamente con esos campos
        const datosPedido = { id, fechaRealizado, idMesa, numeroMesa, activo, items };
        dispatch(agregarPedido(datosPedido));
        navigate('/?=' + Date.now());
    }

    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const horas = date.getHours().toString().padStart(2, '0'); // Asegura dos dígitos
        const minutos = date.getMinutes().toString().padStart(2, '0');

        return `${horas}:${minutos}`;
    }

    function obtenerIdItemsPendientes() {
        const ids = [];

        pedidoMesa.items.forEach(item => {
            if (item.estado === 0 || item.estado === 1) {
                ids.push(item.id);
            }
        });

        return ids;
    }


    const handleShow = () => setShow(true);

    const fechaFormateada = formatearFecha(pedidoMesa ? pedidoMesa.fechaRealizado : null);
    const totalPrecio = pedidoMesa ? (pedidoMesa.items).reduce((acumulador, item) => acumulador + parseFloat(item.precio), 0) : 0;
    const ListaItems = <Lista items={pedidoMesa ? pedidoMesa.items : []} handleCheckBox={handleChangeCheckBox} checkBoxSeleccionados={checkBoxSeleccionados}></Lista>;

    useEffect(() => {
        setPedidoMesa(pedidosActivos.find(pedido => pedido.numeroMesa === props.datos_mesa.numeroMesa));
    }, [pedidosActivos])

    const botonesMesa = (
        <div>
            <Modal_Ver_Cuenta
                titulo="Ver cuenta"
                numeroMesa={props.datos_mesa.numeroMesa}
                datos_mesa={props.datos_mesa}
                textoBoton="Ver cuenta"
                cerrar_modal={handleClose}
                func={handleShow}
                cerrar_modal_mesa={handleClose}
            />
            <Modal_Generico
                confirmar={true}
                titulo="¿Seguro que desea cerrar la mesa?"
                cuerpo="Todos los pedidos pendientes se marcarán como pagados"
                textoBoton="Cerrar mesa"
                func={cerrarMesa}
                param={props.datos_mesa.id}
                cerrar_modal={handleClose}
                disabled={false}
            />
            <Modal_Generico
                confirmar={true}
                titulo="Cancelar pedidos"
                cuerpo="¿Seguro que desea cancelar los pedidos?"
                textoBoton="Cancelar pedidos"
                func={cancelarPedidos}
                param={checkBoxSeleccionados}
                cerrar_modal={handleClose}
                disabled={activarCancelarPedido}
            />
        </div>
    );

    const modal_pedir = (
        <>
            <Button className="boton-mesa mx-2" style={props.estilo} onClick={handleShow} variant={props.variant}>
                <FontAwesomeIcon icon={faBurger} />
                <p>Mesa {props.datos_mesa.numeroMesa}</p>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Mesa {props.datos_mesa.numeroMesa}</Modal.Title>
                    <Alert icon={false} severity="warning" sx={{ fontSize: '1.2rem', ml: ".7em" }}>{props.datos_mesa.codigoParaPedir ? props.datos_mesa.codigoParaPedir : ''}</Alert>
                </Modal.Header>
                <Modal.Body>
                    <h3>{fechaFormateada} - Total ${totalPrecio}</h3>
                    <div>{ListaItems}</div>
                    {props.datos_mesa.codigoParaPedir && botonesMesa}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );

    const boton_activar_mesa = (
        <Button className="boton-mesa mx-2" style={props.estilo} variant="secondary" onClick={() => abrirMesa(props.datos_mesa.id, props.mozo.codigoDeServicio) } disabled={!props.mozo}>
            <FontAwesomeIcon icon={faBurger} />
            <p>Abrir {props.datos_mesa.numeroMesa}</p>
        </Button>
    );

    const mesa_deshabilitada = (
        <Mesa_Deshabilitada pedidoMesa={pedidoMesa} estilo={props.estilo}  datos_mesa={props.datos_mesa}></Mesa_Deshabilitada>
    );

    return <>{props.datos_mesa.codigoParaPedir ? props.variant === "success" ? modal_pedir : mesa_deshabilitada : boton_activar_mesa}</>;
}


