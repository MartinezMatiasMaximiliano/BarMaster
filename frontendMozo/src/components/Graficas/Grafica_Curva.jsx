import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const GraficaGananciasPorFecha = ({ data, calcularDatos }) => {

    const dataGanancias = calcularDatos(data);
    return (
        <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
                <LineChart data={dataGanancias} margin={{ top: 20, right: 30, left: 60, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={dataGanancias.length > 0 ? Object.keys(dataGanancias[0])[0] : null} tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey={dataGanancias.length > 0 ? Object.keys(dataGanancias[0])[1] : null} stroke="#4CAF50" strokeWidth={2} dot={true} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GraficaGananciasPorFecha;
