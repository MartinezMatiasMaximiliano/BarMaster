# Guía de Exportación de Tablas

Este documento explica cómo usar el sistema reutilizable de exportación de tablas a PDF y Excel.

## Componentes y Utilidades

### 1. `BotonesExportacion` - Componente de Botones

Componente reutilizable que muestra los botones de exportación (PDF y Excel).

**Ubicación:** `src/components/Tabla/BotonesExportacion.jsx`

**Props:**
- `onExportarPDF` (Function, opcional): Función a ejecutar al hacer clic en PDF
- `onExportarExcel` (Function, opcional): Función a ejecutar al hacer clic en Excel
- `deshabilitado` (boolean, opcional): Si los botones deben estar deshabilitados
- `tooltipPDF` (string, opcional): Texto del tooltip para el botón PDF (default: "Exportar a PDF")
- `tooltipExcel` (string, opcional): Texto del tooltip para el botón Excel (default: "Exportar a Excel")

**Ejemplo de uso:**
```jsx
import { BotonesExportacion } from '../../components/Tabla/BotonesExportacion';

<BotonesExportacion
    onExportarPDF={handleExportarPDF}
    onExportarExcel={handleExportarExcel}
    deshabilitado={loading || datos.length === 0}
/>
```

### 2. `useExportacionTabla` - Hook Reutilizable

Hook que facilita la configuración de exportación.

**Ubicación:** `src/hooks/useExportacionTabla.js`

**Parámetros:**
```javascript
{
    datos: Array,              // Datos de la tabla a exportar
    columnas: Array,          // Configuración de columnas
    titulo: string,           // Título del documento
    subtitulo?: string,       // Subtítulo (opcional)
    infoAdicional?: Array,    // Información adicional [{ label, value }]
    nombreArchivo?: string,   // Nombre del archivo (sin extensión)
    formatearFila?: Function  // Función personalizada para formatear filas
}
```

**Retorna:**
```javascript
{
    handleExportarPDF: Function,
    handleExportarExcel: Function
}
```

**Ejemplo de uso:**
```jsx
import { useExportacionTabla } from '../../hooks/useExportacionTabla';

const { handleExportarPDF, handleExportarExcel } = useExportacionTabla({
    datos: misDatos,
    columnas: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'edad', label: 'Edad', formatter: (val) => `${val} años` },
        { key: 'fecha', label: 'Fecha', formatter: (val) => new Date(val).toLocaleDateString() }
    ],
    titulo: 'Lista de Usuarios',
    subtitulo: 'Reporte del mes de Enero',
    infoAdicional: [
        { label: 'Total de registros', value: misDatos.length },
        { label: 'Fecha de exportación', value: new Date().toLocaleDateString() }
    ],
    nombreArchivo: 'usuarios_enero_2024'
});
```

### 3. Funciones Directas de Exportación

Si necesitas más control, puedes usar las funciones directamente.

**Ubicación:** `src/utils/exportacionTabla.js`

**Funciones:**
- `exportarTablaAPDF(config)` - Exporta a PDF
- `exportarTablaAExcel(config)` - Exporta a Excel

**Ejemplo de uso:**
```jsx
import { exportarTablaAPDF, exportarTablaAExcel } from '../../utils/exportacionTabla';

const handleExportar = async () => {
    await exportarTablaAPDF({
        datos: misDatos,
        columnas: [
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'precio', label: 'Precio', formatter: (val) => `$${val.toFixed(2)}` }
        ],
        titulo: 'Productos',
        nombreArchivo: 'productos_exportacion'
    });
};
```

## Integración con Componente Tabla

El componente `Tabla` ya incluye soporte para exportación. Solo necesitas pasar las props:

```jsx
import Tabla from '../../components/Tabla/Tabla';
import { useExportacionTabla } from '../../hooks/useExportacionTabla';

function MiComponente() {
    const datos = [...]; // tus datos
    const columnas = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'email', label: 'Email' }
    ];

    const { handleExportarPDF, handleExportarExcel } = useExportacionTabla({
        datos,
        columnas,
        titulo: 'Mi Tabla',
        nombreArchivo: 'mi_tabla'
    });

    return (
        <Tabla
            filas={datos}
            columnas={columnas}
            titulo="Mi Tabla"
            onExportarPDF={handleExportarPDF}
            onExportarExcel={handleExportarExcel}
        />
    );
}
```

## Configuración de Columnas

Las columnas pueden tener las siguientes propiedades:

```javascript
{
    key: string,              // Clave del campo en los datos
    label: string,           // Etiqueta a mostrar en el encabezado
    formatter?: Function,    // Función para formatear el valor: (valor, filaCompleta) => string
    align?: 'left' | 'right' | 'center'  // Alineación (opcional)
}
```

**Ejemplo de formatters:**
```javascript
const columnas = [
    {
        key: 'fecha',
        label: 'Fecha',
        formatter: (val) => new Date(val).toLocaleDateString('es-AR')
    },
    {
        key: 'monto',
        label: 'Monto',
        formatter: (val) => `$${val.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
    },
    {
        key: 'estado',
        label: 'Estado',
        formatter: (val, fila) => fila.activo ? 'Activo' : 'Inactivo'
    }
];
```

## Información Adicional

Puedes agregar información adicional al inicio del documento (PDF) o en una hoja separada (Excel):

```javascript
const infoAdicional = [
    { label: 'Período', value: 'Enero 2024' },
    { label: 'Total de registros', value: datos.length },
    { label: 'Fecha de exportación', value: new Date().toLocaleDateString() }
];
```

## Ejemplo Completo

```jsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';
import { BotonesExportacion } from '../../components/Tabla/BotonesExportacion';
import { useExportacionTabla } from '../../hooks/useExportacionTabla';
import { currencyFormatter } from '../../utils/constants';

function MiTabla({ datos, loading }) {
    const columnas = [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { 
            key: 'precio', 
            label: 'Precio',
            formatter: (val) => currencyFormatter.format(val)
        },
        {
            key: 'fecha',
            label: 'Fecha',
            formatter: (val) => new Date(val).toLocaleDateString('es-AR')
        }
    ];

    const { handleExportarPDF, handleExportarExcel } = useExportacionTabla({
        datos,
        columnas,
        titulo: 'Lista de Productos',
        subtitulo: 'Exportación del día',
        infoAdicional: [
            { label: 'Total de productos', value: datos.length },
            { label: 'Fecha', value: new Date().toLocaleDateString('es-AR') }
        ],
        nombreArchivo: `productos_${new Date().toISOString().split('T')[0]}`
    });

    return (
        <Card>
            <CardHeader
                title="Productos"
                action={
                    <BotonesExportacion
                        onExportarPDF={handleExportarPDF}
                        onExportarExcel={handleExportarExcel}
                        deshabilitado={loading || datos.length === 0}
                    />
                }
            />
            <CardContent>
                {/* Tu tabla aquí */}
            </CardContent>
        </Card>
    );
}
```

## Notas Importantes

1. **PDF**: Requiere que `pdfmake` esté instalado (ya está en el proyecto)
2. **Excel**: Requiere que `write-excel-file` esté instalado. Si no está, se mostrará un mensaje al usuario
3. **Formatters**: Los formatters deben retornar strings para PDF, pero pueden retornar números para Excel
4. **Datos vacíos**: El sistema valida que haya datos antes de exportar
5. **Nombres de archivo**: Si no se especifica `nombreArchivo`, se usa un nombre por defecto con la fecha actual

