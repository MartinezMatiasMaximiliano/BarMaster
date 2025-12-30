import React, { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { CrearTipoPago, BorrarTipoPago } from "../API/APITipoPagos";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { Campos } from "../configs/agregar/TipoPago"

function Abm_TipoPago(props) {
    const [filasFiltradas, setFilasFiltradas] = useState(props.datos_tipo_pagos || []);
    const [filasOrdenadas, setFilasOrdenadas] = useState(props.datos_tipo_pagos || []);

    // Actualizar filas filtradas cuando cambien los datos originales
    useEffect(() => {
        setFilasFiltradas(props.datos_tipo_pagos || []);
        setFilasOrdenadas(props.datos_tipo_pagos || []);
    }, [props.datos_tipo_pagos]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = {
        crear: CrearTipoPago,
        eliminar: BorrarTipoPago,
    };

    const columnas = [
        { key: "nombre", label: "Nombre", align: "right" },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={props.recargarComponentes}
                    showEditar={false} // Los tipos de pago no se pueden modificar
                    showToggle={() => false} // Los tipos de pago no tienen activo/inactivo
                    campos={Campos}
                />
            ),
        },
    ];

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={filasOrdenadas}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        agregar={api.crear}
                        campos={Campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={[
                            { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' }
                        ]}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={props.datos_tipo_pagos || []}
                        columnas={columnas}
                        configuracionFiltros={{
                            nombre: { tipo: 'text' }
                        }}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_TipoPago;

