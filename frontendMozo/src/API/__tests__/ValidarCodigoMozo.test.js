import { beforeEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../services/axiosInstance', () => ({ default: { post } }));

import { ValidarCodigoMozo } from '../APIPersonas';

describe('ValidarCodigoMozo', () => {
    beforeEach(() => post.mockResolvedValue({ data: null }));

    it('envía sólo el código ingresado al endpoint de validación', async () => {
        await expect(ValidarCodigoMozo('1111')).resolves.toBeNull();
        expect(post).toHaveBeenCalledWith('Mozos/ValidarCodigo', { codigo: '1111' });
    });
});
