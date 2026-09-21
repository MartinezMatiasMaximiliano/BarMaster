import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const estadoQz = vi.hoisted(() => ({ valor: null }));
vi.mock('../../../contexts/ContextoImpresion', () => ({ usarImpresion: () => estadoQz.valor }));
import EstadoQz from '../EstadoQz';

beforeEach(() => {
    estadoQz.valor = { estado: 'inactivo', version: null, conectar: vi.fn().mockResolvedValue('2.2.6') };
});

it('comprueba QZ automáticamente al mostrarse', async () => {
    render(<EstadoQz />);
    await waitFor(() => expect(estadoQz.valor.conectar).toHaveBeenCalledOnce());
    expect(screen.getByText('Comprobando estado de impresión…')).toBeInTheDocument();
});

it('muestra el indicador verde cuando QZ está conectado', () => {
    estadoQz.valor = { estado: 'conectado', version: '2.2.6', conectar: vi.fn() };
    render(<EstadoQz />);
    expect(screen.getByText('Esta PC está lista para imprimir')).toBeInTheDocument();
    expect(screen.getByText('El servicio de impresión está conectado correctamente.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('muestra el indicador rojo y permite reintentar cuando QZ no responde', async () => {
    const conectar = vi.fn().mockRejectedValue(new Error('QZ no disponible'));
    estadoQz.valor = { estado: 'no_disponible', version: null, conectar };
    render(<EstadoQz />);
    expect(screen.getByText('Esta PC no está lista para imprimir')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a comprobar' }));
    await waitFor(() => expect(conectar).toHaveBeenCalledOnce());
});
