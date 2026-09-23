import React from "react";
import Distribucion_mesas from "./Distribucion_mesas";

function Abm_Planos(props) {
    return <Distribucion_mesas planos={props.planos} recargarPlanos={props.recargarComponentes} />;
}

export default Abm_Planos;
