import { Fragment, useMemo, useState } from "react";
import { IconButton, Stack, TableBody, TableRow, TableCell, Typography } from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StyledTableRow, StyledTableCell } from "./Tabla.styles";
import { defaultRender } from "./defaultRender";

/**
 * Componente para el cuerpo de la tabla
 */
export default function TablaBody({
    filasPaginadas,
    columnas,
    onRowClick,
    getRowSx,
    grupos = [],
    getGrupoFila,
    conteosGrupos = {},
}) {
    const [gruposAbiertos, setGruposAbiertos] = useState({});
    const gruposPorClave = useMemo(
        () => new Map(grupos.map((grupo) => [grupo.key, grupo])),
        [grupos]
    );

    const grupoEstaAbierto = (clave) => gruposAbiertos[clave] ?? true;
    const alternarGrupo = (clave) => {
        setGruposAbiertos((actuales) => ({
            ...actuales,
            [clave]: !(actuales[clave] ?? true),
        }));
    };

    const renderFila = (fila, rIdx, grupo = null) => {
        const rowSx = getRowSx ? getRowSx(fila) : {};

        return (
            <StyledTableRow
                key={fila.id ?? rIdx}
                hover
                onClick={onRowClick ? () => onRowClick(fila) : undefined}
                sx={(theme) => {
                    const fondoBase = theme.palette.mode === 'dark'
                        ? theme.palette.grey[900]
                        : theme.palette.grey[50];
                    const fondoHover = theme.palette.mode === 'dark'
                        ? theme.palette.grey[700]
                        : theme.palette.grey[200];
                    return {
                        ...(onRowClick ? { cursor: 'pointer' } : {}),
                        ...(grupo ? {
                            bgcolor: fondoBase,
                            '&:hover': {
                                bgcolor: fondoHover,
                            },
                        } : {}),
                        ...(typeof rowSx === 'function' ? rowSx(theme) : rowSx),
                    };
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
        );
    };

    if (getGrupoFila && grupos.length > 0) {
        return (
            <TableBody>
                {grupos.map((grupo) => {
                    const filasGrupo = filasPaginadas.filter(
                        (fila) => getGrupoFila(fila) === grupo.key
                    );
                    const cantidad = conteosGrupos[grupo.key] || 0;
                    const abierto = grupoEstaAbierto(grupo.key);

                    return (
                        <Fragment key={grupo.key}>
                            <TableRow
                                hover
                                onClick={() => alternarGrupo(grupo.key)}
                                tabIndex={0}
                                aria-expanded={abierto}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        alternarGrupo(grupo.key);
                                    }
                                }}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell
                                    colSpan={columnas.length}
                                    sx={(theme) => {
                                        return {
                                            py: 0.5,
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? theme.palette.grey[700]
                                                : theme.palette.grey[300],
                                            borderTop: '2px solid',
                                            borderTopColor: theme.palette.grey[500],
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'dark'
                                                    ? theme.palette.grey[600]
                                                    : theme.palette.grey[400],
                                            },
                                        };
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <IconButton
                                            size="small"
                                            sx={{ p: 0.5 }}
                                            aria-label={abierto ? 'Ocultar sección' : 'Mostrar sección'}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                alternarGrupo(grupo.key);
                                            }}
                                        >
                                            {abierto ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                        <Typography
                                            variant="h6"
                                            color="text.primary"
                                            fontWeight={700}
                                            sx={{ fontSize: '1.05rem', lineHeight: 1.25 }}
                                        >
                                            {grupo.label} ({cantidad})
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                            {abierto && cantidad === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columnas.length}
                                        sx={(theme) => ({
                                            py: 2.5,
                                            pl: 3,
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? theme.palette.grey[900]
                                                : theme.palette.grey[50],
                                        })}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No hay productos para mostrar
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : abierto
                                ? filasGrupo.map((fila, rIdx) => renderFila(fila, rIdx, grupo))
                                : null}
                        </Fragment>
                    );
                })}
            </TableBody>
        );
    }

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
            {filasPaginadas.map((fila, rIdx) => renderFila(
                fila,
                rIdx,
                gruposPorClave.get(getGrupoFila?.(fila))
            ))}
        </TableBody>
    );
}

