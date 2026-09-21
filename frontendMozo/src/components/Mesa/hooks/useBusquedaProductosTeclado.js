import { useEffect, useRef } from 'react';

const SELECTOR_EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"]';
const SELECTOR_ACCION = 'button, a[href], [role="button"], [role="checkbox"], [role="radio"], [role="tab"]';
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

export function useBusquedaProductosTeclado({
    activo,
    busqueda,
    productosFiltrados = [],
    onBusquedaChange,
    onAgregarProducto,
    onQuitarProducto
}) {
    const inputRef = useRef(null);
    const panelRef = useRef(null);
    const busquedaRef = useRef(busqueda);

    useEffect(() => {
        busquedaRef.current = busqueda;
    }, [busqueda]);

    useEffect(() => {
        if (!activo) return undefined;

        // El contenido de Dialog puede montarse después de este efecto por la
        // transición de apertura. Instalamos igualmente el listener y leemos
        // los refs recién cuando llega cada pulsación.
        const documento = panelRef.current?.ownerDocument
            ?? inputRef.current?.ownerDocument
            ?? (typeof document === 'undefined' ? null : document);
        if (!documento) return undefined;

        const manejarBusqueda = (evento) => {
            const esCaracter = evento.key?.length === 1;
            if (!esCaracter || evento.defaultPrevented || evento.isComposing || evento.keyCode === 229
                || evento.ctrlKey || evento.altKey || evento.metaKey) return;

            const input = inputRef.current;
            const panel = panelRef.current;
            if (!input || !panel || input.disabled || input.readOnly) return;

            const modalMesa = panel.closest(SELECTOR_MESA_MODAL);
            const modalesActivos = [...documento.querySelectorAll(SELECTOR_MODAL)].filter(estaVisible);
            if (!modalMesa || modalesActivos.at(-1) !== modalMesa) return;

            // Solo los controles editables de MesaModal conservan la escritura nativa.
            // El foco puede quedar en el código de mozo detrás del modal porque el diálogo
            // usa disableEnforceFocus; en ese caso la tecla debe iniciar la búsqueda.
            const editable = evento.target?.closest?.(SELECTOR_EDITABLE);
            if (editable && modalMesa.contains(editable)) return;

            evento.preventDefault();
            const nuevaBusqueda = `${busquedaRef.current ?? ''}${evento.key}`;
            busquedaRef.current = nuevaBusqueda;
            onBusquedaChange(nuevaBusqueda);
            input.focus();

            queueMicrotask(() => {
                if (documento.activeElement === input) {
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            });
        };

        documento.addEventListener('keydown', manejarBusqueda);
        return () => documento.removeEventListener('keydown', manejarBusqueda);
    }, [activo, onBusquedaChange]);

    useEffect(() => {
        if (!activo || (!onAgregarProducto && !onQuitarProducto)) return undefined;

        const documento = panelRef.current?.ownerDocument
            ?? inputRef.current?.ownerDocument
            ?? (typeof document === 'undefined' ? null : document);
        if (!documento) return undefined;

        const manejarCantidadProducto = (evento) => {
            const agregar = evento.key === 'Enter';
            const quitar = evento.key === 'Delete';
            if ((!agregar && !quitar) || evento.defaultPrevented || evento.repeat
                || evento.isComposing || evento.keyCode === 229
                || evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey
                || `${busquedaRef.current ?? ''}`.trim().length === 0
                || productosFiltrados.length !== 1) return;

            const input = inputRef.current;
            const panel = panelRef.current;
            if (!input || !panel) return;

            const modalMesa = panel.closest(SELECTOR_MESA_MODAL);
            const modalesActivos = [...documento.querySelectorAll(SELECTOR_MODAL)].filter(estaVisible);
            if (!modalMesa || modalesActivos.at(-1) !== modalMesa) return;

            // Enter y Supr también funcionan si el foco quedó en una zona neutra
            // de la mesa. Los campos de texto y botones conservan su acción propia.
            const editable = evento.target?.closest?.(SELECTOR_EDITABLE);
            const accion = evento.target?.closest?.(SELECTOR_ACCION);
            if ((editable && editable !== input) || accion) return;

            // Se captura antes que Autocomplete y que el atajo global de Enter.
            evento.preventDefault();
            evento.stopPropagation();
            if (agregar) {
                onAgregarProducto?.(productosFiltrados[0]);
            } else {
                onQuitarProducto?.(productosFiltrados[0]);
            }
        };

        documento.addEventListener('keydown', manejarCantidadProducto, true);
        return () => documento.removeEventListener('keydown', manejarCantidadProducto, true);
    }, [activo, onAgregarProducto, onQuitarProducto, productosFiltrados]);

    return { inputRef, panelRef };
}
