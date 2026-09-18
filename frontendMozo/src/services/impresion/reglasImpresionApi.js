import { apiAdministrativa } from './clienteImpresion';
export async function obtenerReglasImpresion() { return (await apiAdministrativa.get('impresion/reglas')).data; }
export async function guardarReglaImpresion(regla) { return (await apiAdministrativa.put('impresion/reglas', regla)).data; }
export async function eliminarReglaImpresion(id) { await apiAdministrativa.delete(`impresion/reglas/${id}`); }
export async function validarReglasImpresion() { return (await apiAdministrativa.post('impresion/reglas/validar')).data; }
