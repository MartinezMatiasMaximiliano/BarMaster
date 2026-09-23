import { render, screen } from '@testing-library/react';
import { BottomBar } from '../BottomBar';

describe('BottomBar', () => {
    it('oculta por completo el ingreso y la validación de código para el operador automático', () => {
        render(<BottomBar ocultarCodigo codigoMozo="secreto" mozo={null} fechaHora={new Date(2026, 0, 1)} />);
        expect(screen.queryByLabelText('Código')).not.toBeInTheDocument();
        expect(screen.queryByText('Código incorrecto')).not.toBeInTheDocument();
        expect(screen.queryByText('secreto')).not.toBeInTheDocument();
    });

    it('conserva el ingreso de código en el flujo legacy', () => {
        render(<BottomBar codigoMozo="" mozo={null} fechaHora={new Date(2026, 0, 1)} />);
        expect(screen.getByLabelText('Código')).toBeInTheDocument();
        expect(screen.getByText('Código incorrecto')).toBeInTheDocument();
    });
});
