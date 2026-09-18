import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
    todas: vi.fn(), locales: vi.fn(), estacion: vi.fn(), alta: vi.fn(), sincronizar: vi.fn(),
    actualizar: vi.fn(), eliminar: vi.fn(), pruebaRemota: vi.fn(), imprimir: vi.fn(),
    conectar: vi.fn(), detectar: vi.fn(),
}));
vi.mock('../../../../contexts/ContextoImpresion', () => ({ usarImpresion: () => ({ conectar: mocks.conectar, actualizarImpresoras: mocks.detectar }) }));
vi.mock('../../../../services/impresion/apiImpresion', () => ({
    obtenerImpresoras: mocks.todas, obtenerImpresorasLocales: mocks.locales,
    obtenerEstacionActual: mocks.estacion, darAltaEstacionActual: mocks.alta,
    sincronizarInventarioImpresoras: mocks.sincronizar, actualizarImpresora: mocks.actualizar,
    eliminarImpresora: mocks.eliminar, solicitarPruebaRemotaImpresora: mocks.pruebaRemota,
}));
vi.mock('../../../../services/impresion/conexionQz', () => ({ obtenerVersionQz: vi.fn().mockResolvedValue('2.2.6') }));
vi.mock('../../../../services/impresion/impresionQz', () => ({ imprimirCrudo: mocks.imprimir }));
vi.mock('../../../../services/impresion/trabajadorImpresion', () => ({ reiniciarTrabajadorImpresion: vi.fn() }));
vi.mock('../../../../services/impresion/erroresQz', () => ({ normalizarErrorQz: (error) => ({ mensaje: error.message }) }));
vi.mock('../../../../services/impresion/impresorasQz', () => ({ esImpresoraPermitida: (nombre) => nombre !== 'Microsoft Print to PDF' }));
import EncontrarImpresoras from '../EncontrarImpresoras';

const local = { id: 'local', idEstacion: 'notebook', nombreEstacion: 'Notebook', nombreVisible: 'Mostrador', nombreSistema: 'EPSON', presente: true, habilitada: true };
const remota = { ...local, id: 'remota', idEstacion: 'host', nombreEstacion: 'Servidor', nombreVisible: 'Cocina' };

beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.todas.mockResolvedValue([local, remota]);
    mocks.locales.mockResolvedValue([local]);
    mocks.estacion.mockResolvedValue({ nombre: 'Notebook' });
    mocks.alta.mockResolvedValue({ nombre: 'Notebook' });
    mocks.detectar.mockResolvedValue(['EPSON']);
    mocks.sincronizar.mockResolvedValue([local]);
});

it('carga todas las registradas sin depender de QZ ni del registro del equipo local', async () => {
    mocks.locales.mockRejectedValue(new Error('Estación no registrada'));
    mocks.estacion.mockRejectedValue(new Error('Estación no registrada'));
    mocks.todas.mockResolvedValue([remota, { ...local, nombreVisible: 'Archivo', nombreSistema: 'Microsoft Print to PDF', presente: false }]);
    render(<EncontrarImpresoras />);
    const tabla = await screen.findByRole('table');
    expect(within(tabla).getByText('Cocina')).toBeInTheDocument();
    expect(within(tabla).getByText('Archivo')).toBeInTheDocument();
    expect(mocks.conectar).not.toHaveBeenCalled();
});

it('buscar en la notebook no oculta las impresoras de otros equipos con el mismo nombre de sistema', async () => {
    render(<EncontrarImpresoras />);
    await screen.findByRole('table');
    fireEvent.click(screen.getByRole('button', { name: 'Buscar', exact: true }));
    await waitFor(() => expect(mocks.todas).toHaveBeenCalledTimes(2));
    const tabla = screen.getByRole('table');
    expect(within(tabla).getByText('Cocina')).toBeInTheDocument();
    expect(within(tabla).getByText('Mostrador')).toBeInTheDocument();
});

it('envía la prueba al id de la impresora registrada, sin usar la cola local homónima', async () => {
    render(<EncontrarImpresoras />);
    const tabla = await screen.findByRole('table');
    const fila = within(tabla).getByText('Cocina').closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Probar' }));
    await waitFor(() => expect(mocks.pruebaRemota).toHaveBeenCalledWith('remota'));
    expect(mocks.imprimir).not.toHaveBeenCalled();
});

it('muestra el fallo de carga y permite volver a consultar la base', async () => {
    mocks.todas.mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValue([remota]);
    render(<EncontrarImpresoras />);
    expect(await screen.findByText(/No se pudieron cargar las impresoras guardadas/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar', exact: true }));
    const tabla = await screen.findByRole('table');
    expect(within(tabla).getByText('Cocina')).toBeInTheDocument();
    expect(screen.queryByText(/No se pudieron cargar las impresoras guardadas/)).not.toBeInTheDocument();
});
