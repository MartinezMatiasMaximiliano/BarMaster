import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Mesa from '../../../components/Mesa/Mesa';

const ESTILO_MESAS = {
    width: "7vw",
    height: "10vh",
    minWidth: "80px",
    minHeight: "80px",
    maxWidth: "120px",
    maxHeight: "120px",
};

/**
 * Hook para renderizar todas las mesas en formato grid
 * Muestra TODAS las mesas sin filtrar por plano
 * @param {Array} mesas - Array de todas las mesas
 * @param {Array} datosMozos - Array de mozos (no se usa actualmente pero se mantiene para compatibilidad)
 * @param {boolean} hayCajaActiva - Indica si hay una caja activa
 * @returns {Object} { mesasParaMostrar, ESTILO_MESAS }
 */
export const useMesaFiltering = (mesas, datosMozos, hayCajaActiva = true) => {
    const mozo = useSelector((state) => state.mozo.value);

    // Renderizar TODAS las mesas sin filtrar por plano, ordenadas por nombre ascendente
    const mesasParaMostrar = useMemo(() => {
        if (!mesas || !Array.isArray(mesas) || mesas.length === 0) {
            return [];
        }

        const nombre = (mesa) => (mesa.nombre ?? mesa.Nombre ?? '').toString();
        const ordenadas = [...mesas].sort((a, b) =>
            nombre(a).localeCompare(nombre(b), undefined, { numeric: true })
        );

        return ordenadas.map((mesa, i) => {
            
            // Determinar el variant según el mozo asignado
            const variant = !mesa.visita || !mesa.visita.mozo
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
    }, [mesas, mozo, hayCajaActiva]);

    return { mesasParaMostrar, ESTILO_MESAS };
};

