// components/MesasGridLayout.jsx
import React from 'react';
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import MesaGridItem from '../../../components/Mesa/MesaGridItem';
import { GRID_CONFIG } from '../constants/gridConfig';

const ResponsiveGridLayout = WidthProvider(GridLayout);

/**
 * Componente que renderiza el grid de mesas usando react-grid-layout
 * @param {Object} props
 * @param {Array} props.layout - Layout del grid
 * @param {Function} props.obtenerMesaPorId - Función para obtener una mesa por ID
 * @param {Function} props.obtenerDatosMesa - Función para obtener datos formateados de una mesa
 * @param {boolean} [props.hayCajaActiva=true] - Si hay caja activa para permitir abrir mesas
 */
export const MesasGridLayout = ({ layout, obtenerMesaPorId, obtenerDatosMesa, hayCajaActiva = true }) => {
    return (
        <ResponsiveGridLayout
            layout={layout}
            cols={GRID_CONFIG.cols}
            rowHeight={GRID_CONFIG.rowHeight}
            isDraggable={false}
            isResizable={false}
            compactType={null}
        >
            {layout.map((item) => {
                const mesa = obtenerMesaPorId(item.i);
                if (!mesa) return null;
                
                const { datosMesa, variant, mozo } = obtenerDatosMesa(mesa);
                
                return (
                    <MesaGridItem
                        key={item.i}
                        datos_mesa={datosMesa}
                        variant={variant}
                        mozo={mozo}
                        hayCajaActiva={hayCajaActiva}
                    />
                );
            })}
        </ResponsiveGridLayout>
    );
};

