import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../App";

export default function Control_Login({children}) {
    const { logeadoUsuario } = useContext(LoginContext);

    if (!logeadoUsuario) {
        return <Navigate to="/" replace />;
    }
    return children;
}
