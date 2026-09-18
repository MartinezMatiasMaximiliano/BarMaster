import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useBusquedaProductosTeclado } from '../useBusquedaProductosTeclado';
import { FiltrosProductos } from '../../../Modals/Agregar_Pedidos/components/FiltrosProductos';

function MesaModalDePrueba({ activo = true, productosFiltrados = [], onAgregarProducto }) {
    const [busqueda, setBusqueda] = useState('');
    const { inputRef, panelRef } = useBusquedaProductosTeclado({
        activo,
        busqueda,
        productosFiltrados,
        onBusquedaChange: setBusqueda,
        onAgregarProducto
    });

    return (
        <div role="dialog" data-mesa-modal="true">
            <div ref={panelRef}>
                <input
                    ref={inputRef}
                    aria-label="Buscar productos"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                />
                <button type="button">Producto</button>
                <textarea aria-label="Indicaciones" />
            </div>
        </div>
    );
}

function MesaModalConBuscadorReal({ productosFiltrados = [], onAgregarProducto, onQuitarProducto }) {
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState(null);
    const { inputRef, panelRef } = useBusquedaProductosTeclado({
        activo: true,
        busqueda,
        productosFiltrados,
        onBusquedaChange: setBusqueda,
        onAgregarProducto,
        onQuitarProducto
    });

    return (
        <div role="dialog" data-mesa-modal="true">
            <div ref={panelRef}>
                <FiltrosProductos
                    busquedaInputRef={inputRef}
                    productos={[{ nombre: 'Café' }]}
                    categorias={[]}
                    busqueda={busqueda}
                    categoriaFiltro={categoria}
                    onBusquedaChange={setBusqueda}
                    onCategoriaChange={setCategoria}
                />
                <button type="button">Producto</button>
            </div>
        </div>
    );
}

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

describe('Atajo de búsqueda de productos en MesaModal', () => {
    it('escribe en el buscador y lo enfoca desde un elemento no editable', () => {
        render(<MesaModalDePrueba />);

        fireEvent.keyDown(screen.getByRole('button'), { key: 'C' });
        fireEvent.keyDown(document.body, { key: 'a' });

        const buscador = screen.getByLabelText('Buscar productos');
        expect(buscador.value).toBe('Ca');
        expect(document.activeElement).toBe(buscador);
    });

    it('actualiza y enfoca el Autocomplete usado por MesaModal', () => {
        render(<MesaModalConBuscadorReal />);

        fireEvent.keyDown(screen.getByRole('button', { name: 'Producto' }), { key: 'C' });

        const buscador = screen.getByRole('combobox', { name: 'Buscar productos' });
        expect(buscador.value).toBe('C');
        expect(document.activeElement).toBe(buscador);
    });

    it('agrega una unidad por cada Enter cuando queda un solo producto', () => {
        const producto = { id: 1, nombre: 'Café' };
        const agregar = vi.fn();
        render(<MesaModalConBuscadorReal productosFiltrados={[producto]} onAgregarProducto={agregar} />);
        const buscador = screen.getByRole('combobox', { name: 'Buscar productos' });
        fireEvent.change(buscador, { target: { value: 'caf' } });

        fireEvent.keyDown(buscador, { key: 'Enter' });
        fireEvent.keyDown(buscador, { key: 'Enter' });

        expect(agregar).toHaveBeenCalledTimes(2);
        expect(agregar).toHaveBeenNthCalledWith(1, producto);
        expect(agregar).toHaveBeenNthCalledWith(2, producto);
    });

    it('agrega con Enter aunque el foco no esté en Buscar productos', () => {
        const producto = { id: 1, nombre: 'Café' };
        const agregar = vi.fn();
        render(<MesaModalConBuscadorReal productosFiltrados={[producto]} onAgregarProducto={agregar} />);
        const buscador = screen.getByRole('combobox', { name: 'Buscar productos' });
        fireEvent.change(buscador, { target: { value: 'caf' } });
        fireEvent.blur(buscador);

        fireEvent.keyDown(document.body, { key: 'Enter' });

        expect(agregar).toHaveBeenCalledOnce();
        expect(agregar).toHaveBeenCalledWith(producto);
    });

    it('conserva Enter cuando el foco está en otro botón', () => {
        const producto = { id: 1, nombre: 'Café' };
        const agregar = vi.fn();
        render(<MesaModalConBuscadorReal productosFiltrados={[producto]} onAgregarProducto={agregar} />);
        const buscador = screen.getByRole('combobox', { name: 'Buscar productos' });
        fireEvent.change(buscador, { target: { value: 'caf' } });

        fireEvent.keyDown(screen.getByRole('button', { name: 'Producto' }), { key: 'Enter' });

        expect(agregar).not.toHaveBeenCalled();
    });

    it('quita una unidad por cada Supr cuando queda un solo producto', () => {
        const producto = { id: 1, nombre: 'Café' };
        const quitar = vi.fn();
        render(<MesaModalConBuscadorReal productosFiltrados={[producto]} onQuitarProducto={quitar} />);
        const buscador = screen.getByRole('combobox', { name: 'Buscar productos' });
        fireEvent.change(buscador, { target: { value: 'caf' } });

        fireEvent.keyDown(buscador, { key: 'Delete' });
        fireEvent.keyDown(buscador, { key: 'Delete' });

        expect(quitar).toHaveBeenCalledTimes(2);
        expect(quitar).toHaveBeenNthCalledWith(1, producto);
        expect(quitar).toHaveBeenNthCalledWith(2, producto);
    });

    it('no agrega con Enter si no hay búsqueda o hay más de un resultado', () => {
        const agregar = vi.fn();
        const productos = [{ id: 1, nombre: 'Café' }, { id: 2, nombre: 'Café doble' }];
        const { rerender } = render(
            <MesaModalConBuscadorReal productosFiltrados={[productos[0]]} onAgregarProducto={agregar} />
        );
        let buscador = screen.getByRole('combobox', { name: 'Buscar productos' });
        fireEvent.keyDown(buscador, { key: 'Enter' });

        rerender(<MesaModalConBuscadorReal productosFiltrados={productos} onAgregarProducto={agregar} />);
        buscador = screen.getByRole('combobox', { name: 'Buscar productos' });
        fireEvent.change(buscador, { target: { value: 'caf' } });
        fireEvent.keyDown(buscador, { key: 'Enter' });

        expect(agregar).not.toHaveBeenCalled();
    });

    it('conserva la escritura nativa en otros campos editables', () => {
        render(<MesaModalDePrueba />);
        const indicaciones = screen.getByLabelText('Indicaciones');

        fireEvent.keyDown(indicaciones, { key: 's' });

        expect(screen.getByLabelText('Buscar productos').value).toBe('');
    });

    it('redirige la escritura si el foco quedó en un campo detrás de MesaModal', () => {
        const campoExterno = document.createElement('input');
        campoExterno.setAttribute('aria-label', 'Código de mozo');
        document.body.append(campoExterno);
        render(<MesaModalDePrueba />);
        campoExterno.focus();

        fireEvent.keyDown(campoExterno, { key: '7' });

        const buscador = screen.getByLabelText('Buscar productos');
        expect(buscador.value).toBe('7');
        expect(document.activeElement).toBe(buscador);
    });

    it('no captura la escritura si hay otro modal por encima', () => {
        render(<MesaModalDePrueba />);
        const modalSuperior = document.createElement('div');
        modalSuperior.setAttribute('role', 'dialog');
        document.body.append(modalSuperior);

        fireEvent.keyDown(document.body, { key: 'x' });

        expect(screen.getByLabelText('Buscar productos').value).toBe('');
    });

    it('ignora diálogos ocultos por CSS que permanecen montados', () => {
        render(<MesaModalDePrueba />);
        const modalOculto = document.createElement('div');
        modalOculto.setAttribute('role', 'dialog');
        modalOculto.style.display = 'none';
        document.body.append(modalOculto);

        fireEvent.keyDown(document.body, { key: 'm' });

        expect(screen.getByLabelText('Buscar productos').value).toBe('m');
    });

    it('ignora modificadores, composición y el atajo cuando está inactivo', () => {
        render(<MesaModalDePrueba activo={false} />);

        fireEvent.keyDown(document.body, { key: 'a' });
        fireEvent.keyDown(document.body, { key: 'b', ctrlKey: true });
        fireEvent.keyDown(document.body, { key: 'c', isComposing: true });

        expect(screen.getByLabelText('Buscar productos').value).toBe('');
    });
});
