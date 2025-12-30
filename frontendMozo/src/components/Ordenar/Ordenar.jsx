import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

/**
 * Componente de ordenación para tablas ABM
 * @param {Array} filas - Array de filas a ordenar
 * @param {Array} opcionesOrdenamiento - Array de opciones de ordenamiento
 *   Cada opción debe tener: { label: string, campo: string, tipoOrden: 'fecha' | 'numero' | 'texto' }
 * @param {Function} onOrdenar - Callback que recibe las filas ordenadas
 */
function Ordenar({ filas, opcionesOrdenamiento = [], onOrdenar }) {
    // Si no hay opciones, no mostrar el componente
    if (!opcionesOrdenamiento || opcionesOrdenamiento.length === 0) {
        return null;
    }

    const [columnaSeleccionada, setColumnaSeleccionada] = useState(opcionesOrdenamiento[0]?.campo || '');
    const [direccionOrden, setDireccionOrden] = useState('ascendente');

    // Obtener la opción seleccionada
    const opcionSeleccionada = opcionesOrdenamiento.find(opt => opt.campo === columnaSeleccionada) || opcionesOrdenamiento[0];
    
    // Determinar las opciones de dirección según el tipo de ordenamiento
    const tipoOrden = opcionSeleccionada?.tipoOrden;
    let opcionesDireccion;
    
    if (tipoOrden === 'texto') {
        opcionesDireccion = [
            { value: 'ascendente', label: 'A-Z' },
            { value: 'descendente', label: 'Z-A' }
        ];
    } else if (tipoOrden === 'numero') {
        opcionesDireccion = [
            { value: 'ascendente', label: 'Ascendente' },
            { value: 'descendente', label: 'Descendente' }
        ];
    } else {
        // Para fechas
        opcionesDireccion = [
            { value: 'descendente', label: 'Más nuevo' },
            { value: 'ascendente', label: 'Más antiguo' }
        ];
    }

    const ordenarFilas = (campo, tipoOrden, direccion) => {
        if (!filas || filas.length === 0) {
            onOrdenar([]);
            return;
        }

        // Crear una copia del array para no mutar el original
        const filasOrdenadas = [...filas];
        
        // Ordenar según el tipo de campo
        filasOrdenadas.sort((a, b) => {
            let valorA = a[campo];
            let valorB = b[campo];
            
            // Manejar valores null/undefined
            if (valorA == null && valorB == null) return 0;
            if (valorA == null) return 1;
            if (valorB == null) return -1;
            
            // Convertir fechas a timestamps si es necesario
            if (tipoOrden === 'fecha') {
                valorA = new Date(valorA).getTime();
                valorB = new Date(valorB).getTime();
            } else if (tipoOrden === 'texto') {
                // Ordenar texto alfabéticamente
                valorA = String(valorA).toLowerCase();
                valorB = String(valorB).toLowerCase();
                if (direccion === 'ascendente') {
                    return valorA.localeCompare(valorB);
                } else {
                    return valorB.localeCompare(valorA);
                }
            }
            
            // Ordenar numéricamente o por fecha
            if (direccion === 'ascendente') {
                // Ascendente (más antiguo primero para fechas/números)
                return valorA - valorB;
            } else {
                // Descendente (más nuevo primero para fechas/números)
                return valorB - valorA;
            }
        });
        
        onOrdenar(filasOrdenadas);
    };

    const handleColumnaChange = (event) => {
        const nuevoCampo = event.target.value;
        setColumnaSeleccionada(nuevoCampo);
        const opcion = opcionesOrdenamiento.find(opt => opt.campo === nuevoCampo);
        if (opcion) {
            // Si cambia el tipo de ordenamiento, resetear a un valor por defecto apropiado
            const nuevoTipo = opcion.tipoOrden;
            const tipoAnterior = opcionSeleccionada?.tipoOrden;
            
            if (nuevoTipo !== tipoAnterior) {
                // Cambiar a un valor por defecto apropiado según el tipo
                let direccionPorDefecto = 'ascendente';
                if (nuevoTipo === 'fecha') {
                    direccionPorDefecto = 'descendente'; // Más nuevo por defecto para fechas
                }
                setDireccionOrden(direccionPorDefecto);
                ordenarFilas(nuevoCampo, opcion.tipoOrden, direccionPorDefecto);
            } else {
                ordenarFilas(nuevoCampo, opcion.tipoOrden, direccionOrden);
            }
        }
    };

    const handleDireccionChange = (event) => {
        const nuevaDireccion = event.target.value;
        setDireccionOrden(nuevaDireccion);
        ordenarFilas(columnaSeleccionada, opcionSeleccionada.tipoOrden, nuevaDireccion);
    };

    // Ordenar inicialmente cuando se monta el componente o cambian las filas
    useEffect(() => {
        if (columnaSeleccionada && opcionSeleccionada) {
            // Determinar dirección inicial según el tipo
            let direccionInicial = 'ascendente';
            if (opcionSeleccionada.tipoOrden === 'fecha') {
                direccionInicial = 'descendente'; // Más nuevo por defecto para fechas
            }
            
            if (!direccionOrden || direccionOrden === 'masNuevo' || direccionOrden === 'masAntiguo') {
                setDireccionOrden(direccionInicial);
                ordenarFilas(columnaSeleccionada, opcionSeleccionada.tipoOrden, direccionInicial);
            } else {
                ordenarFilas(columnaSeleccionada, opcionSeleccionada.tipoOrden, direccionOrden);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filas]);

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="columna-select-label">
                    <SortIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1rem' }} />
                    Ordenar por
                </InputLabel>
                <Select
                    labelId="columna-select-label"
                    id="columna-select"
                    value={columnaSeleccionada}
                    label="Ordenar por"
                    onChange={handleColumnaChange}
                >
                    {opcionesOrdenamiento.map((opcion) => (
                        <MenuItem key={opcion.campo} value={opcion.campo}>
                            {opcion.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="direccion-select-label">Orden</InputLabel>
                <Select
                    labelId="direccion-select-label"
                    id="direccion-select"
                    value={direccionOrden}
                    label="Orden"
                    onChange={handleDireccionChange}
                >
                    {opcionesDireccion.map((opcion) => (
                        <MenuItem key={opcion.value} value={opcion.value}>
                            {opcion.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    );
}

export default Ordenar;

