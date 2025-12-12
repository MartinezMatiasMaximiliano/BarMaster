import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { modificar as modificarCodigoMozo } from '../../../redux/slices/codigoMozoSlice';

export const useKeyboardInput = () => {
    const dispatch = useDispatch();
    const codigoMozo = useSelector((state) => state.codigoMozo.value);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignorar si el usuario está escribiendo en un input, textarea o está en un elemento editable
            const target = event.target;
            const isInputElement = target.tagName === 'INPUT' || 
                                  target.tagName === 'TEXTAREA' || 
                                  target.isContentEditable;
            
            // Si está escribiendo en el input del código, no hacer nada (evitar duplicación)
            if (isInputElement && target === inputRef.current) {
                return;
            }

            // Ignorar teclas especiales que no son caracteres
            const key = event.key;
            
            // Si es una tecla imprimible (letra, número, o algunos símbolos)
            if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                const nuevoCodigo = codigoMozo + key;
                dispatch(modificarCodigoMozo(nuevoCodigo));
            }
            // Manejar Backspace para borrar el último carácter
            else if (key === 'Backspace' && !isInputElement) {
                event.preventDefault();
                if (codigoMozo.length > 0) {
                    dispatch(modificarCodigoMozo(codigoMozo.slice(0, -1)));
                }
            }
            // Manejar Enter para limpiar el código
            else if (key === 'Enter' && !isInputElement) {
                event.preventDefault();
                dispatch(modificarCodigoMozo(''));
            }
        };

        // Agregar el event listener al document
        document.addEventListener('keydown', handleKeyDown);

        // Limpiar el event listener al desmontar
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [codigoMozo, dispatch]);

    return { inputRef };
};

