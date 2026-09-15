import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AtajosTeclado from './components/AtajosTeclado'
import './styles/index.css'
import './styles/App.css';
import './styles/Producto.css'
import './styles/Pedido.css'
import './styles/Filtros.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from "react-router-dom"

ReactDOM.createRoot(document.getElementById('root')).render(
        <BrowserRouter>
            <AtajosTeclado />
            <App />
        </BrowserRouter>

)

