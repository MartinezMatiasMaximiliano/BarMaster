import React, { useState, useEffect, useMemo } from 'react';
import Grafica_Pizza from "../components/Graficas/Grafica_Pizza";
import Grafica_Curva from "../components/Graficas/Grafica_Curva";
import Grafica_Barras from "../components/Graficas/Grafica_Barras";
import Mapa_Calor from "../components/Graficas/Mapa_calor";
import { TextField, Box, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { calcularCrecimientoMensual, formatearFecha, calcularGananciasPorHora, calcularGananciasPorFecha, contarMesas, contarPedidosPorDia, contarProductos } from '../components/Graficas/Funciones'
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { ObtenerTodasLasVisitas } from '../API/APIVisitas';
import { BuscarTodasLasMesas } from '../API/APIMesas';
import { BuscarTodosLosPlanos } from '../API/APIPlanos';
import { MappearPedidos } from '../Helpers/HelperFunctions';
import { filtrarMesasPorPlano } from './Index2/utils/mesaHelpers';

const COLS_GRID = 15;
const ROW_HEIGHT_GRID = 50;

/** Construye el layout para react-grid-layout desde las mesas de la API (x, y, w, h) */
function crearLayoutMesas(mesas) {
    if (!Array.isArray(mesas) || mesas.length === 0) return [];
    return mesas.map((m) => ({
        i: String(m.id ?? m.Id),
        x: Number(m.x ?? 0),
        y: Number(m.y ?? 0),
        w: Math.max(1, Number(m.w ?? 1)),
        h: Math.max(1, Number(m.h ?? 1)),
        nombre: m.nombre ?? m.Nombre ?? String(m.id ?? m.Id)
    }));
}

const Graficas = () => {
    const [visitas, setVisitas] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [planos, setPlanos] = useState([]);
    const [planoSeleccionado, setPlanoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError(null);
        Promise.all([
            ObtenerTodasLasVisitas(),
            BuscarTodasLasMesas(),
            BuscarTodosLosPlanos()
        ])
            .then(([resVisitas, resMesas, resPlanos]) => {
                if (!cancelado) {
                    setVisitas(Array.isArray(resVisitas) ? resVisitas : []);
                    setMesas(Array.isArray(resMesas) ? resMesas : []);
                    setPlanos(Array.isArray(resPlanos) ? resPlanos : []);
                    if (!planoSeleccionado && Array.isArray(resPlanos) && resPlanos.length > 0) {
                        setPlanoSeleccionado(String(resPlanos[0].id ?? resPlanos[0].Id ?? ''));
                    }
                }
            })
            .catch((err) => {
                if (!cancelado) {
                    setError(err?.message || 'Error al cargar datos');
                    setVisitas([]);
                    setMesas([]);
                    setPlanos([]);
                }
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });
        return () => { cancelado = true; };
    }, []);

    const mesasParaMapa = useMemo(() => filtrarMesasPorPlano(mesas, planoSeleccionado), [mesas, planoSeleccionado]);

    const layoutMesas = useMemo(() => crearLayoutMesas(mesasParaMapa), [mesasParaMapa]);

    const data = MappearPedidos(visitas);

    // --- Estados para el rango de fechas ---
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    // --- Filtrar los registros según las fechas seleccionadas ---
    const dataFiltrada = data.filter(pedido => {
        if (!fechaInicio || !fechaFin) return true; // si no se seleccionaron ambas fechas, mostrar todo
        const fechaPedido = new Date(pedido.fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaPedido >= inicio && fechaPedido <= fin;
    });

    var chipFecha = fechaInicio && fechaFin ? <Chip label={formatearFecha(fechaInicio) + " a " + formatearFecha(fechaFin)}></Chip> : <Chip label="Historico"></Chip>

    if (cargando) {
        return (
            <div className="container mt-4">
                <h2>Gráficas</h2>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <h2>Gráficas</h2>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2>Gráficas</h2>

            {/* --- Filtros de fecha --- */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem", width: "80vw" }}>
                <TextField
                    label="Desde"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: "12vw" }}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: "12vw" }}
                />
                <Button
                    variant="contained"
                    onClick={() => { setFechaInicio(""); setFechaFin(""); }}
                    sx={{ width: "7vw" }}
                >
                    Limpiar
                </Button>
            </div>
            <p>Si no se selecciona fecha, se mostrarán registros históricos</p>

            {/* --- Contenedor de gráficas --- */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 4 }}>
                <hr></hr>
                <Box>
                    <h3 style={{ textAlign: "center" }}>Ganancias por fecha {chipFecha}</h3>
                    <Grafica_Curva data={dataFiltrada} calcularDatos={calcularGananciasPorFecha} />
                </Box>
                <hr></hr>
                <Box>   
                    <h3 style={{ textAlign: "center" }}>Ganancias acumuladas {chipFecha}</h3>
                    <Grafica_Curva data={dataFiltrada} calcularDatos={calcularCrecimientoMensual} />
                </Box>
                <hr></hr>
                <Box>
                    <h3 style={{ textAlign: "center" }}>Mejores horarios {chipFecha}</h3>
                    <Grafica_Curva data={dataFiltrada} calcularDatos={calcularGananciasPorHora}></Grafica_Curva>
                </Box>
                <hr></hr>
                <Box>
                    <h3 style={{ textAlign: "center" }}>Mapa de calor por mesas {chipFecha}</h3>
                    {planos.length > 0 && (
                        <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
                            <InputLabel id="graficas-plano-label">Plano</InputLabel>
                            <Select
                                labelId="graficas-plano-label"
                                value={planoSeleccionado}
                                label="Plano"
                                onChange={(e) => setPlanoSeleccionado(e.target.value)}
                            >
                                {planos.map((p) => (
                                    <MenuItem key={p.id ?? p.Id} value={String(p.id ?? p.Id)}>
                                        {p.nombre ?? p.Nombre ?? p.id ?? p.Id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {layoutMesas.length === 0 ? (
                        <p style={{ textAlign: "center", color: "text.secondary" }}>
                            {mesas.length === 0 ? 'No hay mesas configuradas en los planos.' : 'No hay mesas en el plano seleccionado.'}
                        </p>
                    ) : (
                        <Mapa_Calor
                            dataFiltrada={dataFiltrada}
                            layout={layoutMesas}
                            cols={COLS_GRID}
                            rowHeight={ROW_HEIGHT_GRID}
                            contarMesas={contarMesas}
                        />
                    )}
                </Box>
                <hr></hr>
                <Box>
                    <h3 style={{ textAlign: "center" }}>Pedidos por día {chipFecha}</h3>
                    <Grafica_Barras
                        data={dataFiltrada}
                        calcularDatos={contarPedidosPorDia}
                        datosX={["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]}
                    />
                </Box>
                <hr></hr>
                <Box>
                    <h3 style={{ textAlign: "center" }}>Platos más consumidos {chipFecha}</h3>
                    <Grafica_Pizza
                        data={dataFiltrada}
                        calcularDatos={contarProductos}
                        limite={5}
                    />
                </Box>
            </Box>
        </div>
    );
};

export default Graficas;
