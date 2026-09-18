import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useAtajosAccionesMesa } from '../useAtajosAccionesMesa';

function MesaModalPrueba({ imprimir, cobrarTodo, cobrarPartes }) {
    useAtajosAccionesMesa({
        activo: true,
        puedeImprimir: true,
        puedeCobrarTodo: true,
        puedeCobrarPartes: true,
        onImprimir: imprimir,
        onCobrarTodo: cobrarTodo,
        onCobrarPartes: cobrarPartes,
    });
    return <div role="dialog" data-mesa-modal="true">Mesa</div>;
}

afterEach(cleanup);

describe('atajos de acciones de MesaModal', () => {
    it('ejecuta imprimir con Shift + I', () => {
        const imprimir = vi.fn();
        render(<MesaModalPrueba imprimir={imprimir} cobrarTodo={vi.fn()} cobrarPartes={vi.fn()} />);

        fireEvent.keyDown(document, { key: 'I', shiftKey: true });

        expect(imprimir).toHaveBeenCalledOnce();
    });

    it('cobra todo con Shift + C al soltar Shift', () => {
        const cobrarTodo = vi.fn();
        render(<MesaModalPrueba imprimir={vi.fn()} cobrarTodo={cobrarTodo} cobrarPartes={vi.fn()} />);

        fireEvent.keyDown(document, { key: 'C', shiftKey: true });
        fireEvent.keyUp(document, { key: 'Shift' });

        expect(cobrarTodo).toHaveBeenCalledOnce();
    });

    it('cobra por partes al pulsar C y X sin soltar Shift', () => {
        const cobrarTodo = vi.fn();
        const cobrarPartes = vi.fn();
        render(<MesaModalPrueba imprimir={vi.fn()} cobrarTodo={cobrarTodo} cobrarPartes={cobrarPartes} />);

        fireEvent.keyDown(document, { key: 'C', shiftKey: true });
        fireEvent.keyDown(document, { key: 'X', shiftKey: true });
        fireEvent.keyUp(document, { key: 'Shift' });

        expect(cobrarPartes).toHaveBeenCalledOnce();
        expect(cobrarTodo).not.toHaveBeenCalled();
    });
});
