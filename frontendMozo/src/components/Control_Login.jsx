import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../contexts/AppContexts";
import { authService } from "../services/authService";

export default function Control_Login({ children, rolesPermitidos }) {
    const { logeadoUsuario } = useContext(LoginContext);

    if (!logeadoUsuario) {
        return <Navigate to="/" replace />;
    }
    if (Array.isArray(rolesPermitidos) && rolesPermitidos.length > 0) {
        const idRol = Number(
            authService.decodeToken(localStorage.getItem('USER_token'))?.IdRol
        );
        if (!rolesPermitidos.includes(idRol)) {
            return <Navigate to="/sistema_sucursal" replace />;
        }
    }
    return children;
}
