import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL

// TODO: Este archivo está deprecado. El endpoint "Pedidos" ya no existe.
// Ahora se usa el endpoint "Visitas". Ver APIVisitas.jsx
// Las funciones que quedan aquí todavía se usan en otros componentes
// pero probablemente necesiten ser actualizadas o eliminadas.

class ItemDTO {
    constructor(id, Indicaciones,) {
        this.Id = id;
        this.Indicaciones = Indicaciones;
    }
}

// TODO: Verificar si esta función todavía se usa y actualizar al nuevo endpoint si es necesario
export async function PostItems(ListaPedidos, numeroMesa) {
    try {
        const ListaItemsDTO = ListaPedidos.map(item => new ItemDTO(item.id, item.indicaciones));

        const response = await axios.post(`${BASE_URL}Items/${numeroMesa}`, ListaItemsDTO);

        return response.data; // Esto ahora sí devuelve la respuesta esperada
    } catch (error) {
        return []; // Devuelve un array vacío para evitar problemas en dispatch
    }
}

// TODO: Verificar si esta función todavía se usa y actualizar al nuevo endpoint si es necesario
export async function GenerarTicketPDF(NumeroMesa,ListaItems) {
    try {
        const response = await axios.post(`${BASE_URL}Pedidos/GenerarTicketPDF`, { NumeroMesa: NumeroMesa,ListaItems:ListaItems }, {
            responseType: 'blob', 
        });

        
        const blob = new Blob([response.data], { type: 'application/pdf' });

        // Create a URL for the Blob and open it
        const url = window.URL.createObjectURL(blob);
        window.open(url); // Or use download logic below
    } catch (error) {
        console.error('Error downloading PDF:', error);
    }
};


