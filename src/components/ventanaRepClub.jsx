import React, { useState, useEffect, useContext } from "react";
import "../css/ventanaReClub.css";
import { jwtDecode } from "jwt-decode"; // Asegúrate de instalar jwt-decode
import Header from "./header_club";
import api from "../api";
import { AuthContext } from "../services/AuthContextToken";


const VentanaRepClub = () => {
    const { token } = useContext(AuthContext); // Obtiene el token desde el contexto
    const [activeTab, setActiveTab] = useState("competidores");
    const [robots, setRobots] = useState([]); // Lista de robots
    const [totalRobots, setTotalRobots] = useState(0); // Total de robots
    const [competidores, setCompetidores] = useState([]);
    const [paginaActualCompetidores, setPaginaActualCompetidores] = useState(1); // Página actual para competidores
    const [paginaActualRobots, setPaginaActualRobots] = useState(1); // Página actual para robots
    const [robotsPorPagina] = useState(20); // Robots por página
    const [competidoresPorPagina] = useState(10); // Competidores por página
    const [modalImage, setModalImage] = useState(null); // Estado para la imagen seleccionada
    const [club, setClub] = useState(null);
    const [nuevoCompetidor, setNuevoCompetidor] = useState({
        nombre: "",
        apellido: "",
        alias: "",
        dni: "",
        edad: "",
        correo: "",
    });
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal

    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl); // Abrir el modal con la imagen seleccionada
    };

    const closeModal = () => {
        setModalImage(null); // Cerrar el modal
    };

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const decodedToken = jwtDecode(token);
                const clubId = decodedToken.clubId;

                // Realizar las solicitudes en paralelo
                const [responseClub, responseCompetidores] = await Promise.all([
                    api.get(`/clubes/listar/${clubId}`),
                    api.get("/competidores/listar"),
                ]);

                // Actualizar el estado del club
                setClub(responseClub.data);

                // Filtrar los competidores que pertenecen al club
                const competidoresFiltrados = responseCompetidores.data.filter(
                    (competidor) => competidor.clubes && competidor.clubes.id === clubId
                );
                setCompetidores(competidoresFiltrados);

                // Obtener los robots solo de los competidores filtrados
                const robotsPromises = competidoresFiltrados.map((competidor) =>
                    api.get(`/robots/listarPorCompetidor/${competidor.id}`)
                );

                const robotsResponses = await Promise.all(robotsPromises);

                // Combinar los robots de todos los competidores
                const robotsFiltrados = robotsResponses.flatMap((response) => response.data);
                setRobots(robotsFiltrados);
                setTotalRobots(robotsFiltrados.length);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, [token]);

    if (!club) return <p>Cargando datos...</p>;

    // Manejar el cambio de pestaña
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Resetear la paginación al cambiar de pestaña
        if (tab === "competidores") {
            setPaginaActualCompetidores(1);
        } else if (tab === "robots") {
            setPaginaActualRobots(1);
        }
    };

    // Manejar los cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoCompetidor((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Función para registrar un competidor
    const registrarCompetidor = async (e) => {
        e.preventDefault();
    
        // Verificar si el DNI ya está en la lista de competidores
        const dniDuplicado = competidores.some(competidor => competidor.dni === nuevoCompetidor.dni);
        if (dniDuplicado) {
            Swal.fire({
                icon: 'error',
                title: 'DNI Duplicado',
                text: 'El DNI ya está registrado. Por favor, utiliza otro.',
            });
            return; // Salir de la función para evitar el registro
        }
    
        // Verificar si el correo ya está en la lista de competidores
        const correoDuplicado = competidores.some(competidor => competidor.correo === nuevoCompetidor.correo);
        if (correoDuplicado) {
            Swal.fire({
                icon: 'error',
                title: 'Correo Duplicado',
                text: 'El correo ya está registrado. Por favor, utiliza otro.',
            });
            return; // Salir de la función para evitar el registro
        }
        
        // Verificar si el alias ya está en la lista de competidores
        const aliasDuplicado = competidores.some(competidor => competidor.alias === nuevoCompetidor.alias);
        if (aliasDuplicado) {
            Swal.fire({
                icon: 'error',
                title: 'Alias Duplicado',
                text: 'El alias ya está en uso. Por favor, utiliza otro.',
            });
            return; // Salir de la función para evitar el registro
        }
    
        try {
            const decodedToken = jwtDecode(token);
            const clubId = decodedToken.clubId;
    
            // Registrar competidor con el club logueado
            const response = await api.post(
                "/competidores/add",
                {
                    ...nuevoCompetidor,
                    clubesId: clubId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            Swal.fire({
                icon: 'success',
                title: 'Registro Exitoso',
                text: response.data.message || "Competidor registrado correctamente.",
            });
    
            setNuevoCompetidor({
                nombre: "",
                apellido: "",
                alias: "",
                dni: "",
                edad: "",
                correo: "",
            });
            setShowModal(false); // Cerrar el modal tras registrar
    
            // Recargar competidores después de registrar uno
            const responseCompetidores = await api.get("/competidores/listar");
            const competidoresFiltrados = responseCompetidores.data.filter(
                (competidor) => competidor.clubes && competidor.clubes.id === clubId
            );
            setCompetidores(competidoresFiltrados);
        } catch (error) {
            if (error.response) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.message || "Ocurrió un error.",
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Conexión',
                    text: "No se pudo conectar al servidor.",
                });
            }
        }
    };
    // Funciones de paginación para competidores y robots
    const handlePaginaAnteriorCompetidores = () => {
        if (paginaActualCompetidores > 1) {
            setPaginaActualCompetidores(paginaActualCompetidores - 1);
        }
    };

    const handlePaginaSiguienteCompetidores = () => {
        const totalPaginas = Math.ceil(competidores.length / competidoresPorPagina);
        if (paginaActualCompetidores < totalPaginas) {
            setPaginaActualCompetidores(paginaActualCompetidores + 1);
        }
    };

    const handlePaginaSeleccionadaCompetidores = (numeroPagina) => {
        setPaginaActualCompetidores(numeroPagina);
    };

    const handlePaginaAnteriorRobots = () => {
        if (paginaActualRobots > 1) {
            setPaginaActualRobots(paginaActualRobots - 1);
        }
    };

    const handlePaginaSiguienteRobots = () => {
        const totalPaginas = Math.ceil(totalRobots / robotsPorPagina);
        if (paginaActualRobots < totalPaginas) {
            setPaginaActualRobots(paginaActualRobots + 1);
        }
    };

    const handlePaginaSeleccionadaRobots = (numeroPagina) => {
        setPaginaActualRobots(numeroPagina);
    };

    // Calcular el total de páginas para competidores y robots
    const totalPaginasCompetidores = Math.ceil(competidores.length / competidoresPorPagina);
    const totalPaginasRobots = Math.ceil(totalRobots / robotsPorPagina);

    // Cortar la lista de competidores y robots para la página actual
    const competidoresPaginaActual = competidores.slice((paginaActualCompetidores - 1) * competidoresPorPagina, paginaActualCompetidores * competidoresPorPagina);
    const robotsPaginaActual = robots.slice((paginaActualRobots - 1) * robotsPorPagina, paginaActualRobots * robotsPorPagina);

    return (
        <>
            <Header />
            <div className="container">
                {/* Sidebar */}
                <nav className="sidebar">
                    <section className="profile-card">
                        <div className="profile-header">
                            <h1>Bienvenido  {club.nombre}</h1>
                            <div className="profile-avatar">👤</div>
                            <div>
                                <h2 className="profile-name">Representante: {club.nombre_representante}</h2>
                                <p className="profile-email">Correo: {club.correo}</p>
                            </div>
                        </div>
                        <hr />
                        <div className="profile-details">
                            <p><strong>Nombre del Club:</strong> {club.nombre}</p>
                            <p><strong>Numero de contacto:</strong> {club.telefono}</p>
                            <p><strong>Dirección:</strong> {club.direccion}</p>
                        </div>
                    </section>
                </nav>

                {/* Main Content */}
                <main className="main">
                    <section className="profile-card1">
                        <ul className="menu list-group list-group-horizontal">
                            <li
                                className={`menu-item list-group-item ${activeTab === "competidores" ? "active" : ""}`}
                                onClick={() => handleTabChange("competidores")}
                            >
                                Ver Competidores
                            </li>
                            <li
                                className={`menu-item list-group-item ${activeTab === "robots" ? "active" : ""}`}
                                onClick={() => handleTabChange("robots")}
                            >
                                Ver Robots
                            </li>
                           
                        </ul>
                    </section>

                    {/* Dynamic Content */}
                    <section className="tab-content profile-card">
                        {activeTab === "competidores" && (
                            <div>
                                <button onClick={() => setShowModal(true)} className="btn-inscribir">
                                    Inscribir Competidor
                                </button>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Apellido</th>
                                            <th>DNI</th>
                                            <th>Alias</th>
                                            <th>Edad</th>
                                            <th>Correo</th>
                                            <th>Club</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {competidoresPaginaActual.map((competidor) => (
                                            <tr key={competidor.id}>
                                                <td>{competidor.nombre}</td>
                                                <td>{competidor.apellido}</td>
                                                <td>{competidor.dni}</td>
                                                <td>{competidor.alias}</td>
                                                <td>{competidor.edad}</td>
                                                <td>{competidor.correo}</td>
                                                <td>{competidor.clubes ? competidor.clubes.nombre : "Sin club"}</td>
                                                <td>{competidor.estados.nombre}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {showModal && (
                                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                                        <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
                                            <form onSubmit={registrarCompetidor}>
                                                <h4>Registrar Competidor</h4>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    value={nuevoCompetidor.nombre}
                                                    onChange={handleInputChange}
                                                    placeholder="Nombre"
                                                    pattern="[A-Za-z\s]+"
                                                    onInvalid={(e) => e.target.setCustomValidity('El nombre solo puede contener letras.')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    name="apellido"
                                                    value={nuevoCompetidor.apellido}
                                                    onChange={handleInputChange}
                                                    placeholder="Apellido"
                                                    pattern="[A-Za-z\s]+"
                                                    onInvalid={(e) => e.target.setCustomValidity('El apellido solo puede contener letras.')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    name="alias"
                                                    value={nuevoCompetidor.alias}
                                                    onChange={handleInputChange}
                                                    placeholder="Alias"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    name="dni"
                                                    value={nuevoCompetidor.dni}
                                                    onChange={handleInputChange}
                                                    placeholder="DNI"
                                                    pattern="\d{8}" // Ajusta el patrón según tus necesidades
                                                    onInvalid={(e) => e.target.setCustomValidity('El DNI debe contener exactamente 8 dígitos.')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    name="edad"
                                                    min="18"
                                                    onInvalid={(e) => e.target.setCustomValidity('La edad minima es 18 años')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                    value={nuevoCompetidor.edad}
                                                    onChange={handleInputChange}
                                                    placeholder="Edad"
                                                    required
                                                />
                                                <input
                                                    type="email"
                                                    name="correo"
                                                    value={nuevoCompetidor.correo}
                                                    onChange={handleInputChange}
                                                    placeholder="Correo"
                                                    pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                                                    onInvalid={(e) => e.target.setCustomValidity('El correo debe terminar en @gmail.com')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                    required
                                                />
                                                <button type="submit">Registrar</button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {/* Paginación para competidores */}
                                <div className="pagination">
                                    <button
                                        className="btn-paginacion"
                                        onClick={handlePaginaAnteriorCompetidores}
                                        disabled={paginaActualCompetidores === 1}>
                                        Anterior
                                    </button>

                                    {/* Botones de paginación para competidores */}
                                    {[...Array(totalPaginasCompetidores)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePaginaSeleccionadaCompetidores(index + 1)}
                                            className={paginaActualCompetidores === index + 1 ? 'pagina-activa btn-editar-torneos' : 'btn-editar-torneos'}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="btn-paginacion"
                                        onClick={handlePaginaSiguienteCompetidores}
                                        disabled={paginaActualCompetidores === totalPaginasCompetidores}>
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "robots" && (
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Peso</th>
                                            <th>Dimensiones</th>
                                            <th>Foto</th>
                                            <th>Competidor</th>
                                            <th>Categoria</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {robotsPaginaActual.map((robot) => (
                                            <tr key={robot.id}>
                                                <td>{robot.nombre}</td>
                                                <td>{robot.peso}</td>
                                                <td>{robot.dimensiones}</td>
                                                <td>
                                                    <img
                                                        src={robot.foto}
                                                        alt={robot.nombre}
                                                        width={75}
                                                        height={75}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleImageClick(robot.foto)}
                                                    />
                                                </td>
                                                <td>{robot.competidores.nombre}</td>
                                                <td>{robot.categorias.nombre}</td>
                                                <td>{robot.estados.nombre}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Paginación para robots */}
                                <div className="pagination">
                                    <button
                                        className="btn-paginacion"
                                        onClick={handlePaginaAnteriorRobots}
                                        disabled={paginaActualRobots === 1}>
                                        Anterior
                                    </button>

                                    {/* Botones de paginación para robots */}
                                    {[...Array(totalPaginasRobots)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePaginaSeleccionadaRobots(index + 1)}
                                            className={paginaActualRobots === index + 1 ? 'pagina-activa btn-editar-torneos' : 'btn-editar-torneos'}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="btn-paginacion"
                                        onClick={handlePaginaSiguienteRobots}
                                        disabled={paginaActualRobots === totalPaginasRobots}>
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}

                        <br></br>
                        {/* Modal para mostrar la imagen ampliada */}
                        {modalImage && (
                            <div className="modal" onClick={closeModal}>
                                <div className="modal-content">
                                    <img src={modalImage} alt="Robot Ampliado" />
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
};

export default VentanaRepClub;
