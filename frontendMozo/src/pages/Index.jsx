/* eslint-disable react-hooks/exhaustive-deps */
import { React, useState, useEffect, useRef, useContext } from 'react'
import Mesa from "../components/Mesa/Mesa";
import { Container, Form } from 'react-bootstrap';
import { modificar as modificarMozo } from '../redux/slices/mozoSlice';
import { modificar as modificarCodigoMozo } from '../redux/slices/codigoMozoSlice';
import { useSelector, useDispatch } from 'react-redux'
import { Chip, Box, Typography, Stack } from "@mui/material";
import { GetChipNombreCompleto } from '../Helpers/HelperFunctions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import { SucursalContext } from '../App';

function Index(props) {

    const dispatch = useDispatch();
    const { sucursalActiva } = useContext(SucursalContext);

    const mozo = useSelector((state) => state.mozo.value); 

    const codigoMozo = useSelector((state) => state.codigoMozo.value);

    const estiloMesas = {
        width: "7vw",
        height: "10vh",
        minWidth: "80px",
        minHeight: "80px",
        maxWidth: "120px",
        maxHeight: "120px",
    };

    const [ListaMesas, setListaMesas] = useState([]);

    const [ListaMesasFiltradas, setListaMesasFiltradas] = useState(undefined);
    const [fechaHora, setFechaHora] = useState(new Date());
    const inputRef = useRef(null);

    const handleChange = (event) => {
        dispatch(modificarCodigoMozo(event.target.value));
    }

    // Capturar eventos de teclado para escribir automáticamente en el input
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignorar si el usuario está escribiendo en un input, textarea o está en un elemento editable
            const target = event.target;
            const isInputElement = target.tagName === 'INPUT' || 
                                  target.tagName === 'TEXTAREA' || 
                                  target.isContentEditable;
            
            // Si está escribiendo en el input del código, no hacer nada (evitar duplicación)
            if (isInputElement && target === inputRef.current) {
                return;
            }

            // Ignorar teclas especiales que no son caracteres
            const key = event.key;
            
            // Si es una tecla imprimible (letra, número, o algunos símbolos)
            if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                const nuevoCodigo = codigoMozo + key;
                dispatch(modificarCodigoMozo(nuevoCodigo));
            }
            // Manejar Backspace para borrar el último carácter
            else if (key === 'Backspace' && !isInputElement) {
                event.preventDefault();
                if (codigoMozo.length > 0) {
                    dispatch(modificarCodigoMozo(codigoMozo.slice(0, -1)));
                }
            }
            // Manejar Enter para limpiar el código
            else if (key === 'Enter' && !isInputElement) {
                event.preventDefault();
                dispatch(modificarCodigoMozo(''));
            }
        };

        // Agregar el event listener al document
        document.addEventListener('keydown', handleKeyDown);

        // Limpiar el event listener al desmontar
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [codigoMozo, dispatch]);

    // Actualizar fecha y hora cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            setFechaHora(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filtrarMesas();
    }, [props.datos_mozos, mozo]);

    useEffect(() => {
        ComprobarCodigo();
    }, [codigoMozo])

    useEffect(() => {
        setListaMesas(props.mesas.map((mesa, i) => {
            return (
                <Mesa
                    key={i}
                    datos_mesa={mesa}
                    estilo={estiloMesas}
                />
            );
        }));
    }, [props.mesas]);

    function filtrarMesas() {
        if (mozo) {
            setListaMesasFiltradas(props.mesas.map((mesa, i) => {
                var variant;
                mesa.persona ? mesa.persona.codigoDeServicio === mozo.codigoDeServicio ? variant = "success" : variant = "primary" : variant = "secondary";
                return (
                    <Mesa
                        key={i}
                        datos_mesa={mesa}
                        variant={variant}
                        mozo={mozo}
                        estilo={estiloMesas}
                    />
                );
            }));
        } else {
            setListaMesasFiltradas(undefined);
        }
    }

    function ComprobarCodigo() {
        if (props.datos_mozos.length > 0) {
            dispatch(modificarMozo((props.datos_mozos.find(mozo => mozo.codigoDeServicio === codigoMozo))));
        }
    }


    const formatearFecha = (fecha) => {
        return fecha.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatearHora = (fecha) => {
        return fecha.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <Container className="position-relative" style={{ height: "98vh" }}>
            <div className="row pt-4 g-3">
                {(ListaMesasFiltradas || ListaMesas).map((mesa, i) => (
                    <div className="col-6 col-md-4 col-lg-3 d-flex justify-content-center" key={i}>
                        {mesa}
                    </div>
                ))}
            </div>


            <div className="position-absolute bottom-0 start-0 w-100 p-3 d-flex align-items-end gap-3 flex-wrap">
                <Form.Group controlId="exampleForm.ControlInput1" className="mb-0">
                    <Form.Label>Código</Form.Label>
                    <Form.Control
                        ref={inputRef}
                        onChange={(e) => handleChange(e)}
                        type="password"
                        value={codigoMozo}
                        className="w-100"
                    />
                </Form.Group>
                {mozo?.nombre ? GetChipNombreCompleto(mozo.nombre, mozo.apellido) : (<Chip label="Codigo incorrecto" variant="outlined" color="error" />)}
                
                {/* Fecha, hora y empresa - menos invasivo */}
                <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                        <Typography variant="caption" color="text.secondary">
                            {formatearFecha(fechaHora)}
                        </Typography>
                        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14, ml: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                            {formatearHora(fechaHora)}
                        </Typography>
                    </Stack>
                    {sucursalActiva && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <BusinessIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                            <Typography variant="caption" color="text.secondary">
                                {sucursalActiva.NombreEmpresa} - {sucursalActiva.Direccion}
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </div>

        </Container>

    );
}

export default Index;
