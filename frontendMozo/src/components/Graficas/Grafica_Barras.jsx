import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

export default function Grafica_Barras(props) {

    const datos = props.calcularDatos(props.data);

    return (
        <>
            <h4>{props.titulo}</h4>
            <BarChart
                xAxis={[{ scaleType: 'band', data: props.datosX }]}
                series={[{ data: datos }]}
                width={props.width}
                height={300}
            />
        </>
    );
}

