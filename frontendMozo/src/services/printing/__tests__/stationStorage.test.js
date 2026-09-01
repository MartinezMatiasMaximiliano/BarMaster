import {
    cacheAssignments, getAssignmentStorageKey, getClientInstallationId, getRegisteredStationId,
    readCachedAssignments, storeRegisteredStation,
} from '../stationStorage';
import { describe, expect, it } from 'vitest';

describe('stationStorage', () => {
    it('creates one stable station identity', () => {
        const first = getClientInstallationId();
        const second = getClientInstallationId();
        expect(first).toBe(second);
        expect(first).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it('namespaces assignments by tenant, branch and station', () => {
        localStorage.setItem('tenantId', 'tenant-a');
        localStorage.setItem('idSucursal', 'branch-a');
        storeRegisteredStation({ id: 'server-station-a' });
        const stationId = getRegisteredStationId();
        expect(getAssignmentStorageKey()).toBe(`barmaster.printing.tenant-a.branch-a.${stationId}.assignments`);
        cacheAssignments([{ role: 'Preticket' }]);
        expect(readCachedAssignments()).toEqual([{ role: 'Preticket' }]);
    });

    it('keeps a different server station per branch for one installation', () => {
        const installationId = getClientInstallationId();
        localStorage.setItem('tenantId', 'tenant-a');
        localStorage.setItem('idSucursal', 'branch-a');
        storeRegisteredStation({ id: 'station-a' });
        localStorage.setItem('idSucursal', 'branch-b');
        storeRegisteredStation({ id: 'station-b' });

        expect(getRegisteredStationId()).toBe('station-b');
        localStorage.setItem('idSucursal', 'branch-a');
        expect(getRegisteredStationId()).toBe('station-a');
        expect(getClientInstallationId()).toBe(installationId);
    });
});
