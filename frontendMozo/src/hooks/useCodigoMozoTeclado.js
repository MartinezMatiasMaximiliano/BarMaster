import { useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { modificar } from '../redux/slices/codigoMozoSlice';
import { hayModalActivo } from '../services/atajosTeclado';

// Solo se instala mientras la pantalla de mesas está montada.
export function useCodigoMozoTeclado({ limpiarConEscape = false, activo = true } = {}) {
    const inputRef = useRef(null);
    const store = useStore();

    useEffect(() => {
        if (!activo) return undefined;
        const documento = inputRef.current?.ownerDocument;
        if (!documento) return undefined;
        const manejarCodigo = (evento) => {
            const borrar = evento.key === 'Backspace' || evento.key === 'Delete';
            const limpiar = limpiarConEscape && evento.key === 'Escape';
            if ((!borrar && !limpiar && !/^[0-9]$/.test(evento.key)) || evento.defaultPrevented
                || evento.isComposing || evento.keyCode === 229
                || evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey) return;
            const input = inputRef.current;
            if (!input || input.disabled || hayModalActivo(documento)) return;
            const estado = store.getState();
            const codigo = estado.codigoMozo.value;
            const mozo = estado.mozo?.value;
            const reiniciar = /^[0-9]{4}$/.test(codigo)
                && mozo?.codigoDeServicio === codigo;
            // En otros campos se mantiene la escritura nativa. En el código,
            // interceptamos el borrado de a un dígito o el inicio del cambio de mozo.
            const editable = evento.target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"]');
            if (!limpiar && editable && (editable !== input || (!borrar && !reiniciar))) return;
            evento.preventDefault();
            const nuevoCodigo = limpiar ? '' : borrar ? `${codigo ?? ''}`.slice(0, -1)
                : reiniciar ? evento.key : `${codigo ?? ''}${evento.key}`;
            store.dispatch(modificar(nuevoCodigo));
            input.focus();
            // React actualiza el valor controlado; después ubicamos el cursor al final.
            queueMicrotask(() => {
                if (documento.activeElement === input) {
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            });
        };
        documento.addEventListener('keydown', manejarCodigo);
        return () => documento.removeEventListener('keydown', manejarCodigo);
    }, [activo, limpiarConEscape, store]);

    return inputRef;
}
