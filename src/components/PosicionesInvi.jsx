import React, { useEffect, useState } from "react";
import "../css/posicionesInvi.css";
import api from "../api";
import Header from "./header_club";

const PosicionesInvi = () => {
    const [torneos, setTorneos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [selectedTorneo, setSelectedTorneo] = useState(null);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [error, setError] = useState(null);
    const [encuentros, setEncuentros] = useState([]);
    const [zoom, setZoom] = useState(1); // Estado para el zoom

    // Obtener torneos
    useEffect(() => {
        const fetchTorneos = async () => {
            try {
                const response = await api.get("/torneos");
                setTorneos(response.data);
            } catch {
                setError("Error al cargar los torneos. Intenta nuevamente.");
            }
        };
        fetchTorneos();
    }, []);

    const fetchCategorias = async (torneoId) => {
        try {
            const response = await api.get(`/torneos/${torneoId}/todasCate`);
            setCategorias(response.data);
            setSelectedTorneo(torneoId);
            setEncuentros([]);
            setError(null);
        } catch {
            setError("Error al cargar las categorías. Intenta nuevamente.");
        }
    };

    const fetchEncuentros = async (categoriaId) => {
        try {
            const response = await api.get(`/vista-encuentros-robots/encuentros/categoria/${categoriaId}`);
            setEncuentros(response.data);
            setSelectedCategoria(categoriaId);
            setError(null);
        } catch {
            setError("Error al cargar los encuentros. Intenta nuevamente.");
        }
    };

    const handleTorneoChange = (e) => {
        const torneoId = e.target.value;
        fetchCategorias(torneoId);
    };

    const handleCategoriaChange = (e) => {
        const categoriaId = e.target.value;
        fetchEncuentros(categoriaId);
    };

    const agruparPorRonda = (encuentros) => {
        return encuentros.reduce((acc, encuentro) => {
            const ronda = encuentro.rondaEncuentro;
            if (!acc[ronda]) acc[ronda] = [];
            acc[ronda].push(encuentro);
            return acc;
        }, {});
    };

    const encuentrosPorRonda = agruparPorRonda(encuentros);

    return (
        <>
            <Header />
            <div className="bracket-container">
                <div className="selector-container">
                    <label htmlFor="torneo-select">Selecciona un Torneo:</label>
                    <select id="torneo-select" onChange={handleTorneoChange}>
                        <option value="">-- Selecciona un Torneo --</option>
                        {torneos.map((torneo) => (
                            <option key={torneo.id} value={torneo.id}>
                                {torneo.nombre}
                            </option>
                        ))}
                    </select>

                    {categorias.length > 0 && (
                        <>
                            <label htmlFor="categoria-select">Selecciona una Categoría:</label>
                            <select id="categoria-select" onChange={handleCategoriaChange}>
                                <option value="">-- Selecciona una Categoría --</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                {/* Control de Zoom */}


                <div className="contenedorrondas">
                    <div >

                        <div className="bracket" >
                            {Object.keys(encuentrosPorRonda).map((ronda) => (
                                <div key={ronda} className="column">
                                    {/* Título de la ronda */}
                                    <div className="ronda-title">
                                        <span>{ronda}</span>
                                    </div>
                                    {/* Encuentros de la ronda */}
                                   
                                    {encuentrosPorRonda[ronda].map((match) => (
                                        
                                            <div
                                                key={match.encuentroId}
                                                className={`match 
                                            ${match.esGanador1 === 1 ? "winner-top" : ""}
                                            ${match.esGanador2 === 1 ? "winner-bottom" : ""}
                                        `}
                                            >
                                                <div className="match-top team">
                                                    <span className="name">{match.robot1Nombre}</span>
                                                    <span className="score">
                                                        {match.resultado ? match.resultado_robot_1 : "N/A"}
                                                    </span>
                                                </div>
                                                <div className="match-bottom team">
                                                    <span className="name">{match.robot2Nombre}</span>
                                                    <span className="score">
                                                        {match.resultado ? match.resultado_robot_2 : "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                       
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PosicionesInvi;
