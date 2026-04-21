import { TableBody, TableRow, TableCell, Typography } from "@mui/material";
import { StyledTableRow, StyledTableCell } from "./Tabla.styles";
import { defaultRender } from "./defaultRender";

/**
 * Componente para el cuerpo de la tabla
 */
export default function TablaBody({ filasPaginadas, columnas, onRowClick, getRowSx }) {
    if (filasPaginadas.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={columnas.length} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            No hay registros para mostrar.
                        </Typography>
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
        <TableBody>
            {filasPaginadas.map((fila, rIdx) => (
                <StyledTableRow
                    key={fila.id ?? rIdx}
                    hover
                    onClick={onRowClick ? () => onRowClick(fila) : undefined}
                    sx={{
                        ...(onRowClick ? { cursor: 'pointer' } : {}),
                        ...(getRowSx ? getRowSx(fila) : {}),
                    }}
                >
                    {columnas.map((col, cIdx) => (
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
    );
}

