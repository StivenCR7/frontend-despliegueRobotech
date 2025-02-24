import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logoRobo.png';
import api from "../api"; // Asegúrate de importar tu API
import "../css/headerClub.css";

const HeaderClub = () => {
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [rolUsuario, setRolUsuario] = useState("");
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [subMenuAbierto, setSubMenuAbierto] = useState(false);
    const [torneos, setTorneos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [selectedTorneo, setSelectedTorneo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const nombre = localStorage.getItem("nombreUsuario");
        const rol = localStorage.getItem("rolUsuario");

        if (nombre && rol) {
            setNombreUsuario(nombre);
            setRolUsuario(rol);
        }

        // Obtener torneos al cargar el componente
        const fetchTorneos = async () => {
            try {
                const response = await api.get("/torneos");
                setTorneos(response.data);
            } catch {
                console.error("Error al cargar los torneos.");
            }
        };
        fetchTorneos();
    }, []);

    const handleTorneoClick = async (torneoId) => {
        setSelectedTorneo(torneoId);
        setSubMenuAbierto(true);
        try {
            const response = await api.get(`/torneos/${torneoId}/todasCate`);
            setCategorias(response.data);
        } catch {
            console.error("Error al cargar las categorías.");
        }
    };

    const handleCategoriaClick = (categoriaId) => {
        navigate(`/competencias/${selectedTorneo}/${categoriaId}`); // Redirigir a la ruta correspondiente
    };

    const handleLogout = () => {
        localStorage.removeItem("nombreUsuario");
        localStorage.removeItem("rolUsuario");
        localStorage.removeItem("token");
        navigate("/"); // Redirigir al login o página principal
    };

    // Filtrar torneos que no han comenzado
    const torneosNoComenzados = torneos.filter(torneo => new Date(torneo.fecha_inicio) > new Date());

    return (
        <header className="navbar-header">
            <nav className="nav-container-header">
                <div className="logo-header">
                    <a href="/">
                        <img src={Logo} alt="Logo" />
                    </a>
                </div>

                <ul className="nav-links-header">
                    <li>
                        <Link to="/">Inicio</Link>
                    </li>
                    <li>
                        <Link to="/ranking">Rankings</Link>
                    </li>
                    <li>
                        <Link to="/noticias">Noticias</Link>
                    </li>
                    <li>
                        <Link to="/PosicionesInvi">Posiciones</Link>
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
                                    <li><Link to="/ventanaClub">Ver perfil</Link></li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        <button className="btn-login-hadmin" onClick={() => navigate("/login")}>
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default HeaderClub;
