import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

export default function Grafica_Barras(props) {

    const datos = props.calcularDatos(props.data);

    return (
        <>
            <BarChart
                xAxis={[{ scaleType: 'band', data: props.datosX }]}
                series={[{ data: datos }]}
                width={props.width}
                height={300}
            />
        </>
    );
}

