import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useAtajoMesaTeclado } from '../useAtajoMesaTeclado';

function Prueba({ onNumeroMesa, activo = true, conCodigoMozo = false }) {
    const codigoMozoInputRef = useRef(null);
    useAtajoMesaTeclado({ activo, onNumeroMesa, codigoMozoInputRef });
    return <>
        <button type="button">Mesas</button>
        {conCodigoMozo && <input ref={codigoMozoInputRef} aria-label="Código de mozo" />}
    </>;
}

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

describe('Atajo Shift + número de mesa', () => {
    it('acumula todos los dígitos y abre una sola vez al soltar Shift', () => {
        const abrir = vi.fn();
        render(<Prueba onNumeroMesa={abrir} />);

        fireEvent.keyDown(document.body, { key: '$', code: 'Digit4', shiftKey: true });
        expect(abrir).not.toHaveBeenCalled();
        fireEvent.keyDown(document.body, { key: '"', code: 'Digit2', shiftKey: true });
        expect(abrir).not.toHaveBeenCalled();
        fireEvent.keyUp(document.body, { key: 'Shift', code: 'ShiftLeft' });

        expect(abrir).toHaveBeenCalledOnce();
        expect(abrir).toHaveBeenCalledWith(42);
    });

    it('no captura el atajo dentro de campos editables ni con un modal activo', () => {
        const abrir = vi.fn();
        const { container } = render(<><Prueba onNumeroMesa={abrir} /><input /></>);
        const input = container.querySelector('input');

        fireEvent.keyDown(input, { key: '!', code: 'Digit1', shiftKey: true });
        fireEvent.keyUp(input, { key: 'Shift' });

        const modal = document.createElement('div');
        modal.setAttribute('role', 'dialog');
        document.body.append(modal);
        fireEvent.keyDown(document.body, { key: '@', code: 'Digit2', shiftKey: true });
        fireEvent.keyUp(document.body, { key: 'Shift' });

        expect(abrir).not.toHaveBeenCalled();
    });

    it('captura el atajo desde Código de mozo y bloquea su escritura nativa', () => {
        const abrir = vi.fn();
        render(<Prueba onNumeroMesa={abrir} conCodigoMozo />);
        const codigo = document.querySelector('[aria-label="Código de mozo"]');
        codigo.focus();

        const primerDigito = new KeyboardEvent('keydown', {
            key: '$', code: 'Digit4', shiftKey: true, bubbles: true, cancelable: true
        });
        const segundoDigito = new KeyboardEvent('keydown', {
            key: '"', code: 'Digit2', shiftKey: true, bubbles: true, cancelable: true
        });
        codigo.dispatchEvent(primerDigito);
        codigo.dispatchEvent(segundoDigito);
        fireEvent.keyUp(codigo, { key: 'Shift', code: 'ShiftLeft' });

        expect(primerDigito.defaultPrevented).toBe(true);
        expect(segundoDigito.defaultPrevented).toBe(true);
        expect(codigo.value).toBe('');
        expect(abrir).toHaveBeenCalledOnce();
        expect(abrir).toHaveBeenCalledWith(42);
    });
});
