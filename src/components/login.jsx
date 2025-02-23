import React, { useState, useContext } from "react";
import api from "../api";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContextToken"; // Importa el contexto de autenticación

const Login = () => {
  const { saveToken } = useContext(AuthContext); // Usa el contexto para guardar el token
  const [isActive, setIsActive] = useState(false); // Estado para alternar entre login y registro
  const [correo, setCorreo] = useState(""); // Estado para el correo del usuario
  const [password, setPassword] = useState(""); // Estado para la contraseña del usuario
  const [error, setError] = useState(""); // Estado para manejar mensajes de error
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  const navigate = useNavigate(); // Hook para la navegación

  // Alternar a la vista de registro
  const handleRegisterClick = () => {
    setIsActive(true);
  };

  // Alternar a la vista de login
  const handleLoginClick = () => {
    setIsActive(false);
  };

  // Manejo del login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos
    setLoading(true); // Activar estado de carga

    try {
      // Enviar solicitud de login al backend
      const response = await api.post("/login", {
        correo,
        contrasena: password,
      });

      // Extraer el token de la respuesta
      const { token } = response.data;

      // Guardar el token en el contexto
      saveToken(token);

      // Intentar decodificar el token para obtener información del usuario
      try {
        const base64Url = token.split(".")[1]; // Obtener la parte útil del token
        if (!base64Url) throw new Error("Formato de token inválido");

        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedToken = JSON.parse(atob(base64));

        // Extraer datos del usuario
        const nombreUsuario = decodedToken.sub;
        const rolUsuario = decodedToken.authorities?.[0]; // Validación opcional para evitar errores

        if (!rolUsuario) throw new Error("No se encontró rol en el token");

        // Guardar en localStorage (opcional)
        localStorage.setItem("nombreUsuario", nombreUsuario);
        localStorage.setItem("rolUsuario", rolUsuario);

        // Redirección según el rol
        switch (rolUsuario) {
          case "RepresentanteClub":
            navigate("/ventanaClub");
            break;
          case "Administrador":
            navigate("/CrearEventos");
            break;
          case "Gestor de resultados":
            navigate("/posiciones");
            break;
          case "Verificador de Solicitudes":
            navigate("/ventanaSolicitudes/clubes");
            break;
          default:
            setError("Rol no autorizado.");
        }
      } catch (decodeError) {
        console.error("Error al decodificar el token:", decodeError);
        setError("Error al procesar la sesión. Intenta nuevamente.");
      }
    } catch (err) {
      // Manejo de errores en la respuesta del servidor
      setError(err.response?.data?.message || "Credenciales incorrectas o usuario no autorizado.");
    } finally {
      setLoading(false); // Desactivar estado de carga
    }
  };
  //funciones para el registro
  const [registerData, setRegisterData] = useState({
    nombre: "",
    nombre_representante: "",
    direccion: "",
    telefono: "",
    correo: "",
    contrasena: "",
  });

  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);
    try {
      const response = await api.post("/clubes/add", registerData);
      alert("Club registrado correctamente.");
      setIsActive(false); // Cambiar a la vista de login después del registro
    } catch (err) {
      setRegisterError(
        err.response?.data?.error || "Error al registrar el club. Intenta nuevamente."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="bodyy">
      <div className={`wrapper ${isActive ? "active" : ""}`}>
        <div className="wrapper">
          <span className="bg-animate"></span>
          <span className="bg-animate2"></span>

          <div className="form-box login">
            <h2 className="animation" style={{ "--i": 0, "--j": 21 }}>
              Login
            </h2>
            <form onSubmit={handleSubmit}>
              <div
                className="input-box animation"
                style={{ "--i": 1, "--j": 22 }}
              >
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  pattern="^[^\s@]+@gmail\.com$"
                  onInvalid={(e) => e.target.setCustomValidity('Ingrese correo válido de Gmail (example@gmail.com).')}
                  onInput={(e) => e.target.setCustomValidity('')}
                  required
                />
                <label>Correo</label>
                <i className="bx bxs-user"></i>
              </div>
              <div
                className="input-box animation"
                style={{ "--i": 2, "--j": 23 }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label>Contraseña</label>
                <i className="bx bxs-lock-open-alt"></i>
              </div>
              <button
                type="submit"
                className="btn animation"
                style={{ "--i": 3, "--j": 24 }}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Login"}
              </button>
              {error && (
                <p style={{ color: "red" }} className="animation">
                  {error}
                </p>
              )}
              <div
                className="logreg-link animation"
                style={{ "--i": 4, "--j": 25 }}
              >
                <p>
                  ¿No tienes una cuenta?{" "}
                  <a className="register-link" onClick={handleRegisterClick}>
                    Registrarse
                  </a>
                </p>
              </div>
            </form>
          </div>

          <div className="info-text login">
            <h2 className="animation" style={{ "--i": 0, "--j": 20 }}>
              Hola de nuevo!
            </h2>
            <p className="animation" style={{ "--i": 1, "--j": 21 }}>
              Listo para una nueva competencia?
            </p>
          </div>

          <div className="form-box register">
            <h2 className="animation" style={{ "--i": 17, "--j": 0 }}>
              Sign Up
            </h2>
            <div className="scroll-container">
              <form
                className="box"
                onSubmit={handleRegisterSubmit}
              >
                <div className="input-box animation" style={{ "--i": 18, "--j": 1 }}>
                  <input
                    type="text"
                    name="nombre"
                    value={registerData.nombre}
                    onChange={handleRegisterChange}
                    required
                  />
                  <label>Nombre Club</label>
                  <i className="bx bxs-user"></i>
                </div>
                <div className="input-box animation" style={{ "--i": 18, "--j": 1 }}>
                  <input
                    type="text"
                    name="nombre_representante"
                    value={registerData.nombre_representante}
                    pattern="[A-Za-z\s]+"
                    onInvalid={(e) => e.target.setCustomValidity('El nombre solo puede contener letras.')}
                    onInput={(e) => e.target.setCustomValidity('')}
                    onChange={handleRegisterChange}
                    required
                  />
                  <label>Nombre Representante</label>
                  <i className="bx bxs-user"></i>
                </div>
                <div className="input-box animation" style={{ "--i": 18, "--j": 1 }}>
                  <input
                    type="text"
                    name="direccion"
                    value={registerData.direccion}
                    onChange={handleRegisterChange}
                    required
                  />
                  <label>Dirección</label>
                  <i className="bx bxs-user"></i>
                </div>
                <div className="input-box animation" style={{ "--i": 18, "--j": 1 }}>
                  <input
                    type="text"

                    name="telefono"
                    value={registerData.telefono}
                    pattern="9\d{8}"
                    onInvalid={(e) => e.target.setCustomValidity('El teléfono debe empezar con "9" y contener 9 dígitos.')}
                    onInput={(e) => e.target.setCustomValidity('')}
                    onChange={(e) => {
                      handleRegisterChange(e);
                      setRegisterError(""); // Limpiar error al escribir
                    }}
                    required
                  />
                  <label>Teléfono</label>
                  <i className="bx bxs-user"></i>
                </div>
                {registerError && registerError.includes("Teléfono") && (
                  <p style={{ color: "red", marginTop: "5px", fontSize: "14px" }}>
                    {registerError}
                  </p>
                )}
                <div className="input-box animation" style={{ "--i": 19, "--j": 2 }}>
                  <input
                    type="email"
                    name="correo"
                    value={registerData.correo}
                    pattern="^[^\s@]+@gmail\.com$"
                    onInvalid={(e) => e.target.setCustomValidity('Ingrese correo válido de Gmail (example@gmail.com).')}
                    onInput={(e) => e.target.setCustomValidity('')}
                    onChange={(e) => {
                      handleRegisterChange(e);
                      setRegisterError(""); // Limpiar error al escribir
                    }}
                    required
                  />
                  <label>Correo</label>
                  <i className="bx bxs-envelope"></i>
                </div>
                {registerError && registerError.includes("correo") && (
                  <p style={{ color: "red", marginTop: "5px", fontSize: "14px" }}>
                    {registerError}
                  </p>
                )}
                <div className="input-box animation" style={{ "--i": 20, "--j": 3 }}>
                  <input
                    type="password"
                    name="contrasena"
                    value={registerData.contrasena}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                    onInvalid={(e) => e.target.setCustomValidity('La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.')}
                    onInput={(e) => e.target.setCustomValidity('')}
                    onChange={handleRegisterChange}
                    required
                  />
                  <label>Contraseña</label>
                  <i className="bx bxs-lock-open-alt"></i>
                </div>
                <button
                  type="submit"
                  className="btn animation"
                  style={{ "--i": 21, "--j": 4 }}
                  disabled={registerLoading}
                >
                  {registerLoading ? "Registrando..." : "Sign Up"}
                </button>
                {registerError && !registerError.includes("correo") && !registerError.includes("Teléfono") && (
                  <p style={{ color: "red" }}>{registerError}</p>
                )}
                <div className="logreg-link animation" style={{ "--i": 22, "--j": 5 }}>
                  <p>
                    Ya tienes una cuenta?{" "}
                    <a type="button" className="login-link" onClick={handleLoginClick}>
                      Login
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
          <div className="info-text register">
            <h2 className="animation" style={{ "--i": 17, "--j": 0 }}>
              Hola, registra tu club!
            </h2>
            <p className="animation" style={{ "--i": 18, "--j": 1 }}>
              Es completamente gratis :)
            </p>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Login;