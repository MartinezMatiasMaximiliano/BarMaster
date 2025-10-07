import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { Paper, Tooltip } from "@mui/material";

const ResponsiveGridLayout = WidthProvider(GridLayout);

const Mapa_Calor = (props) => {

    const ocupacion = props.contarMesas(props.dataFiltrada);
    const maxCount = Math.max(...ocupacion.map(o => o.value));
    const ocupacionMap = ocupacion.reduce((acc, o) => {
        acc[o.id] = o.value;
        return acc;
    }, {});
    function colorPorOcupacion(count, maxCount) {
        if (count === 0) return "#9fb3c7";

        // Normalizar entre 0 y 1
        let intensidad = count / maxCount;

        // Aplicar curva para que los valores bajos sean más perceptibles
        intensidad = Math.pow(intensidad, 0.5); // raíz cuadrada

        // colores en RGB
        const amarillo = { r: 255, g: 255, b: 153 }; // #ffff99
        const bordo = { r: 128, g: 0, b: 0 }; // #800000

        // interpolación lineal
        const r = Math.round(amarillo.r + (bordo.r - amarillo.r) * intensidad);
        const g = Math.round(amarillo.g + (bordo.g - amarillo.g) * intensidad);
        const b = Math.round(amarillo.b + (bordo.b - amarillo.b) * intensidad);

        return `rgb(${r},${g},${b})`;
    }
    

    return (
            <ResponsiveGridLayout
                layout={props.mesas}
                cols={15}
                rowHeight={50}
                isDraggable={false}
                isResizable={false}
                compactType={null}
            >
                {props.mesas.map((mesa) => {
                    const count = ocupacionMap[Number(mesa.i)] || 0;
                    const color = colorPorOcupacion(count, maxCount);

                    return (
                        <div key={mesa.i}>
                            <Tooltip
                                key={mesa.i}
                                title={`Total de visitas: ${count}`}  // texto del tooltip
                                arrow
                                placement="top"
                            >
                                <Paper
                                    elevation={3}
                                    sx={{
                                        backgroundColor: color,
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 2,
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                    }}
                                >
                                    {mesa.i}
                                </Paper>
                            </Tooltip>
                        </div>
                    );
                })}
            </ResponsiveGridLayout>
    )
}

export default Mapa_Calor;
