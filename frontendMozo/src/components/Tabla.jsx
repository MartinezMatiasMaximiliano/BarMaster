import React from "react"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus, faRotate } from '@fortawesome/free-solid-svg-icons';
import Modal_Eliminar from './Modal_Eliminar';
import Modal_Editar from "./Modal_Editar";
import Modal_Agregar from "./Modal_Agregar";
import Modal_Cambiar_Codigo_Mozo from "./Modal_Cambiar_Codigo_Mozo";
import Switch from "./Switch";
import { Button } from 'react-bootstrap'

function Tabla(props) {

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));
    var filas = props.datos;
    var columnas = props.columnas.filter(elem => elem !== "Acciones"); // Quito la columna acciones para el modal agregar
    const keysIgnoradas = ["id", "activo", "rol", "idMozo"] // Son datos que no quiero mostrar en la tabla (vienen de props.datos), pero necesito más adelante
    const paginasSinAcciones = ["Mozos", "Caja"]; // Son las paginas que no tendrán habilitados los botones de "acciones" (alta, baja, mod)

    return (
        <>
            <h2 className="mt-2">{props.titulo}</h2>
            {paginasSinAcciones.includes(props.titulo) ? (<></>) : <Modal_Agregar recargarComponentes={props.recargarComponentes} columnas={columnas} titulo_select={props.titulo_select} name_select={props.name_select} datos_select={props.datos_select} categorias={props.categorias} agregar={props.agregar}><FontAwesomeIcon icon={faSquarePlus} /></Modal_Agregar>}
            <TableContainer component={Paper} className="mt-4">
                <div style={{ maxHeight: "70vh", overflowY: "auto", border: "1px solid #ccc", borderRadius: "5px" }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                        <TableRow>
                            {props.columnas.map((col, i) => {
                                return col !== "Imagen" ? <StyledTableCell key={i} align="right">{col}</StyledTableCell> : <StyledTableCell key={i}></StyledTableCell>;
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filas.map((fila, i) => (
                            <StyledTableRow  key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                {Object.entries(fila).map(([key, value], i) => {
                                    if (!keysIgnoradas.includes(key)) {
                                        return (
                                            <StyledTableCell key={i} align="right">
                                                {Array.isArray(value) ? value.join(", ")
                                                    : key == "imagen" ? (<img src={import.meta.env.VITE_BASE_URL + value} style={{ width: "100px", height: "80px", objectFit:"cover" }}></img>)
                                                        : value}
                                            </StyledTableCell>
                                        );
                                    }
                                })}
                                {paginasSinAcciones.includes(props.titulo) ? (<></>) :
                                    (<StyledTableCell align="right">
                                        {props.titulo === "Mesas" ?
                                            (<div key={i}></div>)
                                            :
                                            (<Switch activo={fila.activo} id={fila.id} activar={props.activar} desactivar={props.desactivar}></Switch>)}
                                        <Modal_Editar recargarComponentes={props.recargarComponentes} fila={fila} titulo_select={props.titulo_select} name_select={props.name_select} datos_select={props.datos_select} categorias={props.categorias} activas={fila.categorias} modificar={props.modificar}></Modal_Editar>
                                        <Modal_Eliminar recargarComponentes={props.recargarComponentes} mensaje={props.titulo} nombre={fila.nombre} id={fila.id} eliminar={props.eliminar}></Modal_Eliminar>
                                    </StyledTableCell>)
                                }
                                {props.titulo === "Mozos" ? <StyledTableCell align="right"><Modal_Cambiar_Codigo_Mozo datos={fila} ></Modal_Cambiar_Codigo_Mozo></StyledTableCell> : null}
                            </StyledTableRow>

                        ))}
                    </TableBody>
                    </Table>
                </div>
            </TableContainer>
        </>
    );
}

export default Tabla;
