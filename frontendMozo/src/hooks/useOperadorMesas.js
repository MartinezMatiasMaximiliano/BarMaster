import { useMemo } from 'react';
import { useMozoCode } from '../pages/Index/hooks/useMozoCode';
import { authService } from '../services/authService';

export function useOperadorMesas(datosMozos = []) {
    const seleccionLegacy = useMozoCode(datosMozos);
    return useMemo(() => {
        const token = localStorage.getItem('USER_token');
        const claims = authService.decodeToken(token);
        const idRol = Number(claims?.IdRol);
        const accesoGlobal = Boolean(token && (idRol === 1 || idRol === 4));
        if (!accesoGlobal) return { ...seleccionLegacy, accesoGlobal: false, esAutomatico: false };

        const codigo = localStorage.getItem('USER_codigo_servicio') || '';
        return {
            codigoMozo: codigo,
            mozo: { id: claims.IdPersona, codigoDeServicio: codigo },
            accesoGlobal: true,
            esAutomatico: true,
        };
    }, [seleccionLegacy.codigoMozo, seleccionLegacy.mozo]);
}
