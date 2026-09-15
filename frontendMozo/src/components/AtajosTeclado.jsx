import { useEffect } from 'react';
import { instalarAtajosTeclado } from '../services/atajosTeclado';

export default function AtajosTeclado() {
    useEffect(() => instalarAtajosTeclado(), []);
    return null;
}

