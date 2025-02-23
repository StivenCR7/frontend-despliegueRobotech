import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../services/AuthContextToken";

const PrivateRoute = ({ allowedRoles }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se verifica la autenticación
  }

  if (!token) {
    return <Navigate to="/" replace />; // Si no hay token, redirige a login
  }

  if (!user || !user.roles.some((rol) => allowedRoles.includes(rol))) {
    return <Navigate to="/inicio" replace />; // Si el usuario no tiene permiso, redirige a inicio
  }

  return <Outlet />; // Si tiene acceso, renderiza la ruta protegida
};

export default PrivateRoute;
