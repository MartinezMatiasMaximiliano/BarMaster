import { useEffect, useRef } from 'react';

const SELECTOR_MODAL = '[role="dialog"], [data-keyboard-modal="true"]';
const SELECTOR_MESA_MODAL = '[data-mesa-modal="true"]';

const estaVisible = (elemento) => {
    if (elemento.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
    for (let actual = elemento; actual; actual = actual.parentElement) {
        const estilo = actual.ownerDocument.defaultView.getComputedStyle(actual);
        if (estilo.display === 'none' || estilo.visibility === 'hidden') return false;
    }
    return true;
};

export function useAtajosAccionesMesa({
    activo,
    puedeImprimir,
    puedeCobrarTodo,
    puedeCobrarPartes,
    onImprimir,
    onCobrarTodo,
    onCobrarPartes,
}) {
    const cobrarTodoPendiente = useRef(false);

    useEffect(() => {
        if (!activo || typeof document === 'undefined') return undefined;

        const esMesaModalSuperior = () => {
            const modales = [...document.querySelectorAll(SELECTOR_MODAL)].filter(estaVisible);
            return modales.at(-1)?.matches(SELECTOR_MESA_MODAL) === true;
        };
        const consumir = (evento) => {
            evento.preventDefault();
            evento.stopPropagation();
        };
        const manejarKeyDown = (evento) => {
            if (evento.defaultPrevented || evento.repeat || evento.isComposing || evento.keyCode === 229
                || !evento.shiftKey || evento.ctrlKey || evento.altKey || evento.metaKey
                || !esMesaModalSuperior()) return;

            const tecla = evento.key.toLowerCase();
            if (tecla === 'i') {
                consumir(evento);
                cobrarTodoPendiente.current = false;
                if (puedeImprimir) onImprimir();
            } else if (tecla === 'c') {
                consumir(evento);
                cobrarTodoPendiente.current = true;
            } else if (tecla === 'x' && cobrarTodoPendiente.current) {
                consumir(evento);
                cobrarTodoPendiente.current = false;
                if (puedeCobrarPartes) onCobrarPartes();
            }
        };
        const manejarKeyUp = (evento) => {
            if (evento.key !== 'Shift' || !cobrarTodoPendiente.current) return;
            cobrarTodoPendiente.current = false;
            if (!esMesaModalSuperior()) return;
            consumir(evento);
            if (puedeCobrarTodo) onCobrarTodo();
        };

        document.addEventListener('keydown', manejarKeyDown, true);
        document.addEventListener('keyup', manejarKeyUp, true);
        return () => {
            cobrarTodoPendiente.current = false;
            document.removeEventListener('keydown', manejarKeyDown, true);
            document.removeEventListener('keyup', manejarKeyUp, true);
        };
    }, [activo, onCobrarPartes, onCobrarTodo, onImprimir, puedeCobrarPartes, puedeCobrarTodo, puedeImprimir]);
}
