import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Lista_Detalles_Pedidos from '../Listas/Lista_Detalles_Pedidos';
import { Box, Divider, Typography } from '@mui/material';

function Modal_Detalles_Pedido(props) {

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const items = Array.isArray(props.cuerpo) ? props.cuerpo : [];
    const totalProductos = items.reduce((sum, p) => sum + (Number(p.precio) || 0), 0);

    return (
        <>
            <Button variant={props.variant ? props.variant : "primary"} className="me-2" onClick={handleShow}>
                Ver
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.titulo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Box
                        sx={{
                            maxHeight: '50vh',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            pr: 0.5,
                        }}
                    >
                        <Lista_Detalles_Pedidos items={items} />
                    </Box>
                    {items.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Divider sx={{ my: 1.5 }} />
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1.5,
                                    px: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <Typography variant="subtitle1" color="text.secondary">
                                    Total (productos)
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    $ {totalProductos.toLocaleString('es-AR')}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Detalles_Pedido;
