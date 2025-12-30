import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { modificar as modificarMozo } from '../../../redux/slices/mozoSlice';

export const useMozoCode = (datosMozos) => {
    const dispatch = useDispatch();
    const codigoMozo = useSelector((state) => state.codigoMozo.value);
    const mozo = useSelector((state) => state.mozo.value);

    useEffect(() => {
        if (datosMozos && Array.isArray(datosMozos) && datosMozos.length > 0) {
            const mozoEncontrado = datosMozos.find(m => m.codigoDeServicio === codigoMozo);
            dispatch(modificarMozo(mozoEncontrado));
        }
    }, [codigoMozo, datosMozos, dispatch]);

    return { codigoMozo, mozo };
};

