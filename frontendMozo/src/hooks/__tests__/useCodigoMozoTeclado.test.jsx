import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import codigoMozo, { modificar } from '../../redux/slices/codigoMozoSlice';
import mozo from '../../redux/slices/mozoSlice';
import { useCodigoMozoTeclado } from '../useCodigoMozoTeclado';

function Pantalla({ limpiarConEscape = false }) {
    const ref = useCodigoMozoTeclado({ limpiarConEscape });
    const codigo = useSelector((state) => state.codigoMozo.value);
    const dispatch = useDispatch();
    return <><input aria-label="Código" type="password" ref={ref} value={codigo}
        onChange={(evento) => dispatch(modificar(evento.target.value))} />
        <input aria-label="Otro campo" /><button>Mesa</button></>;
}

function montar(valor = '', mozoActivo = undefined, limpiarConEscape = false) {
    const store = configureStore({ reducer: { codigoMozo, mozo }, preloadedState: {
        codigoMozo: { value: valor }, mozo: { value: mozoActivo },
    } });
    return { store, ...render(<Provider store={store}><Pantalla limpiarConEscape={limpiarConEscape} /></Provider>) };
}

afterEach(() => { cleanup(); document.body.innerHTML = ''; });

describe('Números al código de mozo', () => {
    it.each(['Backspace', 'Delete'])('%s borra un dígito por pulsación, afuera y dentro del código', (key) => {
        montar('1234', { id: 1, codigoDeServicio: '1234' });
        const campo = screen.getByLabelText('Código');
        fireEvent.keyDown(screen.getByRole('button'), { key });
        expect(campo.value).toBe('123');
        expect(document.activeElement).toBe(campo);
        campo.setSelectionRange(0, 3);
        fireEvent.keyDown(campo, { key });
        expect(campo.value).toBe('12');
        fireEvent.keyDown(campo, { key });
        fireEvent.keyDown(campo, { key });
        fireEvent.keyDown(campo, { key });
        expect(campo.value).toBe('');
    });
    it.each(['Backspace', 'Delete'])('%s respeta otros campos, modales y combinaciones', (key) => {
        montar('1234');
        const campo = screen.getByLabelText('Código');
        fireEvent.keyDown(screen.getByLabelText('Otro campo'), { key });
        fireEvent.keyDown(document.body, { key, ctrlKey: true });
        const modal = document.createElement('div');
        modal.setAttribute('role', 'dialog');
        document.body.append(modal);
        fireEvent.keyDown(document.body, { key });
        fireEvent.keyDown(campo, { key });
        expect(campo.value).toBe('1234');
        modal.remove();
        fireEvent.keyDown(document.body, { key });
        expect(campo.value).toBe('123');
    });
    it.each(['afuera', 'código'])('inicia otro código con un mozo activo y foco en %s', (foco) => {
        montar('1234', { id: 1, codigoDeServicio: '1234' });
        const campo = screen.getByLabelText('Código');
        fireEvent.keyDown(foco === 'código' ? campo : document.body, { key: '0' });
        expect(campo.value).toBe('0');
        expect(document.activeElement).toBe(campo);
        // El mozo anterior aún en Redux no debe borrar el nuevo código parcial.
        fireEvent.keyDown(document.body, { key: '5' });
        expect(campo.value).toBe('05');
    });
    it.each([['1234', undefined], ['1234', { codigoDeServicio: '9999' }],
        ['123', { codigoDeServicio: '123' }]])('no reinicia sin cuatro dígitos válidos: %s, %j', (codigo, activo) => {
        montar(codigo, activo);
        fireEvent.keyDown(document.body, { key: '5' });
        expect(screen.getByLabelText('Código').value).toBe(`${codigo}5`);
    });
    it('con mozo activo respeta otros campos y bloquea el reinicio si hay un modal', () => {
        montar('1234', { id: 1, codigoDeServicio: '1234' });
        fireEvent.keyDown(screen.getByLabelText('Otro campo'), { key: '5' });
        const modal = document.createElement('div');
        modal.setAttribute('role', 'dialog');
        document.body.append(modal);
        fireEvent.keyDown(document.body, { key: '5' });
        fireEvent.keyDown(screen.getByLabelText('Código'), { key: '5' });
        expect(screen.getByLabelText('Código').value).toBe('1234');
    });
    it('redirige números, enfoca el campo y conserva ceros iniciales', () => {
        montar();
        fireEvent.keyDown(screen.getByRole('button'), { key: '0', code: 'Numpad0' });
        const campo = screen.getByLabelText('Código');
        expect(campo.value).toBe('0');
        expect(document.activeElement).toBe(campo);
        fireEvent.change(campo, { target: { value: '012' } });
        fireEvent.keyDown(document.body, { key: '3' });
        expect(campo.value).toBe('0123');
    });
    it.each(['role="dialog"', 'data-keyboard-modal="true"'])('bloquea modal activo %s aun con foco afuera', (atributo) => {
        montar('12');
        const modal = document.createElement('div');
        modal.innerHTML = `<div ${atributo}><input /></div>`;
        document.body.append(modal);
        fireEvent.keyDown(document.body, { key: '3' });
        expect(screen.getByLabelText('Código').value).toBe('12');
        modal.remove();
        fireEvent.keyDown(document.body, { key: '3' });
        expect(screen.getByLabelText('Código').value).toBe('123');
    });
    it('ignora modales ocultos', () => {
        montar();
        const modal = document.createElement('div');
        modal.innerHTML = '<div hidden><div role="dialog" /></div>';
        document.body.append(modal);
        fireEvent.keyDown(document.body, { key: '4' });
        expect(screen.getByLabelText('Código').value).toBe('4');
    });
    it('conserva escritura nativa en código y otros campos', () => {
        montar('12');
        fireEvent.keyDown(screen.getByLabelText('Código'), { key: '3' });
        fireEvent.keyDown(screen.getByLabelText('Otro campo'), { key: '4' });
        expect(screen.getByLabelText('Código').value).toBe('12');
    });
    it.each([{ key: 'a' }, { key: '1', ctrlKey: true }, { key: '1', altKey: true },
        { key: '1', metaKey: true }, { key: '1', isComposing: true }])('ignora %j', (tecla) => {
        montar();
        fireEvent.keyDown(document.body, tecla);
        expect(screen.getByLabelText('Código').value).toBe('');
    });
    it('retira el atajo al salir', () => {
        const { store, unmount } = montar();
        unmount();
        fireEvent.keyDown(document.body, { key: '1' });
        expect(store.getState().codigoMozo.value).toBe('');
    });

    it('Escape borra todo el código cuando está habilitado en Index', () => {
        montar('1234', { id: 1, codigoDeServicio: '1234' }, true);

        fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' });

        expect(screen.getByLabelText('Código').value).toBe('');
    });

    it('Escape cierra primero una ventana sin borrar el código', () => {
        montar('1234', { id: 1, codigoDeServicio: '1234' }, true);
        const modal = document.createElement('div');
        modal.setAttribute('role', 'dialog');
        document.body.append(modal);

        fireEvent.keyDown(document.body, { key: 'Escape' });

        expect(screen.getByLabelText('Código').value).toBe('1234');
    });
});
