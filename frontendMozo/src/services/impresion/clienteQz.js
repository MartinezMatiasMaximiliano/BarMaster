import qz from 'qz-tray';
import { obtenerCertificadoQz, firmarResumenQz } from './apiImpresion';

let configured = false;

export function configurarSeguridadQz() {
    if (configured) return;

    qz.security.setCertificatePromise((resolve, reject) => {
        obtenerCertificadoQz().then(resolve).catch(reject);
    });
    qz.security.setSignatureAlgorithm('SHA512');
    qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
        firmarResumenQz(toSign).then(resolve).catch(reject);
    });
    configured = true;
}

export function reiniciarSeguridadQzParaPruebas() {
    configured = false;
}

export default qz;
