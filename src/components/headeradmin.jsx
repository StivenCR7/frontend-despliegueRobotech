import React,{ useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logoRobo.png';
import "../css/headeradmin.css";

const Header = () => {
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
            <header className="navbar-hadmin">
                <nav className="nav-container-hadmin">
                    <div className="logo-hadmin">
                        <a href="#">
                            <img src={Logo} alt="Logo" />
                        </a>
                    </div>

                    <ul className="nav-links-hadmin">
                        <li>
                            <Link to="/noticiasadmin">Noticias</Link>
                        </li>
                        <li>
                            <Link to="/trabajadores">Trabajadores</Link>
                        </li>
                        <li>
                            <Link to="/CrearEventos">Torneos</Link>
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
                                        <li><Link to="/VentanaTrabajador?header=admin">Ver perfil</Link></li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <h2>Bienvenido </h2>
                        )}
                    </div>
                </nav>
            </header>
            
        </>
    );
};

export default Header;
