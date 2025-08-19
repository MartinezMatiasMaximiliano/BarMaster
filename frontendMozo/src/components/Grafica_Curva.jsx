import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export default function Grafica_Curva(props) {

    const datos_grafica = props.calcularDatos(props.data);

    return (
        <>
            <h4>{props.titulo}</h4>
            <LineChart
                xAxis={[{ scaleType: "band", data: props.dataX }]}
                series={[
                    {
                        data: datos_grafica,
                    },
                ]}
                width={props.width}
                height={300}
            />
        </>
    );
}

