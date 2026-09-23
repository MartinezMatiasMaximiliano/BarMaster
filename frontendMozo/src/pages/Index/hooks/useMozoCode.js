import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { modificar as modificarMozo } from '../../../redux/slices/mozoSlice';
import { ValidarCodigoMozo } from '../../../API/APIPersonas';

export const useMozoCode = () => {
    const dispatch = useDispatch();
    const codigoMozo = useSelector((state) => state.codigoMozo.value);
    const mozo = useSelector((state) => state.mozo.value);

    useEffect(() => {
        let cancelado = false;
        const codigo = String(codigoMozo ?? '');

        if (!/^\d{4}$/.test(codigo)) {
            dispatch(modificarMozo(undefined));
            return () => { cancelado = true; };
        }

        dispatch(modificarMozo(undefined));
        ValidarCodigoMozo(codigo)
            .then(persona => {
                if (cancelado) return;
                dispatch(modificarMozo(persona ? {
                    id: persona.id ?? persona.Id,
                    nombre: persona.nombres ?? persona.Nombres ?? '',
                    apellido: persona.apellido ?? persona.Apellido ?? '',
                    personajeId: persona.personajeId ?? persona.PersonajeId ?? 0,
                    codigoDeServicio: codigo,
                } : undefined));
            })
            .catch(() => {
                if (!cancelado) dispatch(modificarMozo(undefined));
            });

        return () => { cancelado = true; };
    }, [codigoMozo, dispatch]);

    return { codigoMozo, mozo };
};

