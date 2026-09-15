import { it, expect, vi } from 'vitest';
const { patch } = vi.hoisted(() => ({ patch: vi.fn().mockResolvedValue({ data: {} }) }));
vi.mock('../../services/axiosInstance', () => ({ default: { patch } }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: vi.fn() }));
vi.mock('../../components/Toast_Notificacion', () => ({ default: () => null }));
vi.mock('../../components/PersonajeSelector', () => ({ ChipNombreCompleto: () => null }));
vi.mock('../../services/sessionCleanup', () => ({ clearBranchSession: vi.fn() }));
import { MappearMenu } from '../../Helpers/HelperFunctions';
import { ModificarProducto } from '../APIProductos';
it.each([0, 123])('conserva costo %s al mapear y guardar edición', async costo => {
    const [fila] = MappearMenu([{ id: 'producto', costoProduccion: costo }]);
    expect(fila.costoProduccion).toBe(costo);
    await ModificarProducto(fila);
    expect(patch.mock.lastCall[1].CostoProduccion).toBe(costo);
});
