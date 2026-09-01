import qz from 'qz-tray';
import { fetchQzCertificate, signQzDigest } from './printingApi';

let configured = false;

export function configureQzSecurity() {
    if (configured) return;

    qz.security.setCertificatePromise((resolve, reject) => {
        fetchQzCertificate().then(resolve).catch(reject);
    });
    qz.security.setSignatureAlgorithm('SHA512');
    qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
        signQzDigest(toSign).then(resolve).catch(reject);
    });
    configured = true;
}

export function resetQzSecurityForTests() {
    configured = false;
}

export default qz;
