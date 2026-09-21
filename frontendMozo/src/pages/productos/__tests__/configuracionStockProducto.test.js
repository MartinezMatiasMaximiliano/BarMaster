import { describe, expect, it } from 'vitest';
import { agregarConfiguracionStock, crearConfiguracionStockEdicion } from '../configuracionStockProducto';

describe('configuración de stock al editar productos', () => {
    it('incorpora los valores actuales de stock a la fila del producto', () => {
        const [producto] = agregarConfiguracionStock(
            [{ id: 'coca', nombre: 'Coca 350ml' }],
            [{ idProducto: 'coca', controlaStock: true, enviarAlerta: true, cantidadMinima: 6, cantidadActual: 18 }],
        );

        expect(producto).toMatchObject({
            stockConfigurado: true,
            controlaStock: true,
            enviarAlerta: true,
            cantidadMinima: 6,
            cantidadActual: 18,
        });
    });

    it('no reinicializa la cantidad de un stock ya configurado', () => {
        expect(crearConfiguracionStockEdicion({
            stockConfigurado: true,
            controlaStock: true,
            enviarAlerta: true,
            cantidadMinima: 4,
        })).toEqual({
            controlaStock: true,
            enviarAlerta: true,
            cantidadMinima: 4,
            cantidadInicial: null,
        });
    });
});
