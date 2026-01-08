import { combineReducers, configureStore } from '@reduxjs/toolkit'
import pedidosActivosReducer from './slices/pedidosActivosSlice'
import notificacionesReducer from './slices/notificacionesSlice'
import mozoReducer from './slices/mozoSlice'
import codigoMozoReducer from './slices/codigoMozoSlice'
import ticketReducer from './slices/ticketSlice'
import cajaActivaReducer from './slices/cajaActivaSlice'
import storage from 'redux-persist/lib/storage'
import { persistReducer } from 'redux-persist'
import {thunk} from 'redux-thunk'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['pedidosActivos', 'notificaciones', 'ticket', 'mozo', 'codigoMozo', 'cajaActiva'],
}

const rootReducer = combineReducers({
    pedidosActivos: pedidosActivosReducer,
    notificaciones: notificacionesReducer,
    ticket : ticketReducer,
    codigoMozo: codigoMozoReducer,
    mozo: mozoReducer,
    cajaActiva: cajaActivaReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],  // Ignorar la acci�n de persistencia
            },
        }).concat(thunk),
})