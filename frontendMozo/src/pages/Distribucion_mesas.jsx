import React, { useState } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import Button from '@mui/material/Button';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function MesasGrid() {
    const [layout, setLayout] = useState(
        [
            { i: "mesa2", x: 1, y: 0, w: 1, h: 1 },
            { i: "mesa6", x: 2, y: 0, w: 1, h: 1 },
            { i: "mesa4", x: 3, y: 0, w: 1, h: 1 },
            { i: "mesa8", x: 4, y: 0, w: 1, h: 1 },
            { i: "mesa12", x: 5, y: 0, w: 1, h: 1 },
            { i: "mesa15", x: 6, y: 0, w: 1, h: 1 },
            { i: "mesa17", x: 7, y: 0, w: 1, h: 1 },
            { i: "mesa22", x: 8, y: 0, w: 1, h: 1 },
            { i: "mesa1", x: 9, y: 0, w: 1, h: 1 },
            { i: "mesa3", x: 10, y: 0, w: 1, h: 1 },
            { i: "mesa5", x: 11, y: 0, w: 1, h: 1 },
            { i: "mesa10", x: 12, y: 0, w: 1, h: 1 },
            { i: "mesa11", x: 13, y: 0, w: 1, h: 1 },
            { i: "mesa13", x: 14, y: 0, w: 1, h: 1 },
            { i: "mesa30", x: 1, y: 0, w: 1, h: 1 },
            { i: "mesa31", x: 2, y: 0, w: 1, h: 1 },
            { i: "mesa32", x: 3, y: 0, w: 1, h: 1 },
            { i: "mesa33", x: 4, y: 0, w: 1, h: 1 },
            { i: "mesa34", x: 5, y: 0, w: 1, h: 1 },
            { i: "mesa35", x: 6, y: 0, w: 1, h: 1 },
            { i: "mesa36", x: 7, y: 0, w: 1, h: 1 },
            { i: "mesa37", x: 8, y: 0, w: 1, h: 1 },
            { i: "mesa38", x: 9, y: 0, w: 1, h: 1 },
            { i: "mesa39", x: 10, y: 0, w: 1, h: 1 },
            { i: "mesa40", x: 11, y: 0, w: 1, h: 1 },
            { i: "mesa50", x: 12, y: 0, w: 1, h: 1 },
            { i: "mesa60", x: 13, y: 0, w: 1, h: 1 },
            { i: "mesa70", x: 14, y: 0, w: 1, h: 1 },

        ]
    );

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        // Podrías enviar esto al backend para guardarlo
    };

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ResponsiveGridLayout
                className="layout"
                layout={layout}
                cols={15}
                rowHeight={50}
                onLayoutChange={(newLayout) => handleLayoutChange(newLayout)}
                compactType={null} 
            >
                {layout.map((mesa) => (
                    <Button key={mesa.i} variant="contained">{mesa.i}</Button>
                )) }

            </ResponsiveGridLayout>
        </div>
    );
}
