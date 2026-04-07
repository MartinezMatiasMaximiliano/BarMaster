export function obtenerMensajeError(error, fallback = 'Ocurrió un error.') {
    return error?.response?.data?.message
        || error?.response?.data?.mensaje
        || error?.response?.data?.error?.mensaje
        || (typeof error?.response?.data === 'string' ? error.response.data : null)
        || error?.message
        || fallback;
}

export function construirError(error, fallback = 'Ocurrió un error.') {
    console.log("error", error);
    if (error?.isApiError) {
        return error;
    }

    const wrapped = new Error(obtenerMensajeError(error, fallback));
    wrapped.name = 'ApiError';
    wrapped.isApiError = true;
    wrapped.original = error;

    if (error?.response) {
        wrapped.response = error.response;
    }
    if (error?.request) {
        wrapped.request = error.request;
    }
    if (error?.code) {
        wrapped.code = error.code;
    }

    return wrapped;
}
