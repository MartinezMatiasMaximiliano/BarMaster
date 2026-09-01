import axios from 'axios';
import api from '../axiosInstance';
import {
    cacheAssignments, getClientInstallationId, requireRegisteredStationId, storeRegisteredStation,
} from './stationStorage';

const administrativeApi = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });
let registrationPromise = null;

administrativeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('USER_token');
    const tenantId = localStorage.getItem('tenantId');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
    return config;
});

export async function fetchQzCertificate() {
    const response = await api.get('api/qz/certificate', {
        responseType: 'text',
        headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
}

export async function signQzDigest(request) {
    const stationId = requireRegisteredStationId();
    const response = await api.post('api/qz/sign', { request, stationId }, {
        responseType: 'text',
        headers: { 'X-Printing-Station-ID': stationId },
    });
    return response.data;
}

export async function getQzHealth() {
    const { data } = await api.get('api/qz/health');
    return data;
}

export async function getQzHealthDetails() {
    const client = localStorage.getItem('USER_token') ? administrativeApi : api;
    const { data } = await client.get('api/qz/health/details');
    return data;
}

export async function registerCurrentStation(name) {
    const clientInstallationId = getClientInstallationId();
    const { data } = await api.post('api/printing/stations/register', {
        clientInstallationId,
        name: name?.trim() || `Caja ${clientInstallationId.slice(0, 8)}`,
    });
    return storeRegisteredStation(data);
}

export function ensureCurrentStationRegistered(name) {
    if (!registrationPromise) {
        registrationPromise = registerCurrentStation(name).finally(() => { registrationPromise = null; });
    }
    return registrationPromise;
}

export async function heartbeatStation(stationId = requireRegisteredStationId()) {
    const { data } = await api.post(`api/printing/stations/${stationId}/heartbeat`);
    return data;
}

export async function fetchAssignments(stationId = requireRegisteredStationId()) {
    const { data } = await api.get(`api/printing/stations/${stationId}/assignments`);
    cacheAssignments(data);
    return data;
}

export async function saveAssignment(role, assignment, stationId = requireRegisteredStationId()) {
    const { data } = await administrativeApi.put(
        `api/printing/stations/${stationId}/assignments/${role}`,
        assignment,
    );
    return data;
}
