import { useState, useEffect, useMemo } from 'react';
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

export const useMesaFiltering = (mesas, datosMozos) => {
    const mozo = useSelector((state) => state.mozo.value);
    const [listaMesas, setListaMesas] = useState([]);
    const [listaMesasFiltradas, setListaMesasFiltradas] = useState(undefined);

    // Renderizar mesas base
    useEffect(() => {
        if (mesas && Array.isArray(mesas)) {
            setListaMesas(mesas.map((mesa, i) => (
                <Mesa
                    key={i}
                    datos_mesa={mesa}
                    estilo={ESTILO_MESAS}
                />
            )));
        } else {
            setListaMesas([]);
        }
    }, [mesas]);

    // Filtrar mesas según mozo
    useEffect(() => {
        if (mozo && mesas && Array.isArray(mesas)) {
            setListaMesasFiltradas(mesas.map((mesa, i) => {
                const variant = mesa.persona 
                    ? mesa.persona.codigoDeServicio === mozo.codigoDeServicio 
                        ? "success" 
                        : "primary" 
                    : "secondary";
                
                return (
                    <Mesa
                        key={i}
                        datos_mesa={mesa}
                        variant={variant}
                        mozo={mozo}
                        estilo={ESTILO_MESAS}
                    />
                );
            }));
        } else {
            setListaMesasFiltradas(undefined);
        }
    }, [mesas, mozo]);

    const mesasParaMostrar = useMemo(() => 
        listaMesasFiltradas || listaMesas,
        [listaMesasFiltradas, listaMesas]
    );

    return { mesasParaMostrar, ESTILO_MESAS };
};

