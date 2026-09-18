import axios from 'axios';
import api from '../axiosInstance';
import { obtenerTokenAccesoEstacion } from './almacenamientoEstacion';
const crear = token => { const cliente = axios.create({ baseURL: import.meta.env.VITE_BASE_URL }); cliente.interceptors.request.use(config => { const valor = token(); const tenant = localStorage.getItem('tenantId'); if (valor) config.headers.Authorization = `Bearer ${valor}`; if (tenant) config.headers['X-Tenant-ID'] = tenant; return config; }); return cliente; };
export const apiSucursal = api;
export const apiAdministrativa = crear(() => localStorage.getItem('USER_token') || localStorage.getItem('token'));
export const apiEstacion = crear(obtenerTokenAccesoEstacion);
