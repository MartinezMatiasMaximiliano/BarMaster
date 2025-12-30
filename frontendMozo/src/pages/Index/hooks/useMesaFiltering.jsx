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
 * Mapea una mesa a la estructura que espera el componente Mesa
 * @param {Object} mesa - Mesa desde la API
 * @returns {Object} Datos de mesa en formato esperado por el componente Mesa
 */
const mapearDatosMesa = (mesa) => ({
    id: mesa.id || mesa.Id,
    numeroMesa: mesa.nombre || mesa.Nombre || mesa.numeroMesa || `Mesa ${mesa.id || mesa.Id}`,
    codigoParaPedir: mesa.codigoParaPedir || null,
    persona: mesa.persona || null,
    plano: mesa.plano || null
});

/**
 * Hook para renderizar todas las mesas en formato grid
 * Muestra TODAS las mesas sin filtrar por plano
 * @param {Array} mesas - Array de todas las mesas
 * @param {Array} datosMozos - Array de mozos (no se usa actualmente pero se mantiene para compatibilidad)
 * @returns {Object} { mesasParaMostrar, ESTILO_MESAS }
 */
export const useMesaFiltering = (mesas, datosMozos) => {
    const mozo = useSelector((state) => state.mozo.value);

    // Renderizar TODAS las mesas sin filtrar por plano
    const mesasParaMostrar = useMemo(() => {
        if (!mesas || !Array.isArray(mesas) || mesas.length === 0) {
            return [];
        }

        // Mostrar todas las mesas sin importar el plano al que pertenecen
        return mesas.map((mesa, i) => {
            // Mapear la mesa a la estructura esperada
            const datosMesa = mapearDatosMesa(mesa);
            
            // Determinar el variant según el mozo asignado
            const variant = datosMesa.persona 
                ? datosMesa.persona.codigoDeServicio === mozo?.codigoDeServicio 
                    ? "success" 
                    : "primary" 
                : "secondary";
            
            return (
                <Mesa
                    key={datosMesa.id || i}
                    datos_mesa={datosMesa}
                    variant={variant}
                    mozo={mozo}
                    estilo={ESTILO_MESAS}
                />
            );
        });
    }, [mesas, mozo]);

    return { mesasParaMostrar, ESTILO_MESAS };
};

