import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Creamos el contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para saber si la autenticación está en proceso

  // Función para guardar el token y extraer los datos del usuario
  const saveToken = (newToken) => {
    if (!newToken || isTokenExpired(newToken)) {
      logout();
      return;
    }
  
    try {
      const decoded = jwtDecode(newToken);
      setUser({
        nombreUsuario: decoded.sub,
        roles: decoded.authorities || [],
      });
      setToken(newToken);
      localStorage.setItem("token", newToken);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      logout();
    }
  };
  

  // Cargar el token desde localStorage cuando la aplicación inicia
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !isTokenExpired(storedToken)) {
      try {
        const decoded = jwtDecode(storedToken);
        setUser({
          nombreUsuario: decoded.sub,
          roles: decoded.authorities || [],
        });
        setToken(storedToken);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        logout();
      }
    } else {
      logout(); // Si el token está expirado, eliminamos la sesión
    }
    setLoading(false);
  }, []);
  
  //función para verificar la expiración del token
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return Date.now() >= decoded.exp * 1000; // Compara la fecha de expiración
    } catch (error) {
      return true; // Si hay error, consideramos que el token es inválido
    }
  };
  
  
  // Función para cerrar sesión y limpiar los datos
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, user, saveToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};