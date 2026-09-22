import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: { get: vi.fn() } }));
vi.mock('../../services/axiosInstance', () => ({ default: api }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: vi.fn() }));

import { BuscarTodasLasVisitas, ObtenerTodasLasVisitas, obtenerRangoDiasVisitas } from '../APIVisitas';

describe('consulta de visitas por rango', () => {
    it('envía desde y hasta al endpoint', async () => {
        api.get.mockResolvedValue({ data: [] });
        const desde = '2026-09-01T00:00:00-03:00';
        const hasta = '2026-09-30T23:59:59.999-03:00';

        await ObtenerTodasLasVisitas(desde, hasta);

        expect(api.get).toHaveBeenCalledWith('TodasLasVisitas', {
            params: { desde, hasta },
        });
    });

    it('convierte el rango de días al horario de Argentina', () => {
        expect(obtenerRangoDiasVisitas('2026-09-01', '2026-09-30')).toEqual({
            desde: '2026-09-01T00:00:00-03:00',
            hasta: '2026-09-30T23:59:59.999-03:00',
        });
    });

    it('BuscarTodasLasVisitas filtra en backend antes de aplicar los demás filtros', async () => {
        api.get.mockResolvedValue({ data: [] });

        await BuscarTodasLasVisitas({ fechaInicio: '2026-09-01', fechaFin: '2026-09-30' });

        expect(api.get).toHaveBeenCalledWith('TodasLasVisitas', {
            params: {
                desde: '2026-09-01T00:00:00-03:00',
                hasta: '2026-09-30T23:59:59.999-03:00',
            },
        });
    });
});
