import { BuscarTodosLosMozos } from "../../API/APIPersonas";

export const Campos = [
  { name: "idMozo", label: "Mozo", type: "select", options: [] },
];

// Apenas carga el módulo, buscamos los mozos SIN await
// Esto es válido porque no bloquea la ejecución
BuscarTodosLosMozos().then(data => {
  const mozos = data
    .filter(m => m.datosPersonales.activo === true)
    .map(m => ({
      id: m.id,
      nombre: `${m.datosPersonales.nombres} ${m.datosPersonales.apellido}`,
    }));

  Campos[0].options = mozos; 
});
