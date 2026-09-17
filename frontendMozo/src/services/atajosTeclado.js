import { crearAtajosTeclado } from '@barmaster/atajos-teclado';
const selector = '[role="dialog"], [data-keyboard-modal="true"]';
export const hayModalActivo = (documento = document) => [...documento.querySelectorAll(selector)]
    .some(elemento => !elemento.closest('[hidden], [aria-hidden="true"], [inert]'));
export const { manejarEnter, manejarEscape, instalarAtajosTeclado } = crearAtajosTeclado({ hayModalActivo });
