import React, { useState } from 'react';
import Grafica_Pizza from "../components/Graficas/Grafica_Pizza";
import Grafica_Curva from "../components/Graficas/Grafica_Curva";
import Grafica_Barras from "../components/Graficas/Grafica_Barras";
import Mapa_Calor from "../components/Graficas/Mapa_calor";
import Grid from '@mui/material/Unstable_Grid2';
import { TextField } from "@mui/material";
import { calcularCrecimientoMensual, formatearFecha, calcularGananciasPorHora, mesas, calcularGananciasPorFecha, contarMesas, contarPedidosPorDia, contarProductos } from '../components/Graficas/Funciones'
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

const Graficas = (props) => {
    const data = props.datos_pedidos;

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

    console.log(dataFiltrada)
    function generarRegistros(cantidad = 100) {
        const nombres = [
            "Paella", "Pizza", "Milanesa", "Flan", "Tarta",
            "Empanadas", "Helado", "Hamburguesa", "Ensalada", "Sopa"
        ];

        const registros = [];
        const fechaInicio = new Date("2025-01-01T00:00:00Z");

        for (let i = 0; i < cantidad; i++) {
            const fecha = new Date(fechaInicio);
            fecha.setDate(fechaInicio.getDate() + i);

            const registro = {
                fecha: fecha.toISOString(),
                indicaciones: "",
                mesa: Math.floor(Math.random() * 20) + 1, // mesas del 1 al 20
                nombre: nombres[Math.floor(Math.random() * nombres.length)],
                precio: Math.floor(Math.random() * (100000 - 20000 + 1)) + 8000 // entre 8k y 20k
            };

            registros.push(registro);
        }

        return registros;
    }

    // Ejemplo de uso:
    const datos = generarRegistros(150);

    var chipFecha = fechaInicio && fechaFin ? <Chip label={formatearFecha(fechaInicio) + " a " + formatearFecha(fechaFin)}></Chip> : <Chip label="Historico"></Chip>

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
            <Grid container spacing={4} direction="column" className="mt-4">
                <hr></hr>
                <Grid size={12}>
                    <h3 style={{ textAlign: "center" }}>Ganancias por fecha {chipFecha}</h3>
                    <Grafica_Curva data={datos} calcularDatos={calcularGananciasPorFecha} />
                </Grid>
                <hr></hr>
                <Grid size={12}>   
                    <h3 style={{ textAlign: "center" }}>Ganancias acumuladas {chipFecha}</h3>
                    <Grafica_Curva data={dataFiltrada} calcularDatos={calcularCrecimientoMensual} />
                </Grid>
                <hr></hr>
                <Grid size={12}>
                    <h3 style={{ textAlign: "center" }}>Mejores horarios {chipFecha}</h3>
                    <Grafica_Curva data={dataFiltrada} calcularDatos={calcularGananciasPorHora}></Grafica_Curva>
                </Grid>
                <hr></hr>
                <Grid size={12}>
                    <h3 style={{ textAlign: "center" }}>Mapa de calor por mesas {chipFecha}</h3>
                    <Mapa_Calor
                        fechaInicio={fechaInicio}
                        fechaFin={fechaFin}
                        dataFiltrada={dataFiltrada}
                        mesas={mesas}
                        contarMesas={contarMesas}
                    />
                </Grid>
                <hr></hr>
                <Grid size={12}>
                    <h3 style={{ textAlign: "center" }}>Pedidos por día {chipFecha}</h3>
                    <Grafica_Barras
                        data={dataFiltrada}
                        calcularDatos={contarPedidosPorDia}
                        datosX={["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]}
                    />
                </Grid>
                <hr></hr>
                <Grid size={12}>
                    <h3 style={{ textAlign: "center" }}>Platos más consumidos {chipFecha}</h3>
                    <Grafica_Pizza
                        data={dataFiltrada}
                        calcularDatos={contarProductos}
                        limite={5}
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default Graficas;
