import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBurger } from '@fortawesome/free-solid-svg-icons';
import { Button as BsButton, Modal } from 'react-bootstrap';
import Lista_Items from './Listas/Lista_Items';
import Alert from '@mui/material/Alert';

export default function Mesa_Deshabilitada(props) {
    const { estilo, deshabilitadaPorCaja, datos_mesa, visitaMesa, simpleStyle = false } = props;
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const handleShow = () => {
        if (deshabilitadaPorCaja) return;
        setShow(true);
    };

    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const horas = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    }

    const fechaFormateada = formatearFecha(visitaMesa?.fechaHora || null);
    const totalPrecio = visitaMesa?.productosConsumidos
        ? visitaMesa.productosConsumidos.reduce((acumulador, producto) =>
            acumulador + parseFloat(producto.precio || producto.precioDelMomento || 0), 0)
        : 0;
    const datosMozo = datos_mesa?.visita?.mozo || null;

    // Mismo aspecto que MesaButton (MUI): azul siempre, mismo layout
    const botonSx = simpleStyle
        ? {
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            padding: '4px 8px',
            fontSize: '0.75rem',
            textTransform: 'none',
            ...estilo,
        }
        : {
            ...estilo,
            mx: 1,
            py: 2,
            px: 3,
            minWidth: 120,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            textTransform: 'none',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
            transition: 'all 0.2s ease-in-out',
        };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                onClick={handleShow}
                disabled={deshabilitadaPorCaja}
                sx={botonSx}
            >
                {simpleStyle ? (
                    <>Mesa {datos_mesa.nombre}</>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faBurger} style={{ fontSize: '1.5rem' }} />
                        <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                            Mesa {datos_mesa.nombre}
                        </Typography>
                    </>
                )}
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Pedidos de la Mesa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert severity="info">Atendida por {datosMozo ? datosMozo.nombres + ' ' + datosMozo.apellido : 'No asignado'} - {fechaFormateada} - ${totalPrecio}</Alert>
                    <hr></hr>
                    {visitaMesa ? (
                        <Lista_Items visitaMesa={visitaMesa} titulo="Pedido" subtitulo="Total" estado={false} />
                    ) : (
                        <Alert severity="info">No hay visitas activas para esta mesa</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <BsButton variant="primary" onClick={handleClose}>
                        Cerrar
                    </BsButton>
                </Modal.Footer>
            </Modal>
        </>
    );
}
