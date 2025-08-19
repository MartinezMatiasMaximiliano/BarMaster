import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL

class ItemDTO {
    constructor(id, Indicaciones,) {
        this.Id = id;
        this.Indicaciones = Indicaciones;
    }
}

export async function BuscarTodosLosPedidos() {
    try {
        const response = await axios.get(BASE_URL + 'Pedidos');
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function BuscarUnPedido(PedidoId) {
    try {
        const response = await axios.get(`${BASE_URL}Pedidos/${PedidoId}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function PostItems(ListaPedidos, numeroMesa) {
    try {
        const ListaItemsDTO = ListaPedidos.map(item => new ItemDTO(item.id, item.indicaciones));

        const response = await axios.post(`${BASE_URL}Items/${numeroMesa}`, ListaItemsDTO);

        return response.data; // Esto ahora sí devuelve la respuesta esperada
    } catch (error) {
        return []; // Devuelve un array vacío para evitar problemas en dispatch
    }
}

export function PagarMesa(IdPedido) {
    axios.put(`${BASE_URL}Pagar/${IdPedido}`).then(function (response) {
        return (response);
    }).catch(function (error) {
        return (error);
    })
}

export function ProcesarPedidos(estado, ticket) {
    axios.put(`${BASE_URL}Items/${estado}`, ticket)
        .then(function (response) {
            return (response);
        })
        .catch(function (error) {
            return (error);
        })
}


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


