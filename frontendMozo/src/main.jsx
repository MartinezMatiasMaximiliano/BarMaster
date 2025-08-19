import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import './styles/App.css';
import './styles/Mesas.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from "react-router-dom"
import { store } from './redux/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
        <BrowserRouter>
        <PersistGate loading={null} persistor={persistor}>
            <Provider store={store}>
                    <App />
            </Provider>
                </PersistGate>
        </BrowserRouter>
)

