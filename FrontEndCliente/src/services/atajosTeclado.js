const SELECTOR_MODAL = '[role="dialog"], [data-keyboard-modal="true"]';

function esVisible(elemento) {
    if (elemento.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
    for (let actual = elemento; actual; actual = actual.parentElement) {
        const estilo = actual.ownerDocument.defaultView.getComputedStyle(actual);
        if (estilo.display === 'none' || estilo.visibility === 'hidden') return false;
    }
    return true;
}

// Las acciones se declaran explícitamente; nunca se elige por texto/color del botón.
export function manejarEnter(evento) {
    if (evento.key !== 'Enter' || evento.defaultPrevented || evento.isComposing
        || evento.keyCode === 229 || evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey) return;
    const objetivo = evento.target;
    if (!objetivo?.closest) return;
    if (objetivo.closest('textarea, [contenteditable]:not([contenteditable="false"]), select, [role="combobox"], [role="listbox"], [role="option"], [role="menu"], [role="menuitem"]')
        || objetivo.closest('[aria-expanded="true"][aria-haspopup]')) return;

    const documento = objetivo.ownerDocument;
    const modales = [...documento.querySelectorAll(SELECTOR_MODAL)].filter(esVisible);
    const modal = modales.at(-1);
    const dentroDelModal = modal?.contains(objetivo);
    const ambito = modal || objetivo.closest('form, [data-enter-scope="true"]');
    if (!ambito) return;
    if (evento.repeat) { evento.preventDefault(); return; }
    // Un botón/enlace enfocado conserva su activación nativa.
    if ((!modal || dentroDelModal) && objetivo.closest('button, a, input[type="submit"], input[type="button"], [role="button"], [role="tab"]')) return;
    const selectorAccion = '[data-enter-action="true"], button[type="submit"], input[type="submit"]';
    const acciones = ambito.tagName === 'FORM'
        ? [...ambito.elements].filter((elemento) => elemento.matches(selectorAccion))
        : [...ambito.querySelectorAll(selectorAccion)];
    const accion = acciones.find((boton) => esVisible(boton)
        && (!modal || boton.closest(SELECTOR_MODAL) === modal));
    if (!accion) {
        if (modal && !dentroDelModal) evento.preventDefault();
        return;
    }
    evento.preventDefault();
    if (accion.matches(':disabled') || accion.getAttribute('aria-disabled') === 'true'
        || accion.closest('[aria-busy="true"]')) return;
    accion.click();
}

export function manejarEscape(evento) {
    if (evento.key !== 'Escape' || evento.defaultPrevented || evento.isComposing
        || evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey) return;
    const documento = evento.target?.ownerDocument;
    if (!documento) return;
    // Escape primero cierra un selector/menú abierto mediante su comportamiento nativo.
    if ([...documento.querySelectorAll('[role="listbox"], [role="menu"]')].some(esVisible)) return;
    const modal = [...documento.querySelectorAll(SELECTOR_MODAL)].filter(esVisible).at(-1);
    if (!modal) return;
    const cerrar = [...modal.querySelectorAll('[data-escape-action="true"]')]
        .find((boton) => esVisible(boton) && boton.closest(SELECTOR_MODAL) === modal);
    if (!cerrar) return; // Los modales sin marca conservan el cierre de la biblioteca.
    evento.preventDefault();
    evento.stopPropagation(); // Evita que MUI/Bootstrap cierre además otro modal.
    if (evento.repeat || cerrar.matches(':disabled')
        || cerrar.getAttribute('aria-disabled') === 'true' || cerrar.closest('[aria-busy="true"]')) return;
    cerrar.click();
}

export function instalarAtajosTeclado(documento = document) {
    documento.addEventListener('keydown', manejarEnter);
    documento.addEventListener('keydown', manejarEscape, true);
    return () => {
        documento.removeEventListener('keydown', manejarEnter);
        documento.removeEventListener('keydown', manejarEscape, true);
    };
}
