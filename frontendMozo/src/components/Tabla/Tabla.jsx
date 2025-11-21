import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

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
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

function defaultRender(row, col) {
    const value = col.value ? col.value(row) : (col.key ? row[col.key] : undefined);

    // Soporte nativo para imágenes
    if (col.type === "image") {
        if (!value) return null;
        return (
            <img
                src={`${import.meta.env.VITE_BASE_URL}${value}`}
                style={{ width: "100px", height: "80px", objectFit: "cover" }}
            />
        );
    }

    if (Array.isArray(value)) return value.join(", ");
    return value ?? "";
}

export default function Tabla(props) {
    console.log("FILA EN TABLA: ", props.filas)
    return (
        <>
            <h2 className="mt-2">{props.titulo}</h2>

            {typeof props.renderAgregar === "function" ? props.renderAgregar() : null}

            <TableContainer component={Paper} className="mt-4">
                <div
                    style={{
                        maxHeight: "70vh",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                >
                    <Table sx={{ minWidth: 650 }} aria-label="data table">
                        <TableHead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                            <TableRow>
                                {props.columnas.map((col, i) => (
                                    <StyledTableCell key={col.key ?? i} align={col.align || "left"}>
                                        {col.label ?? ""}
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {props.filas.map((fila, rIdx) => (
                                <StyledTableRow key={fila.id ?? rIdx}>
                                    {props.columnas.map((col, cIdx) => (
                                        <StyledTableCell
                                            key={`${col.key ?? cIdx}-${fila.id ?? rIdx}`}
                                            align={col.align || "left"}
                                        >
                                            {col.render ? col.render(fila) : defaultRender(fila, col)}
                                        </StyledTableCell>
                                    ))}
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TableContainer>
        </>
    );
}
