import { BuscarTodosLosMozos } from "../../API/APIPersonas";

const data = await BuscarTodosLosMozos();
const mozos = data
  .filter(m => m.datosPersonales.activo === true)
  .map(m => (
    {
        id: m.id,
        nombre: m.datosPersonales.nombres + " " + m.datosPersonales.apellido
    }
  ));

export const Campos = [
  { name: "idMozo", label: "Mozo", type: "select", options: mozos },
];