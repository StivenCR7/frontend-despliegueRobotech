import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeaderGestorR from "./headerG_Resultados";
import HeaderValidaciones from "./headervalidacion";
import HeaderAdmin from "./headeradmin";
import { obtenerPorIdTrabajador, actualizarDatosContacto } from "../services/TrabajadoresServices";
import "../css/ventanaTrabajador.css";

const VentanaTrabajador = () => {
    const [trabajador, setTrabajador] = useState(null);
    const [datosEditados, setDatosEditados] = useState({ telefono: "", correo: "" });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const headerType = searchParams.get("header"); // Obtiene el tipo de header de la URL

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1])); // Decodificar token
        const idUsuario = payload.userId; 

        if (!idUsuario) return;

        const fetchTrabajador = async () => {
            try {
                const response = await obtenerPorIdTrabajador(idUsuario);
                setTrabajador(response.data);
                setDatosEditados({ telefono: response.data.telefono, correo: response.data.correo });
            } catch (error) {
                console.error("Error al obtener los datos del trabajador:", error);
            }
        };

        fetchTrabajador();
        
    }, []);

    const handleActualizarDatos = async () => {
        try {
            await actualizarDatosContacto(trabajador.id, datosEditados);
            Swal.fire({
                icon: 'success',
                title: 'Actualización Exitosa',
                text: 'Los datos de contacto se han actualizado correctamente.',
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al Actualizar',
                text: 'Ocurrió un error al intentar actualizar los datos. Por favor, inténtalo de nuevo.',
            });
            console.error("Error al actualizar los datos:", error);
        }
    };

    return (
        <>
            {/* Mostramos el header correcto según el parámetro */}
            {headerType === "gestorresultados" && <HeaderGestorR />}
            {headerType === "validacion" && <HeaderValidaciones />}
            {headerType === "admin" && <HeaderAdmin />}
            <div><br />
                {trabajador ? (
                    <div className="containerPT">
                        <nav className="sidebarPT">
                            <section className="profile-cardPT">
                                <div className="profile-header">
                                    <h1>Bienvenido </h1>
                                    <hr />
                                    <div className="profile-avatar">👤</div>
                                    <div>
                                        <p><strong>Nombre:</strong> {trabajador.nombre}</p>
                                        <p><strong>Apellido:</strong> {trabajador.apellido}</p>
                                        <p><strong>Correo:</strong> {trabajador.correo}</p>
                                    </div>
                                </div>
                                <div >
                                    <p><strong>Teléfono:</strong> {trabajador.telefono}</p>
                                </div>
                            </section>
                        </nav>

                        <div className="contentPT">
                            <button className="toggle-btn" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                                {mostrarFormulario ? "Ocultar Edición" : "Editar Datos de Contacto"}
                            </button>

                            {mostrarFormulario && (
                                <div className="edit-card">
                                    <h3>Editar Datos de Contacto</h3>
                                    <div>
                                        <label>Teléfono</label>
                                        <input
                                            type="text"
                                            name="telefono"
                                            placeholder="Nuevo teléfono"
                                            pattern="9\d{8}"
                                            onInvalid={(e) => e.target.setCustomValidity('El teléfono debe empezar con "9" y contener 9 dígitos.')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            value={datosEditados.telefono}
                                            onChange={(e) => setDatosEditados({ ...datosEditados, telefono: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label>Correo Electrónico</label>
                                        <input
                                            type=" email"
                                            name="correo"
                                            placeholder="Nuevo correo"
                                            pattern="^[^\s@]+@gmail\.com$"
                                            onInvalid={(e) => e.target.setCustomValidity('El correo debe terminar en @gmail.com')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            value={datosEditados.correo}
                                            onChange={(e) => setDatosEditados({ ...datosEditados, correo: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button className="update-btn" onClick={handleActualizarDatos}>Actualizar</button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>Cargando datos...</p>
                )}
            </div>
        </>
    );
};

export default VentanaTrabajador;