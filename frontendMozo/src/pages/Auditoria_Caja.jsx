import React, { useState, useEffect } from 'react'
import Grafica_Pizza from "../components/Graficas/Grafica_Pizza";
import Grafica_Curva from "../components/Graficas/Grafica_Curva";
import Grafica_Barras from "../components/Graficas/Grafica_Barras";
import Form from "react-bootstrap/Form";
import Grid from '@mui/material/Unstable_Grid2';
//Datatable
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5';
import jszip from 'jszip';

// Importar pdfmake y sus fuentes antes de inicializarlo con DataTables
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

const AuditoriaCaja = (props) => {
    pdfMake.vfs = pdfFonts.vfs; // Asigna las fuentes aquí
    DataTable.use(DT);
    DT.Buttons.jszip(jszip);
    DT.Buttons.pdfMake(pdfMake);

    const [mensajeAlerta, setMensajeAlerta] = useState();

    const [timeValue, setTimeValue] = useState(7); // Cantidad de tiempo
    const [timeUnit, setTimeUnit] = useState("days"); // Unidad de tiempo
    const [filteredData, setFilteredData] = useState([]);
    const cols = [
        { data: 'nombre' },
        { data: 'indicaciones' },
        { data: 'precio' },
        { data: 'fecha' },
        { data: 'mesa' }
    ]
    const data = props.datos_pedidos;

    const formatFecha = (fechaISO) => {
        return new Date(fechaISO).toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    function contarProductos(arr) {
        const conteo = {};

        // Contar la cantidad de cada producto
        arr.forEach(item => {
            conteo[item.nombre] = (conteo[item.nombre] || 0) + 1;
        });

        // Convertir el objeto en el formato requerido
        return Object.entries(conteo).map(([nombre, cantidad], index) => ({
            id: index,
            value: cantidad,
            label: nombre
        }));
    }

    function contarMesas(arr) {
        const conteo = {};

        // Contar la cantidad de cada mesa
        arr.forEach(item => {
            if (item.mesa !== undefined) {
                conteo[item.mesa] = (conteo[item.mesa] || 0) + 1;
            }
        });

        // Convertir el objeto en el formato requerido
        return Object.entries(conteo).map(([mesa, cantidad], index) => ({
            id: Number(mesa),
            value: cantidad,
            label: `Mesa ${mesa}`
        }));
    }

    function contarPedidosPorDia(pedidos) {
        // Creamos un arreglo con 7 elementos, todos inicializados a 0.
        const cantidadPorDia = [0, 0, 0, 0, 0, 0, 0];

        // Iteramos sobre los pedidos
        pedidos.forEach(pedido => {
            // Crear un objeto Date a partir de la fecha en formato ISO 8601
            const fechaObjeto = new Date(pedido.fecha);

            // Obtener el día de la semana (0 para domingo, 6 para sábado)
            const diaSemana = fechaObjeto.getDay();

            // Aumentar el conteo para el día correspondiente
            cantidadPorDia[diaSemana]++;
        });

        return cantidadPorDia;
    }

    function obtenerUltimos30Dias() {
        const days = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.getDate()); // Solo el número del día
        }
        return days.reverse(); // Para que estén en orden cronológico
    }

    function contarPedidosPorDiaUltimos30Dias(pedidos) {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30); // Incluye hoy

        // Crear mapa de fechas a índices del array
        const fechasIndex = {};
        const resultado = new Array(30).fill(0);
        for (let i = 0; i < 30; i++) {
            const fecha = new Date(hace30Dias);
            fecha.setDate(hace30Dias.getDate() + i);
            const clave = fecha.toISOString().split("T")[0];
            fechasIndex[clave] = i;
        }

        // Contar pedidos por fecha
        pedidos.forEach(pedido => {
            const fechaPedido = new Date(pedido.fecha);
            const clave = fechaPedido.toISOString().split("T")[0];
            if (Object.prototype.hasOwnProperty.call(fechasIndex, clave)) {
                resultado[fechasIndex[clave]]++;
            }
        });

        return resultado;
    }



    useEffect(() => {
        const now = new Date();
        let startDate = new Date();

        switch (timeUnit) {
            case "days":
                startDate.setDate(now.getDate() - timeValue);
                break;
            case "months":
                startDate.setMonth(now.getMonth() - timeValue);
                break;
            case "years":
                startDate.setFullYear(now.getFullYear() - timeValue);
                break;
            default:
                startDate = new Date("2000-01-01");
        }

        // Filtrar los registros cuya fecha es mayor o igual a la fecha límite
        const filtered = data.filter((item) => new Date(item.fecha) >= startDate).slice(0, 800);
        setFilteredData(filtered);
    }, [timeValue, timeUnit]);

    useEffect(() => {
        setMensajeAlerta(filteredData.length >= 800 ? <div className="alert alert-warning">Se muestran solo los primeros 800 registros</div> : null);
    }, [filteredData])

    const formattedData = filteredData.map(item => ({
        ...item,
        fecha: formatFecha(item.fecha) // Sobreescribe la fecha con el nuevo formato
    }));

    return (
        <div className="container mt-4">
            <h2>Auditoria de Caja</h2>

            <Grid container spacing={4} direction="column" className="mt-4">
                <Grid size={12}>
                    <Grafica_Pizza
                        data={data}
                        calcularDatos={contarProductos}
                        titulo="Platos más consumidos"
                        limite={5}
                    />
                </Grid>

                <Grid size={12}>
                    <Grafica_Pizza
                        data={data}
                        calcularDatos={contarMesas}
                        titulo="Mesas más frecuentes"
                        limite={10}
                    />
                </Grid>

                <Grid size={12}>
                    <Grafica_Curva
                        data={data}
                        calcularDatos={contarPedidosPorDiaUltimos30Dias}
                        dataX={obtenerUltimos30Dias()}
                        titulo="Ventas de los últimos 30 días"
                    />
                </Grid>

                <Grid size={12}>
                    <Grafica_Barras
                        data={data}
                        calcularDatos={contarPedidosPorDia}
                        datosX={["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]}
                        titulo="Pedidos por día"
                    />
                </Grid>
            </Grid>
            <Form.Group className="mb-3">
                <Form.Label>Mostrar registros de los ultimos:</Form.Label>
                <div className="d-flex">
                    <Form.Control
                        type="number"
                        value={timeValue}
                        min="1"
                        onChange={(e) => setTimeValue(Number(e.target.value))}
                        style={{ width: "100px", marginRight: "10px" }}
                    />
                    <Form.Select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}>
                        <option value="days">Dias</option>
                        <option value="months">Meses</option>
                        <option value="years">Anios</option>
                    </Form.Select>
                </div>
            </Form.Group>

            {mensajeAlerta}

            <DataTable
                data={formattedData}
                columns={cols}
                className="display"
                options={{
                    layout: {
                        topStart: 'buttons',
                    },
                    select: true,
                    language: {
                        decimal: ",",
                        thousands: ".",
                        processing: "Procesando...",
                        search: "Buscar:",
                        lengthMenu: "Mostrar _MENU_ registros",
                        info: "Mostrando _START_ al _END_ de _TOTAL_",
                        infoEmpty: "Mostrando 0 al 0 de 0 registros en total",
                        infoFiltered: "(filtrado de un total de _MAX_ registros)",
                        loadingRecords: "Cargando...",
                        zeroRecords: "No se encontraron resultados",
                        emptyTable: "Ningun dato disponible en esta busqueda",
                    }


                }}
            >
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Indicaciones</th>
                        <th>Precio</th>
                        <th>Fecha</th>
                        <th>Mesa</th>
                    </tr>
                </thead>
            </DataTable>
        </div>
    );
};

export default AuditoriaCaja;

