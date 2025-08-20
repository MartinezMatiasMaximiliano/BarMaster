import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../App";

export default function Control_Login({children}) {
    const { logeado } = useContext(LoginContext);

    if (!logeado) {
        return <Navigate to="/" replace />;
    }
    return children;
}
