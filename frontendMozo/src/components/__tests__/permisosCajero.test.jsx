import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginContext } from '../../contexts/AppContexts';
import NavBar_Botones from '../NavBar/NavBar_Botones';
import Control_Login from '../Control_Login';

const token = (payload) => `x.${btoa(JSON.stringify(payload))}.x`;

describe('permisos de navegación del cajero', () => {
    afterEach(() => localStorage.clear());

    it('no muestra Gestión restringida, Reportes ni Historial en el menú', () => {
        render(<MemoryRouter><NavBar_Botones logeadoUsuario rol="cajero" cerrarSesion={() => {}} /></MemoryRouter>);
        fireEvent.click(screen.getByText('Gestión'));
        expect(screen.queryByText('Personas')).not.toBeInTheDocument();
        expect(screen.queryByText('Listado de Mozos')).not.toBeInTheDocument();
        expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
        expect(screen.queryByText('Historial')).not.toBeInTheDocument();
    });

    it('muestra Impresiones dentro de Configuración', () => {
        render(<MemoryRouter><NavBar_Botones logeadoUsuario rol="cajero" cerrarSesion={() => {}} /></MemoryRouter>);
        fireEvent.click(screen.getByText('Configuración'));
        expect(screen.getByRole('link', { name: 'Impresiones' })).toHaveAttribute('href', '/impresiones');
    });

    it('redirige al cajero que intenta abrir una ruta exclusiva de Admin', () => {
        localStorage.setItem('USER_token', token({ IdRol: 4 }));
        render(
            <LoginContext.Provider value={{ logeadoUsuario: true }}>
                <MemoryRouter initialEntries={['/reporte_ventas']}>
                    <Routes>
                        <Route path="/reporte_ventas" element={<Control_Login rolesPermitidos={[1]}><div>Reporte privado</div></Control_Login>} />
                        <Route path="/sistema_sucursal" element={<div>Mesas</div>} />
                    </Routes>
                </MemoryRouter>
            </LoginContext.Provider>
        );
        expect(screen.queryByText('Reporte privado')).not.toBeInTheDocument();
        expect(screen.getByText('Mesas')).toBeInTheDocument();
    });

    it('permite al Admin abrir las rutas restringidas', () => {
        localStorage.setItem('USER_token', token({ IdRol: 1 }));
        render(
            <LoginContext.Provider value={{ logeadoUsuario: true }}>
                <MemoryRouter>
                    <Control_Login rolesPermitidos={[1]}><div>Reporte privado</div></Control_Login>
                </MemoryRouter>
            </LoginContext.Provider>
        );
        expect(screen.getByText('Reporte privado')).toBeInTheDocument();
    });
});
