import { useState, useMemo, useEffect } from "react";

/**
 * Hook personalizado para manejar la lógica de paginación
 * @param {Array} filas - Array de filas a paginar
 * @param {number} rowsPerPage - Número de filas por página
 * @param {boolean} habilitarPaginacion - Si la paginación está habilitada
 * @returns {Object} Objeto con filas paginadas, página actual, total de páginas y handlers
 */
export function usePaginacion(filas, rowsPerPage, habilitarPaginacion) {
    const [page, setPage] = useState(1);

    // Calcular las filas paginadas
    const filasPaginadas = useMemo(() => {
        if (!habilitarPaginacion) {
            return filas;
        }
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filas.slice(startIndex, endIndex);
    }, [filas, page, rowsPerPage, habilitarPaginacion]);

    // Calcular el número total de páginas
    const totalPages = useMemo(() => {
        if (!habilitarPaginacion) {
            return 1;
        }
        return Math.ceil(filas.length / rowsPerPage);
    }, [filas.length, rowsPerPage, habilitarPaginacion]);

    // Resetear a la página 1 cuando cambien las filas
    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(1);
        }
    }, [filas.length, totalPages, page]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return {
        filasPaginadas,
        page,
        totalPages,
        handlePageChange,
        rowsPerPage
    };
}

