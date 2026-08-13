import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { Paper, Tooltip } from "@mui/material";

const ResponsiveGridLayout = WidthProvider(GridLayout);

const Mapa_Calor = (props) => {
    const ocupacion = props.contarMesas(props.dataFiltrada);
    const ocupacionMap = ocupacion.reduce((acc, o) => {
        acc[o.id] = o.value;
        return acc;
    }, {});
    const maxCount = ocupacion.length > 0 ? Math.max(...ocupacion.map(o => o.value)) : 0;
    function colorPorOcupacion(count, maxCount) {
        if (count === 0 || maxCount === 0) return "var(--bm-grey-05)";

        // Normalizar entre 0 y 1
        let intensidad = count / maxCount;

        // Aplicar curva para que los valores bajos sean más perceptibles
        intensidad = Math.pow(intensidad, 0.5); // raíz cuadrada

        // colores en RGB
        const amarillo = { r: 255, g: 228, b: 67 };
        const rojo = { r: 214, g: 56, b: 13 };

        // interpolación lineal
        const r = Math.round(amarillo.r + (rojo.r - amarillo.r) * intensidad);
        const g = Math.round(amarillo.g + (rojo.g - amarillo.g) * intensidad);
        const b = Math.round(amarillo.b + (rojo.b - amarillo.b) * intensidad);

        return `rgb(${r},${g},${b})`;
    }
    

    return (
            <ResponsiveGridLayout
                layout={props.layout}
                cols={props.cols ?? 15}
                rowHeight={props.rowHeight ?? 50}
                isDraggable={false}
                isResizable={false}
                compactType={null}
            >
                {props.layout.map((mesa) => {
                    const nombreMesa = mesa.nombre ?? mesa.i;
                    const count = ocupacionMap[nombreMesa] ?? 0;
                    const color = colorPorOcupacion(count, maxCount);
                    const colorTexto = maxCount > 0 && count / maxCount > 0.55
                        ? 'var(--bm-grey-07)'
                        : 'var(--bm-grey-01)';

                    return (
                        <div key={mesa.i}>
                            <Tooltip
                                title={`${count} visita(s)`}
                                arrow
                                placement="top"
                            >
                                <Paper
                                    elevation={3}
                                    sx={{
                                        backgroundColor: color,
                                        color: colorTexto,
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
                                    {nombreMesa}
                                </Paper>
                            </Tooltip>
                        </div>
                    );
                })}
            </ResponsiveGridLayout>
    )
}

export default Mapa_Calor;
