import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Mesa from '../../../components/Mesa/Mesa';

const ESTILO_MESAS = {
    width: '100%',
    minWidth: 0,
    minHeight: 96,
    mx: 0,
    py: 1,
    px: 1,
    '& img': { maxWidth: 40, maxHeight: 40 },
    '& .MuiTypography-root': { fontSize: '0.75rem', overflowWrap: 'anywhere' },
};

/**
 * Hook para renderizar todas las mesas en formato grid
 * Muestra TODAS las mesas sin filtrar por plano
 * @param {Array} mesas - Array de todas las mesas
 * @param {Array} datosMozos - Array de mozos (no se usa actualmente pero se mantiene para compatibilidad)
 * @param {boolean} hayCajaActiva - Indica si hay una caja activa
 * @returns {Object} { mesasParaMostrar, ESTILO_MESAS }
 */
export const useMesaFiltering = (mesas, datosMozos, hayCajaActiva = true, operador) => {
    const mozoRedux = useSelector((state) => state.mozo.value);
    const mozo = operador?.mozo ?? mozoRedux;
    const accesoGlobal = operador?.accesoGlobal === true;

    // Renderizar TODAS las mesas sin filtrar por plano, ordenadas por número ascendente
    const mesasParaMostrar = useMemo(() => {
        if (!mesas || !Array.isArray(mesas) || mesas.length === 0) {
            return [];
        }

        const ordenadas = [...mesas].sort((a, b) =>
            (a.numero ?? a.Numero) - (b.numero ?? b.Numero)
        );

        return ordenadas.map((mesa, i) => {
            
            // Determinar el variant según el mozo asignado
            const variant = accesoGlobal
                ? (mesa.visita ? "success" : "secondary")
                : !mesa.visita || !mesa.visita.mozo
                ? "secondary"
                : mozo && mesa.visita.mozo.codigoDeServicio === mozo.codigoDeServicio
                    ? "success"
                    : "primary";
            
            return (
                <Mesa
                    key={mesa.id || i}
                    datos_mesa={mesa}
                    variant={variant}
                    mozo={mozo}
                    estilo={ESTILO_MESAS}
                    hayCajaActiva={hayCajaActiva}
                />
            );
        });
    }, [mesas, mozo, hayCajaActiva, accesoGlobal]);

    return { mesasParaMostrar, ESTILO_MESAS };
};

