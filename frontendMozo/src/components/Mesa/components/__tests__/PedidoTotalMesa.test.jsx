import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PedidoTotalMesa } from '../PedidoTotalMesa';

afterEach(cleanup);

describe('Pedido total de la mesa', () => {
    it('muestra las indicaciones enviadas debajo del producto', () => {
        render(
            <PedidoTotalMesa
                visitaMesa={{
                    productosConsumidos: [{
                        id: 1,
                        nombre: 'Café',
                        precio: 100,
                        estadoPagado: false,
                        indicaciones: 'Sin azúcar'
                    }]
                }}
                titulo="Pedido total"
                subtitulo="Total"
                currencyFormatter={{ format: (valor) => `$${valor}` }}
                productosSeleccionados={[]}
                onToggleProducto={vi.fn()}
                productosProvisorios={[]}
            />
        );

        expect(screen.getByText('Indicaciones: Sin azúcar')).toBeInTheDocument();
    });

    it('integra el producto provisional sin mostrar el estado Por agregar', () => {
        render(
            <PedidoTotalMesa
                visitaMesa={{ productosConsumidos: [] }}
                titulo="Pedido total"
                subtitulo="Total"
                currencyFormatter={{ format: (valor) => `$${valor}` }}
                productosSeleccionados={[]}
                onToggleProducto={vi.fn()}
                productosProvisorios={[{
                    producto: { id: 2, nombre: 'Hamburguesa', precio: 500 },
                    cantidad: 1,
                    indicaciones: 'Sin cebolla'
                }]}
                onActualizarCantidadProvisoria={vi.fn()}
                onActualizarIndicacionesProvisorias={vi.fn()}
                onFocusIndicacionesProvisorias={vi.fn()}
                onBlurIndicacionesProvisorias={vi.fn()}
            />
        );

        expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
        expect(screen.queryByText('Por agregar')).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('Agregar indicaciones…')).toHaveValue('Sin cebolla');
    });
});
