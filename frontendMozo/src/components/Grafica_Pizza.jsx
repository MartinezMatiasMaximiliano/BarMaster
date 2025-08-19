import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

export default function Grafica_Pizza(props) {

    const datos = props.calcularDatos(props.data);

    function agruparPrincipales(datos, maxItems = 5) {
        const ordenados = [...datos].sort((a, b) => b.value - a.value);

        const principales = ordenados.slice(0, maxItems);
        const resto = ordenados.slice(maxItems);

        const totalOtros = resto.reduce((acc, item) => acc + item.value, 0);

        if (totalOtros > 0) {
            principales.push({
                id: 'otros',
                value: totalOtros,
                label: 'Otros',
            });
        }

        return principales;
    }

    const datosAgrupados = agruparPrincipales(datos, props.limite);

    return (
        <>
            <h4 className="text-center">{props.titulo}</h4>
            <div>
                <PieChart
                    series={[
                        {
                            data: datosAgrupados,
                            outerRadius: 120
                        },
                    ]}
                    height={300}
                />
            </div>
        </>
    );
}

