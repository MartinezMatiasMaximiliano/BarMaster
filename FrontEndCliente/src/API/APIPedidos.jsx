import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL
export function ProcesarPedidos(listaIds) {
    axios.put(`${BASE_URL}Items/Procesando`, listaIds)
        .then(function (response) {
            return (response);
        })
        .catch(function (error) {
            return (error);
        })
}

