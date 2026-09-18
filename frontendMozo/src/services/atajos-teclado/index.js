const SELECTOR_MODAL = '[role="dialog"], [data-keyboard-modal="true"]';
const visible = elemento => {
    if (elemento.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
    for (let actual = elemento; actual; actual = actual.parentElement) {
        const estilo = actual.ownerDocument.defaultView.getComputedStyle(actual);
        if (estilo.display === 'none' || estilo.visibility === 'hidden') return false;
    }
    return true;
};

export function crearAtajosTeclado({ hayModalActivo }) {
    const modales = documento => [...documento.querySelectorAll(SELECTOR_MODAL)].filter(visible);
    const manejarEnter = evento => {
        if (evento.key !== 'Enter' || evento.defaultPrevented || evento.isComposing || evento.keyCode === 229
            || evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey) return;
        const objetivo = evento.target;
        if (!objetivo?.closest || objetivo.closest('textarea, [contenteditable]:not([contenteditable="false"]), select, [role="combobox"], [role="listbox"], [role="option"], [role="menu"], [role="menuitem"]') || objetivo.closest('[aria-expanded="true"][aria-haspopup]')) return;
        const documento = objetivo.ownerDocument;
        const modal = hayModalActivo(documento) ? modales(documento).at(-1) : null;
        const dentro = modal?.contains(objetivo);
        const ambito = modal || objetivo.closest('form, [data-enter-scope="true"]');
        if (!ambito) return;
        if (evento.repeat) { evento.preventDefault(); return; }
        if ((!modal || dentro) && objetivo.closest('button, a, input[type="submit"], input[type="button"], [role="button"], [role="tab"]')) return;
        const selector = '[data-enter-action="true"], button[type="submit"], input[type="submit"]';
        const acciones = ambito.tagName === 'FORM' ? [...ambito.elements].filter(x => x.matches(selector)) : [...ambito.querySelectorAll(selector)];
        const accion = acciones.find(x => visible(x) && (!modal || x.closest(SELECTOR_MODAL) === modal));
        if (!accion) { if (modal && !dentro) evento.preventDefault(); return; }
        evento.preventDefault();
        if (accion.matches(':disabled') || accion.getAttribute('aria-disabled') === 'true' || accion.closest('[aria-busy="true"]')) return;
        accion.click();
    };
    const manejarEscape = evento => {
        if (evento.key !== 'Escape' || evento.defaultPrevented || evento.isComposing || evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey) return;
        const documento = evento.target?.ownerDocument;
        if (!documento || !hayModalActivo(documento) || [...documento.querySelectorAll('[role="listbox"], [role="menu"]')].some(visible)) return;
        const modal = modales(documento).at(-1);
        const cerrar = modal && [...modal.querySelectorAll('[data-escape-action="true"]')].find(x => visible(x) && x.closest(SELECTOR_MODAL) === modal);
        if (!cerrar) return;
        evento.preventDefault(); evento.stopPropagation();
        if (evento.repeat || cerrar.matches(':disabled') || cerrar.getAttribute('aria-disabled') === 'true' || cerrar.closest('[aria-busy="true"]')) return;
        cerrar.click();
    };
    const instalarAtajosTeclado = (documento = document) => { documento.addEventListener('keydown', manejarEnter); documento.addEventListener('keydown', manejarEscape, true); return () => { documento.removeEventListener('keydown', manejarEnter); documento.removeEventListener('keydown', manejarEscape, true); }; };
    return { manejarEnter, manejarEscape, instalarAtajosTeclado };
}
