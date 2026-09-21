import { useEffect, useRef } from 'react';
import { hayModalActivo } from '../../../services/atajosTeclado';

const SELECTOR_EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"]';

const obtenerDigito = (evento) => {
    const coincidencia = /^(?:Digit|Numpad)([0-9])$/.exec(evento.code ?? '');
    return coincidencia?.[1] ?? null;
};

/**
 * Acumula los dígitos pulsados mientras Shift permanece presionado y recién
 * abre la mesa al soltar Shift. Así Shift+42 nunca ejecuta antes Shift+4.
 */
export function useAtajoMesaTeclado({ activo = true, onNumeroMesa, codigoMozoInputRef }) {
    const digitosRef = useRef('');

    useEffect(() => {
        if (!activo || !onNumeroMesa) return undefined;

        const documento = typeof document === 'undefined' ? null : document;
        if (!documento) return undefined;

        const limpiar = () => {
            digitosRef.current = '';
        };

        const confirmar = () => {
            const digitos = digitosRef.current;
            limpiar();
            if (!digitos) return;

            const numeroMesa = Number.parseInt(digitos, 10);
            if (Number.isSafeInteger(numeroMesa)) onNumeroMesa(numeroMesa);
        };

        const manejarKeyDown = (evento) => {
            const digito = obtenerDigito(evento);
            const editable = evento.target?.closest?.(SELECTOR_EDITABLE);
            const esCodigoMozo = editable != null && editable === codigoMozoInputRef?.current;
            if (!evento.shiftKey || digito === null || evento.repeat
                || evento.defaultPrevented || evento.isComposing || evento.keyCode === 229
                || evento.ctrlKey || evento.altKey || evento.metaKey
                || hayModalActivo(documento)
                || (editable && !esCodigoMozo)) return;

            evento.preventDefault();
            evento.stopPropagation();
            digitosRef.current += digito;
        };

        const manejarKeyUp = (evento) => {
            if (evento.key !== 'Shift' || !digitosRef.current) return;
            evento.preventDefault();
            evento.stopPropagation();
            confirmar();
        };

        documento.addEventListener('keydown', manejarKeyDown, true);
        documento.addEventListener('keyup', manejarKeyUp, true);
        window.addEventListener('blur', limpiar);
        return () => {
            documento.removeEventListener('keydown', manejarKeyDown, true);
            documento.removeEventListener('keyup', manejarKeyUp, true);
            window.removeEventListener('blur', limpiar);
        };
    }, [activo, codigoMozoInputRef, onNumeroMesa]);
}
