import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { instalarAtajosTeclado as instalarMozo } from '../atajosTeclado';
import { instalarAtajosTeclado as instalarCliente } from '../../../../FrontEndCliente/src/services/atajosTeclado';
import AtajosTeclado from '../../components/AtajosTeclado';
import StockDialog from '../../pages/Stock/components/StockDialog';
import { Button, Dialog, MenuItem, Select } from '@mui/material';
import BootstrapModal from 'react-bootstrap/Modal';

function enter(objetivo, opciones = {}) {
    const evento = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...opciones });
    objetivo.dispatchEvent(evento);
    return evento;
}

function escape(objetivo, opciones = {}) {
    const evento = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...opciones });
    objetivo.dispatchEvent(evento);
    return evento;
}

describe.each([['mozo', instalarMozo], ['cliente', instalarCliente]])('Enter en frontend %s', (_, instalar) => {
    let detener;
    beforeEach(() => { document.body.innerHTML = ''; detener = instalar(); });
    afterEach(() => { detener(); document.body.innerHTML = ''; });

    it('envía un formulario y conserva su validación HTML', () => {
        document.body.innerHTML = '<form><input required><button type="submit">Guardar</button></form>';
        const enviar = vi.fn((evento) => evento.preventDefault());
        document.querySelector('form').addEventListener('submit', enviar);
        const campo = document.querySelector('input');
        enter(campo);
        expect(enviar).not.toHaveBeenCalled();
        campo.value = 'válido';
        enter(campo);
        expect(enviar).toHaveBeenCalledTimes(1);
    });

    it('activa la confirmación explícita aunque Cancelar esté antes', () => {
        document.body.innerHTML = '<div role="dialog"><input><button>Cancelar</button><button data-enter-action="true">Confirmar</button></div>';
        const cancelar = vi.fn(); const confirmar = vi.fn();
        document.querySelector('button').onclick = cancelar;
        document.querySelector('[data-enter-action]').onclick = confirmar;
        expect(enter(document.querySelector('input')).defaultPrevented).toBe(true);
        expect(confirmar).toHaveBeenCalledTimes(1);
        expect(cancelar).not.toHaveBeenCalled();
    });

    it('actúa sólo sobre el modal superior y no envía el formulario de fondo', () => {
        document.body.innerHTML = '<form><input><button type="submit">Enviar</button></form><div role="dialog"><button data-enter-action="true">Primero</button></div><div role="dialog"><button data-enter-action="true">Segundo</button></div>';
        const botones = [...document.querySelectorAll('button')];
        const acciones = botones.map(() => vi.fn());
        botones.forEach((boton, indice) => { boton.onclick = acciones[indice]; });
        enter(document.querySelector('input'));
        expect(acciones[0]).not.toHaveBeenCalled();
        expect(acciones[1]).not.toHaveBeenCalled();
        expect(acciones[2]).toHaveBeenCalledTimes(1);
    });

    it('no confirma el modal anterior si el superior no tiene acción principal', () => {
        document.body.innerHTML = '<div role="dialog"><input><button data-enter-action="true">Confirmar</button></div><div role="dialog">Elegir una operación</div>';
        const confirmar = vi.fn();
        document.querySelector('button').onclick = confirmar;
        expect(enter(document.querySelector('input')).defaultPrevented).toBe(true);
        expect(confirmar).not.toHaveBeenCalled();
    });

    it('reconoce los modales MUI que no utilizan Dialog', () => {
        document.body.innerHTML = '<div data-keyboard-modal="true"><input><button data-enter-action="true">Enviar pedido</button></div>';
        const enviar = vi.fn(); document.querySelector('button').onclick = enviar;
        enter(document.querySelector('input'));
        expect(enviar).toHaveBeenCalledTimes(1);
    });

    it.each(['hidden', 'style="display:none"', 'aria-hidden="true"'])('ignora un modal oculto mediante %s', (atributo) => {
        document.body.innerHTML = `<div role="dialog"><input><button data-enter-action="true">Visible</button></div><div ${atributo}><div role="dialog"><button data-enter-action="true">Oculto</button></div></div>`;
        const confirmar = vi.fn(); document.querySelector('button').onclick = confirmar;
        enter(document.querySelector('input'));
        expect(confirmar).toHaveBeenCalledTimes(1);
    });

    it.each(['disabled', 'aria-disabled="true"'])('respeta la acción bloqueada por %s', (atributo) => {
        document.body.innerHTML = `<div role="dialog"><input><button data-enter-action="true" ${atributo}>Guardar</button></div>`;
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        expect(enter(document.querySelector('input')).defaultPrevented).toBe(true);
        expect(guardar).not.toHaveBeenCalled();
    });

    it.each(['<textarea></textarea>', '<div contenteditable="true">Notas</div>', '<select><option>A</option></select>', '<input role="combobox">', '<div role="option" tabindex="0">A</div>'])('conserva Enter en controles con comportamiento propio: %s', (control) => {
        document.body.innerHTML = `<div role="dialog">${control}<button data-enter-action="true">Guardar</button></div>`;
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        expect(enter(document.querySelector('[role="dialog"]').firstElementChild).defaultPrevented).toBe(false);
        expect(guardar).not.toHaveBeenCalled();
    });

    it.each([{ shiftKey: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }])('no ejecuta combinaciones ni composición de texto: %j', (opciones) => {
        document.body.innerHTML = '<div role="dialog"><input><button data-enter-action="true">Guardar</button></div>';
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        enter(document.querySelector('input'), opciones);
        expect(guardar).not.toHaveBeenCalled();
    });

    it('no repite envíos al mantener Enter presionado', () => {
        document.body.innerHTML = '<div role="dialog"><input><button data-enter-action="true">Guardar</button></div>';
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        const campo = document.querySelector('input');
        enter(campo); enter(campo, { repeat: true });
        expect(guardar).toHaveBeenCalledTimes(1);
    });

    it('deja que Enter active el botón enfocado', () => {
        document.body.innerHTML = '<div role="dialog"><button>Cancelar</button><button data-enter-action="true">Aceptar</button></div>';
        const aceptar = vi.fn(); document.querySelector('[data-enter-action]').onclick = aceptar;
        expect(enter(document.querySelector('button')).defaultPrevented).toBe(false);
        expect(aceptar).not.toHaveBeenCalled();
    });

    it('soporta botones asociados a un formulario desde fuera de él', () => {
        document.body.innerHTML = '<form id="clave"><input></form><button form="clave" data-enter-action="true" type="button">Guardar</button>';
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        enter(document.querySelector('input'));
        expect(guardar).toHaveBeenCalledTimes(1);
    });

    it('guarda sólo la edición en línea que contiene el campo', () => {
        document.body.innerHTML = '<div data-enter-scope="true"><input><button data-enter-action="true">Equipo</button></div><div data-enter-scope="true"><input><button data-enter-action="true">Impresora</button></div>';
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        enter(document.querySelector('input'));
        expect(guardar).toHaveBeenCalledTimes(1);
    });

    it('respeta un evento ya manejado por el componente', () => {
        document.body.innerHTML = '<div role="dialog"><input><button data-enter-action="true">Guardar</button></div>';
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        const campo = document.querySelector('input');
        campo.addEventListener('keydown', (evento) => evento.preventDefault());
        enter(campo);
        expect(guardar).not.toHaveBeenCalled();
    });

    it('deja de escuchar al desmontarse', () => {
        document.body.innerHTML = '<div role="dialog"><input><button data-enter-action="true">Guardar</button></div>';
        const guardar = vi.fn(); document.querySelector('button').onclick = guardar;
        detener(); enter(document.querySelector('input'));
        expect(guardar).not.toHaveBeenCalled();
    });

    it('Escape cierra el modal desde un campo de notas sin confirmar', () => {
        document.body.innerHTML = '<div role="dialog"><textarea></textarea><button data-escape-action="true">Cancelar</button><button data-enter-action="true">Confirmar</button></div>';
        const cerrar = vi.fn(); const confirmar = vi.fn();
        document.querySelector('[data-escape-action]').onclick = cerrar;
        document.querySelector('[data-enter-action]').onclick = confirmar;
        expect(escape(document.querySelector('textarea')).defaultPrevented).toBe(true);
        expect(cerrar).toHaveBeenCalledTimes(1);
        expect(confirmar).not.toHaveBeenCalled();
    });

    it('Escape sólo cierra el modal superior, incluso con el foco fuera', () => {
        document.body.innerHTML = '<input><div role="dialog"><button data-escape-action="true">Primero</button></div><div data-keyboard-modal="true"><button data-escape-action="true">Segundo</button></div>';
        const primero = vi.fn(); const segundo = vi.fn();
        const botones = document.querySelectorAll('button');
        botones[0].onclick = primero; botones[1].onclick = segundo;
        escape(document.querySelector('input'));
        expect(primero).not.toHaveBeenCalled();
        expect(segundo).toHaveBeenCalledTimes(1);
    });

    it('Escape no duplica el cierre nativo de la biblioteca', () => {
        document.body.innerHTML = '<div role="dialog"><input><button data-escape-action="true">Cerrar</button></div>';
        const cerrar = vi.fn(); const nativo = vi.fn();
        document.querySelector('button').onclick = cerrar;
        document.querySelector('[role="dialog"]').addEventListener('keydown', nativo);
        escape(document.querySelector('input'));
        expect(cerrar).toHaveBeenCalledTimes(1);
        expect(nativo).not.toHaveBeenCalled();
    });

    it.each(['disabled', 'aria-disabled="true"'])('Escape respeta el cierre bloqueado por %s', (atributo) => {
        document.body.innerHTML = `<div role="dialog"><input><button data-escape-action="true" ${atributo}>Cerrar</button></div>`;
        const cerrar = vi.fn(); document.querySelector('button').onclick = cerrar;
        expect(escape(document.querySelector('input')).defaultPrevented).toBe(true);
        expect(cerrar).not.toHaveBeenCalled();
    });

    it.each(['listbox', 'menu'])('Escape deja que se cierre primero el desplegable %s', (rol) => {
        document.body.innerHTML = `<div role="dialog"><input><button data-escape-action="true">Cerrar</button></div><div role="${rol}">Opciones</div>`;
        const cerrar = vi.fn(); document.querySelector('button').onclick = cerrar;
        expect(escape(document.querySelector('input')).defaultPrevented).toBe(false);
        expect(cerrar).not.toHaveBeenCalled();
        document.querySelector(`[role="${rol}"]`).remove();
        escape(document.querySelector('input'));
        expect(cerrar).toHaveBeenCalledTimes(1);
    });

    it('mantener Escape no cierra el modal que estaba debajo', () => {
        document.body.innerHTML = '<div role="dialog"><button data-escape-action="true">Primero</button></div><div role="dialog"><button data-escape-action="true">Segundo</button></div>';
        const cerrarPrimero = vi.fn();
        const modales = document.querySelectorAll('[role="dialog"]');
        modales[0].querySelector('button').onclick = cerrarPrimero;
        modales[1].querySelector('button').onclick = () => modales[1].remove();
        escape(document.body);
        expect(modales[1].isConnected).toBe(false);
        escape(document.body, { repeat: true });
        expect(cerrarPrimero).not.toHaveBeenCalled();
    });

    it('un modal oculto no intercepta Escape', () => {
        document.body.innerHTML = '<div role="dialog"><button data-escape-action="true">Visible</button></div><div role="dialog" hidden><button data-escape-action="true">Oculto</button></div>';
        const cerrar = vi.fn(); document.querySelector('button').onclick = cerrar;
        escape(document.body);
        expect(cerrar).toHaveBeenCalledTimes(1);
    });

    it('Escape conserva el comportamiento nativo si no hay una acción de cierre declarada', () => {
        document.body.innerHTML = '<div role="dialog"><input></div>';
        const nativo = vi.fn();
        document.querySelector('[role="dialog"]').addEventListener('keydown', nativo);
        expect(escape(document.querySelector('input')).defaultPrevented).toBe(false);
        expect(nativo).toHaveBeenCalledTimes(1);
    });

    it('también elimina la escucha de Escape al desmontarse', () => {
        document.body.innerHTML = '<div role="dialog"><button data-escape-action="true">Cerrar</button></div>';
        const cerrar = vi.fn(); document.querySelector('button').onclick = cerrar;
        detener(); escape(document.body);
        expect(cerrar).not.toHaveBeenCalled();
    });
});

describe('Enter en el modal real de stock', () => {
    afterEach(cleanup);
    it('valida y bloquea otro envío mientras guarda', async () => {
        let terminar;
        const guardar = vi.fn(() => new Promise((resolve) => { terminar = resolve; }));
        const cerrar = vi.fn();
        render(<><AtajosTeclado /><StockDialog abierto producto={{ nombreProducto: 'Café' }} tipo="movimiento" onCerrar={cerrar} onGuardar={guardar} /></>);
        const cantidad = screen.getByRole('spinbutton', { name: /Cantidad/ });
        fireEvent.keyDown(cantidad, { key: 'Enter' });
        expect(guardar).not.toHaveBeenCalled();
        expect(screen.getByText('Ingresá una cantidad entera distinta de cero.')).toBeInTheDocument();
        fireEvent.change(cantidad, { target: { value: '3' } });
        fireEvent.keyDown(cantidad, { key: 'Enter' });
        expect(guardar).toHaveBeenCalledWith({ cantidad: 3, motivo: '' });
        fireEvent.keyDown(cantidad, { key: 'Enter' });
        expect(guardar).toHaveBeenCalledTimes(1);
        fireEvent.keyDown(cantidad, { key: 'Escape' });
        expect(cerrar).not.toHaveBeenCalled();
        terminar();
        await waitFor(() => expect(cerrar).toHaveBeenCalledTimes(1));
    });

    it('Escape ejecuta una sola vez el cierre del Dialog real', () => {
        const cerrar = vi.fn(); const guardar = vi.fn();
        render(<><AtajosTeclado /><StockDialog abierto producto={{ nombreProducto: 'Café' }} tipo="movimiento" onCerrar={cerrar} onGuardar={guardar} /></>);
        fireEvent.keyDown(screen.getByRole('spinbutton', { name: /Cantidad/ }), { key: 'Escape' });
        expect(cerrar).toHaveBeenCalledTimes(1);
        expect(guardar).not.toHaveBeenCalled();
    });

    it('Escape cierra primero un Select real y después su Dialog', async () => {
        const cerrar = vi.fn();
        render(<><AtajosTeclado /><Dialog open onClose={cerrar}>
            <Select value="a"><MenuItem value="a">Opción A</MenuItem></Select>
            <Button data-escape-action="true" onClick={cerrar}>Cerrar</Button>
        </Dialog></>);
        fireEvent.mouseDown(screen.getByRole('combobox'));
        fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape', keyCode: 27 });
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
        expect(cerrar).not.toHaveBeenCalled();
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
        expect(cerrar).toHaveBeenCalledTimes(1);
    });

    it('Escape ejecuta una sola vez el cierre de un modal Bootstrap real', () => {
        const cerrar = vi.fn();
        render(<><AtajosTeclado /><BootstrapModal show onHide={cerrar}>
            <BootstrapModal.Body>Confirmación</BootstrapModal.Body>
            <BootstrapModal.Footer><button data-escape-action="true" onClick={cerrar}>Cancelar</button></BootstrapModal.Footer>
        </BootstrapModal></>);
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
        expect(cerrar).toHaveBeenCalledTimes(1);
    });
});
