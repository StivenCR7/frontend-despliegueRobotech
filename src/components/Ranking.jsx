import { useEffect, useState } from "react";
import api from "../api";
import "../css/Ranking.css";
import Header from "./header_club";

const Ranking = () => {
    const [participaciones, setParticipaciones] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("");
    const [orden, setOrden] = useState({ columna: "victorias", asc: true });
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        api.get("/api/participaciones")
            .then(response => {
                setParticipaciones(response.data);
                setFilteredData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener las participaciones:", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let data = [...participaciones];

        if (search) {
            data = data.filter(p =>
                p.robot && p.robot.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (categoriaFiltro) {
            data = data.filter(p =>
                p.categoria && p.categoria.nombre === categoriaFiltro
            );
        }

        data.sort((a, b) => {
            let valorA = a[orden.columna] || "";
            let valorB = b[orden.columna] || "";

            if (orden.columna === "robot") {
                valorA = a.robot?.nombre || "";
                valorB = b.robot?.nombre || "";
            }
            if (orden.columna === "categoria") {
                valorA = a.categoria?.nombre || "";
                valorB = b.categoria?.nombre || "";
            }
            if (orden.columna === "torneo") {
                valorA = a.categoria?.torneos?.nombre || "";
                valorB = b.categoria?.torneos?.nombre || "";
            }

            if (typeof valorA === "string" && typeof valorB === "string") {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }

            if (valorA < valorB) return orden.asc ? -1 : 1;
            if (valorA > valorB) return orden.asc ? 1 : -1;
            return 0;
        });

        setFilteredData(data);
    }, [search, categoriaFiltro, orden, participaciones]);

    const cambiarOrden = (columna) => {
        setOrden(prevOrden => ({
            columna,
            asc: prevOrden.columna === columna ? !prevOrden.asc : true
        }));
    };

    const iconoOrden = (columna) => {
        return orden.columna === columna ? (orden.asc ? "🔼" : "🔽") : "↕️";
    };

    if (loading) {
        return <p>Cargando participaciones...</p>;
    }

    return (
        <><Header/>
            <div className="container_ran">
                <div className="main-content_ran">
                    <div className="section-header_ran">
                        <h1 className="h1_ran">Robotech Tournaments</h1>
                    </div>
                    <div className="filters_ran">
                        <input
                            type="text"
                            placeholder="Buscar robot..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <label htmlFor="category">Categoría:</label>
                        <select id="category" onChange={(e) => setCategoriaFiltro(e.target.value)}>
                            <option value="">Todas las categorías</option>
                            {participaciones
                                .map(p => p.categoria?.nombre)
                                .filter((v, i, a) => v && a.indexOf(v) === i)
                                .map((categoria, index) => (
                                    <option key={index} value={categoria}>{categoria}</option>
                                ))}
                        </select>
                    </div>
                    <div className="ranking-table_ran">
                        <table className="table_ran">
                            <thead>
                                <tr>
                                    <th onClick={() => cambiarOrden("id")}>ID {iconoOrden("id")}</th>
                                    <th onClick={() => cambiarOrden("robot")}>Robot {iconoOrden("robot")}</th>
                                    <th onClick={() => cambiarOrden("categoria")}>Categoría {iconoOrden("categoria")}</th>
                                    <th onClick={() => cambiarOrden("torneo")}>Torneo {iconoOrden("torneo")}</th>
                                    <th onClick={() => cambiarOrden("victorias")}>Victorias {iconoOrden("victorias")}</th>
                                    <th onClick={() => cambiarOrden("derrotas")}>Derrotas {iconoOrden("derrotas")}</th>
                                    <th onClick={() => cambiarOrden("posicionFinal")}>Posición Final {iconoOrden("posicionFinal")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((participacion) => (
                                        <tr key={participacion.id}>
                                            <td>{participacion.id}</td>
                                            <td>{participacion.robot ? participacion.robot.nombre : "N/A"}</td>
                                            <td>{participacion.categoria ? participacion.categoria.nombre : "N/A"}</td>
                                            <td>{participacion.categoria?.torneos ? participacion.categoria.torneos.nombre : "N/A"}</td>
                                            <td>{participacion.victorias}</td>
                                            <td>{participacion.derrotas}</td>
                                            <td>{participacion.posicionFinal}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">No hay participaciones registradas</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                 {/* Barra lateral con información */}
            <div className="right-sidebar_ran">
                    <h2 className="h2_ran">¿Qué son los Rankings?</h2>
                    <p className="p_ran">
                        Esta es una clasificación de la fuerza de los competidores en el nivel más alto de juego. Se calcula usando
                        una combinación de las siguientes puntuaciones:
                    </p>
                    <ul>
                        <li>Puntuaciones de resultados de las partidas de equipo</li>
                        <li>Fuerza del Oponente</li>
                        <li>Margen de Victoria</li>
                        <li>Contexto de Juego</li>
                    </ul>
                </div>
            </div>
           

        </>
    );
};

export default Ranking;
