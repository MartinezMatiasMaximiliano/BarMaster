/* eslint-disable react-hooks/exhaustive-deps */
import { React, useState, useEffect } from 'react'
import Mesa from "../components/Mesa/Mesa";
import { Container, Form } from 'react-bootstrap';
import { modificar as modificarMozo } from '../redux/slices/mozoSlice';
import { modificar as modificarCodigoMozo } from '../redux/slices/codigoMozoSlice';
import { useSelector, useDispatch } from 'react-redux'
import { Chip, Box, Typography, Stack } from "@mui/material";
import { GetChipNombreCompleto } from '../Helpers/HelperFunctions';
import GridLayout, { WidthProvider } from "react-grid-layout";
import Button from '@mui/material/Button';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ObtenerDatosEmpresa } from '../API/APIEmpresas';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';

const ResponsiveGridLayout = WidthProvider(GridLayout);

function Index(props) {

    const dispatch = useDispatch();

    const [layout, setLayout] = useState(
        [
    {
        "w": 1,
        "h": 1,
        "x": 4,
        "y": 9,
        "i": "mesa2",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 3,
        "y": 6,
        "i": "mesa6",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 5,
        "y": 6,
        "i": "mesa4",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 4,
        "y": 2,
        "i": "mesa8",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 8,
        "y": 5,
        "i": "mesa12",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 5,
        "y": 4,
        "i": "mesa15",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 2,
        "y": 1,
        "i": "mesa17",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 4,
        "y": 1,
        "i": "mesa22",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 2,
        "y": 0,
        "i": "mesa1",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 4,
        "y": 0,
        "i": "mesa3",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 10,
        "y": 3,
        "i": "mesa5",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 10,
        "y": 7,
        "i": "mesa10",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 3,
        "y": 11,
        "i": "mesa11",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 4,
        "y": 11,
        "i": "mesa13",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 3,
        "y": 4,
        "i": "mesa30",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 0,
        "y": 0,
        "i": "mesa31",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 3,
        "y": 5,
        "i": "mesa32",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 0,
        "y": 1,
        "i": "mesa33",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 3,
        "x": 0,
        "y": 4,
        "i": "mesa34",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 5,
        "y": 5,
        "i": "mesa35",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 3,
        "x": 1,
        "y": 4,
        "i": "mesa36",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 8,
        "y": 7,
        "i": "mesa37",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 8,
        "y": 6,
        "i": "mesa38",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 3,
        "y": 9,
        "i": "mesa39",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 8,
        "y": 3,
        "i": "mesa40",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 2,
        "y": 2,
        "i": "mesa50",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 10,
        "y": 5,
        "i": "mesa60",
        "moved": false,
        "static": false
    },
    {
        "w": 1,
        "h": 1,
        "x": 10,
        "y": 6,
        "i": "mesa70",
        "moved": false,
        "static": false
    }
]
    );

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
    const [empresaData, setEmpresaData] = useState(null);
    const [fechaHora, setFechaHora] = useState(new Date());

    const handleChange = (event) => {
        dispatch(modificarCodigoMozo(event.target.value));
    }

    // Cargar datos de la empresa
    useEffect(() => {
        const cargarEmpresa = async () => {
            try {
                const data = await ObtenerDatosEmpresa();
                setEmpresaData(data);
            } catch (error) {
                console.error('Error al cargar datos de la empresa:', error);
            }
        };
        cargarEmpresa();
    }, []);

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
            <ResponsiveGridLayout
                layout={layout}
                cols={15}
                rowHeight={50}
                isDraggable={false}
                isResizable={false}
                compactType={null} 
            >
                {layout.map((mesa) => (
                    <Button key={mesa.i} variant="contained">{mesa.i}</Button>
                ))}
            </ResponsiveGridLayout>



            <div className="position-absolute bottom-0 start-0 w-100 p-3 d-flex align-items-end gap-3 flex-wrap">
                <Form.Group controlId="exampleForm.ControlInput1" className="mb-0">
                    <Form.Label>Código</Form.Label>
                    <Form.Control
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
                    {empresaData && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <BusinessIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                            <Typography variant="caption" color="text.secondary">
                                {empresaData.nombreEmpresa} - Sucursal #{empresaData.numeroSucursal}
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </div>

        </Container>

    );
}

export default Index;
