import { combineReducers, configureStore } from '@reduxjs/toolkit'
import visitasActivasReducer from './slices/visitasActivasSlice'
import notificacionesReducer from './slices/notificacionesSlice'
import mozoReducer from './slices/mozoSlice'
import codigoMozoReducer from './slices/codigoMozoSlice'
import ticketReducer from './slices/ticketSlice'
import cajaActivaReducer from './slices/cajaActivaSlice'
import storage from 'redux-persist/lib/storage'
import {
    FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    REHYDRATE,
    persistReducer
} from 'redux-persist'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['visitasActivas', 'notificaciones', 'ticket', 'mozo', 'codigoMozo', 'cajaActiva'],
}

const rootReducer = combineReducers({
    visitasActivas: visitasActivasReducer,
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
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})
