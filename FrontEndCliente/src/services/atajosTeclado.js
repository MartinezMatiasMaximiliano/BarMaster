import { crearAtajosTeclado } from '@barmaster/atajos-teclado';
const selector = '[role="dialog"], [data-keyboard-modal="true"]';
const hayModalActivo = documento => [...documento.querySelectorAll(selector)]
    .some(elemento => !elemento.closest('[hidden], [aria-hidden="true"], [inert]'));
export const { manejarEnter, manejarEscape, instalarAtajosTeclado } = crearAtajosTeclado({ hayModalActivo });
