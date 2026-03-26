import { useMemo } from 'react';
import { preciosPlanes, preciosModulos } from '../utils/constants';

/**
 * Hook personalizado para calcular el desglose de facturación
 * @param {Array} empresas - Array de empresas con sus sucursales
 * @returns {Object} Objeto con desglose y total calculado
 */
export const useFacturacion = (empresas) => {
    const desgloseFacturacion = useMemo(() => {
        const desglose = [];
        
        empresas.forEach(empresa => {
            empresa.sucursales?.forEach(sucursal => {
                const items = [];
                let subtotal = 0;

                // Agregar plan
                if (sucursal.plan) {
                    const precioPlan = preciosPlanes[sucursal.plan.nombre] || 0;
                    items.push({
                        concepto: sucursal.plan.nombre,
                        tipo: 'Plan',
                        precio: precioPlan
                    });
                    subtotal += precioPlan;
                }

                // Agregar módulos
                if (sucursal.modulos && sucursal.modulos.length > 0) {
                    sucursal.modulos.forEach(modulo => {
                        const precioModulo = preciosModulos[modulo] || 0;
                        items.push({
                            concepto: modulo,
                            tipo: 'Módulo',
                            precio: precioModulo
                        });
                        subtotal += precioModulo;
                    });
                }

                desglose.push({
                    sucursal: sucursal.direccion,
                    items: items,
                    subtotal: subtotal
                });
            });
        });
        
        return desglose;
    }, [empresas]);

    const totalCalculado = useMemo(() => {
        return desgloseFacturacion.reduce((sum, item) => sum + item.subtotal, 0);
    }, [desgloseFacturacion]);

    return {
        desgloseFacturacion,
        totalCalculado
    };
};

