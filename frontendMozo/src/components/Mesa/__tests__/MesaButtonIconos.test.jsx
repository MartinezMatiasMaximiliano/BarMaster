import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MesaButton } from '../MesaButton';

describe('iconos de mesa en el plano', () => {
    it('muestra el icono de mesa libre en simpleStyle', () => {
        render(<MesaButton numeroMesa={1} variant="secondary" simpleStyle />);
        expect(screen.getByAltText('Mesa libre')).toHaveAttribute('src', '/iconos/mesa_blanca.png');
    });

    it('muestra el icono de mesa ocupada en simpleStyle', () => {
        render(<MesaButton numeroMesa={2} variant="success" simpleStyle />);
        expect(screen.getByAltText('Mesa ocupada')).toHaveAttribute('src', '/iconos/mesa_ocupada_blanca.png');
    });
});
