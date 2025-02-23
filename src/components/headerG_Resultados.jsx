import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logoRobo.png';
import "../css/headerGestor.css";

const HeaderGestorR = () => {
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [rolUsuario, setRolUsuario] = useState("");
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const nombre = localStorage.getItem("nombreUsuario");
        const rol = localStorage.getItem("rolUsuario");

        if (nombre && rol) {
            setNombreUsuario(nombre);
            setRolUsuario(rol);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("nombreUsuario");
        localStorage.removeItem("rolUsuario");
        localStorage.removeItem("token");
        navigate("/"); // Redirigir al login o página principal
    };
    return (

        <>
            <header className="navbar-hGR">
                <nav className="nav-container-hGR">
                    <div className="logo-hGR">
                        <a href="#">
                            <img src={Logo} alt="Logo" />
                        </a>
                    </div>

                    <ul className="nav-links-hGR">

                        <li>
                            <Link to="/posiciones">Posiciones</Link>
                        </li>

                    </ul>
                    <div className="user-menu">
                        {nombreUsuario ? (
                            <div className="dropdown">
                                <button onClick={() => setMenuAbierto(!menuAbierto)} className="dropdown-btn">
                                    Hola, {nombreUsuario} ({rolUsuario})
                                </button>
                                {menuAbierto && (
                                    <ul className={`dropdown-menu ${menuAbierto ? "show" : ""}`}>
                                        <li onClick={handleLogout}>Cerrar sesión</li>
                                        <li><Link to="/VentanaTrabajador?header=gestorresultados">Ver perfil</Link></li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <button className="btn-login-hadmin"
                                onClick={() => navigate("/login")} >
                                Iniciar sesión
                            </button>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
};

export default HeaderGestorR;
