import React, { useEffect, useState } from "react";
import "../css/posiciones.css";
import api from "../api";
import HeaderGestorR from "./headerG_Resultados";

const Posiciones = () => {
    const [torneos, setTorneos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [selectedTorneo, setSelectedTorneo] = useState(null);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [error, setError] = useState(null);
    const [encuentros, setEncuentros] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const asignarRobots = async () => {
        if (!selectedCategoria) {
            setError("Selecciona una categoría para asignar robots.");
            return;
        }
        setLoading(true);
        try {
            await api.post(`/api/encuentros/asignar-robots/${selectedCategoria}`);
            fetchEncuentros(selectedCategoria);
        } catch (error) {
            console.error("Error al asignar robots: ", error);
            setError("Error al asignar robots. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const actualizarGanador = async (robotGanadorId, encuentroId) => {
        try {
            await api.put(`/api/encuentros/${encuentroId}/ganador/${robotGanadorId}`);
            fetchEncuentros(selectedCategoria);
        } catch {
            setError("Error al actualizar el ganador. Intenta nuevamente.");
        }
    };

    const actualizarFecha = async (encuentroId, nuevaFecha) => {
        const fechaActual = new Date();
        const fechaNueva = new Date(nuevaFecha);

        // Verificar si la nueva fecha es posterior a la actual
        if (fechaNueva <= fechaActual) {
            setError("La fecha debe ser posterior a la fecha actual.");
            return;
        }

        try {
            await api.put(`/api/encuentros/${encuentroId}/fecha`, { fecha: nuevaFecha });
            fetchEncuentros(selectedCategoria);
        } catch {
            setError("Error al actualizar la fecha. Intenta nuevamente.");
        }
    };

    const actualizarResultado = async (encuentroId, nuevoResultado) => {
        try {
            await api.put(`/api/encuentros/${encuentroId}/resultado`, { resultado: nuevoResultado });
            fetchEncuentros(selectedCategoria);
        } catch {
            setError("Error al actualizar el resultado. Intenta nuevamente.");
        }
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
            <HeaderGestorR />
            <div className="container-pos">
                {/* Sidebar izquierda */}
                <aside className="sidebar-pos">
                    <h2>Torneos</h2>
                    {torneos.map((torneo) => (
                        <div
                            key={torneo.id}
                            className={`box-pos ${selectedTorneo === torneo.id ? "selected" : ""}`}
                            onClick={() => fetchCategorias(torneo.id)}
                        >
                            {torneo.nombre}
                        </div>
                    ))}

                    {categorias.length > 0 && (
                        <>
                            <h2>Categorías</h2>
                            {categorias.map((categoria) => (
                                <div
                                    key={categoria.id}
                                    className={`box-pos ${selectedCategoria === categoria.id ? "selected" : ""}`}
                                    onClick={() => fetchEncuentros(categoria.id)}
                                >
                                    {categoria.nombre}
                                </div>
                            ))}
                            <button onClick={asignarRobots} disabled={loading}>
                                {loading ? "Asignando..." : "Asignar Robots"}
                            </button>
                        </>
                    )}
                </aside>

                {/* Panel derecho */}
                <section className="section-right-pos">
                    <h3>Encuentros</h3>
                    <div className="encuentros-container">
                        {encuentros.map((match) => (
                            <div key={match.encuentroId} className="match-container">
                                <div className="match-header">
                                    <span>{match.robot1Nombre}</span> vs <span>{match.robot2Nombre}</span>
                                </div>
                                <div className="match-body">
                                    <span>Fecha: {match.fechaEncuentro || "Pendiente"}</span>
                                    <span>Ronda: {match.rondaEncuentro}</span>
                                    <span>Resultado: {match.resultado}</span>
                                </div>
                                <div className="match-footer">
                                    <input
                                        type="datetime-local"
                                        value={match.fecha ? new Date(match.fecha).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => actualizarFecha(match.encuentroId, e.target.value)}
                                    />
                                    <select onChange={(e) => actualizarGanador(e.target.value, match.encuentroId)}>
                                        <option value="">Seleccionar ganador</option>
                                        <option value={match.robot1Id}>{match.robot1Nombre}</option>
                                        <option value={match.robot2Id}>{match.robot2Nombre}</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Actualizar resultado"
                                        defaultValue={match.resultado}
                                        onBlur={(e) => {
                                            const valor = e.target.value;
                                            // Expresión regular: Debe ser un número, seguido de "-", seguido de otro número
                                            const formatoValido = /^\d+-\d+$/;

                                            if (formatoValido.test(valor)) {
                                                actualizarResultado(match.encuentroId, valor);
                                            } else {
                                                alert("Formato inválido. Usa el formato número-número (por ejemplo, 1-2).");
                                                e.target.value = match.resultado; // Restaura el valor anterior si es inválido
                                            }
                                        }}
                                    />

                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default Posiciones;