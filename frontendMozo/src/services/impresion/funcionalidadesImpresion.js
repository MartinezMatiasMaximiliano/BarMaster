function leerBooleano(valor, valorPredeterminado) {
    if (valor === undefined || valor === null || valor === '') return valorPredeterminado;
    return String(valor).toLowerCase() === 'true';
}

export const impresionDistribuidaHabilitada = leerBooleano(
    import.meta.env.VITE_IMPRESION_DISTRIBUIDA_HABILITADA,
    true,
);

export const trabajadorImpresionHabilitado = leerBooleano(
    import.meta.env.VITE_TRABAJADOR_IMPRESION_HABILITADO,
    true,
);
