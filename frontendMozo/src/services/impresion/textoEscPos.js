// Apply only to document text, never to the template's ESC/POS instructions.
export function limpiarTextoEscPos(valor) {
    return String(valor ?? '').replace(/\r\n?/g, '\n').replace(/\t/g, ' ')
        .replace(/\p{Cc}/gu, (caracter) => caracter === '\n' ? '\n' : '');
}
