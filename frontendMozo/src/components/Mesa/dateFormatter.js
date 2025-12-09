// utils/dateFormatter.js
export const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${horas}:${minutos}`;
};

export const calcularTotalPrecio = (items = []) => {
    return items.reduce((acumulador, item) => 
        acumulador + parseFloat(item.precio), 0
    );
};