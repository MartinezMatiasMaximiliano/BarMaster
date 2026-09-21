export function crearEsperaTrabajador(ms, signal) {
    let finalizar;
    const promesa = new Promise((resolve) => {
        let terminada = false;
        let temporizador;
        finalizar = () => {
            if (terminada) return;
            terminada = true;
            clearTimeout(temporizador);
            signal?.removeEventListener('abort', finalizar);
            resolve();
        };
        if (signal?.aborted) {
            finalizar();
            return;
        }
        signal?.addEventListener('abort', finalizar, { once: true });
        temporizador = setTimeout(finalizar, ms);
    });
    return { promesa, finalizar };
}
