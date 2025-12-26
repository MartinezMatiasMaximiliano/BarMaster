import React, { useState } from "react";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.grey[100],
        color: theme.palette.text.primary,
        fontWeight: 600,
        fontSize: '0.875rem',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: '0.875rem',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(even)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
        backgroundColor: theme.palette.action.selected,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

function ImageCell({ src }) {
    const [error, setError] = useState(false);
    const imageUrl = src ? `${import.meta.env.VITE_BASE_URL}${src}` : null;

    if (!imageUrl) {
        return (
            <Avatar
                variant="rounded"
                sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'grey.200',
                }}
            >
                <ImageNotSupportedIcon color="disabled" />
            </Avatar>
        );
    }

    if (error) {
        return (
            <Avatar
                variant="rounded"
                sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'grey.200',
                }}
            >
                <ImageNotSupportedIcon color="disabled" />
            </Avatar>
        );
    }

    return (
        <Box
            component="img"
            src={imageUrl}
            onError={() => setError(true)}
            alt="Producto"
            sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 1,
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'divider',
            }}
        />
    );
}

function defaultRender(row, col) {
    const value = col.value ? col.value(row) : (col.key ? row[col.key] : undefined);

    // Soporte nativo para imágenes
    if (col.type === "image") {
        return <ImageCell src={value} />;
    }

    if (Array.isArray(value)) return value.join(", ");
    return value ?? "";
}

export default function Tabla(props) {
    return (
        <Box sx={{ mt: 2 }}>
            {(typeof props.renderOrdenar === "function" || typeof props.renderFiltros === "function") && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {typeof props.renderFiltros === "function" && (
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            {props.renderFiltros()}
                        </Box>
                    )}
                    {typeof props.renderOrdenar === "function" && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {props.renderOrdenar()}
                        </Box>
                    )}
                </Box>
            )}
            <Card variant="outlined">
                <CardHeader
                    title={
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}
                        >
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                                {typeof props.renderAgregar === "function" ? props.renderAgregar() : null}
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                <Typography variant="h5" component="h2" fontWeight={600}>
                                    {props.titulo}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                {typeof props.onRefresh === "function" && (
                                    <Tooltip title="Recargar">
                                        <IconButton onClick={props.onRefresh} size="small">
                                            <RefreshIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    }
                    sx={{ pb: 1 }}
                />
                <Divider />
            <CardContent sx={{ p: 0 }}>
                <TableContainer
                    sx={{
                        maxHeight: "70vh",
                        overflowY: "auto",
                    }}
                >
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {props.columnas.map((col, i) => (
                                    <StyledTableCell key={col.key ?? i} align={col.align || "left"}>
                                        {col.label ?? ""}
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {props.filas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={props.columnas.length} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No hay registros para mostrar.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                props.filas.map((fila, rIdx) => (
                                    <StyledTableRow key={fila.id ?? rIdx} hover>
                                        {props.columnas.map((col, cIdx) => (
                                            <StyledTableCell
                                                key={`${col.key ?? cIdx}-${fila.id ?? rIdx}`}
                                                align={col.align || "left"}
                                            >
                                                {col.render ? col.render(fila) : defaultRender(fila, col)}
                                            </StyledTableCell>
                                        ))}
                                    </StyledTableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
            </Card>
        </Box>
    );
}
