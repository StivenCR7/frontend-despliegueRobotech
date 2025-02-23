import React, { useState, useEffect } from "react";
import api from "../api";
import '../css/Crear_Eventos.css';
import Header from './headeradmin';

const CrearEventos = () => {
    const Admin = true;
    const [torneos, setTorneos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modo, setModo] = useState("");
    const [torneoEditado, setTorneoEditado] = useState({
        nombre: "",
        fecha_inicio: "",
        fecha_fin: "",
    });
    const [torneoId, setTorneoId] = useState('');
    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState(0);
    const [formato, setFormato] = useState("");
    const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
    const [mostrarInputCantidad, setMostrarInputCantidad] = useState(false);
    const [banner, setBanner] = useState(null); // Nuevo estado para el banner


    useEffect(() => {

        cargarTorneos();
    }, []);
    const cargarTorneos = async () => {
        try {
            const response = await api.get("torneos");
            const torneosConCategorias = await Promise.all(response.data.map(async (torneo) => {
                try {
                    const categoriasResponse = await api.get(`/torneos/${torneo.id}/todasCate`);
                    return { ...torneo, categorias: categoriasResponse.data };
                } catch (error) {
                    console.error(`Error al cargar categorías del torneo ${torneo.id}:`, error);
                    return torneo; // Asegúrate de que el torneo aún se muestre sin categorías si ocurre un error
                }
            }));
            setTorneos(torneosConCategorias);
        } catch (error) {
            console.error("Error al cargar torneos:", error);
        }
    };

    const abrirModalTorneo = (accion, torneo = null) => {
        setModo(accion);
        if (accion === "editar" && torneo) {
            setTorneoEditado(torneo);
        } else {
            setTorneoEditado({ nombre: "", fecha_inicio: "", fecha_fin: "" });
        }
        setMostrarModal(true);
    };

    const cerrarModalTorneo = () => {
        setMostrarModal(false);
    };

    const handleSubmitTorneo = async (e) => {
        e.preventDefault();
        if (new Date(torneoEditado.fecha_inicio) > new Date(torneoEditado.fecha_fin)) {

            Swal.fire("La fecha de inicio no puede ser posterior a la fecha de fin!");
            return;
        }
        try {
            let response;
            if (modo === "agregar") {
                response = await api.post("torneos/crear", torneoEditado);
            } else if (modo === "editar") {
                response = await api.put(`torneos/editar/${torneoEditado.id}`, torneoEditado);
            }

            Swal.fire({
                title: "Torneo creado con éxito!",
                icon: "success",
            });

            // Actualiza el estado de los torneos con la nueva información
            cargarTorneos(); // Puedes hacer esto para obtener los torneos con las categorías actualizadas.
            cerrarModalTorneo();
        } catch (error) {
            console.error("Error al guardar torneo:", error);
        }
    };


    const abrirModalCategoria = () => {
        setMostrarModalCategoria(true);
    };

    const cerrarModalCategoria = () => {
        setNombre('');
        setCantidad(0);
        setFormato('');
        setMostrarInputCantidad(false);
        setMostrarModalCategoria(false);
    };

    const manejarEnvioCategoria = async (e) => {
        e.preventDefault();

        const cantidadValor = cantidad === "otro" ? parseInt(document.getElementById('cantidadInput').value, 10) : cantidad;

        if (cantidadValor < 8 || (cantidadValor & (cantidadValor - 1)) !== 0) {
            Swal.fire({
                icon: "error",
                title: "Cantidad inválida",
                text: "La cantidad debe ser una potencia de 2 y mayor o igual a 8.",
            });
            return;
        }

        if (!cantidadValor && !formato) {
            Swal.fire({
                icon: "error",
                title: "Formato o Cantidad requeridos",
                text: "Por favor, ingrese una cantidad válida o seleccione un formato.",
            });
            return;
        }

        // Crear un objeto FormData
        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("cantidad", cantidadValor);
        formData.append("formato", formato);
        formData.append("banner", banner); // Agregar el archivo de imagen

        try {
            const response = await api.post(`/torneos/${torneoId}/categorias`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const categoriaId = response.data.id;
            await api.post(`/api/encuentros/generar/${categoriaId}`);

            Swal.fire({
                title: "Categoría y encuentros generados con éxito!",
                icon: "success",
            });

            setTorneos((prevTorneos) =>
                prevTorneos.map((torneo) =>
                    torneo.id === torneoId
                        ? { ...torneo, categorias: [...torneo.categorias, response.data] }
                        : torneo
                )
            );

            cargarTorneos();
        } catch (error) {
            console.error("Error al crear categoría o generar encuentros:", error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al crear categoría o generar encuentros!",
            });
        } finally {
            cerrarModalCategoria(); // Asegura que siempre se cierre el modal
        }
    };


    const [paginaActual, setPaginaActual] = useState(1);
    const torneosPorPagina = 9; // Número de torneos por página
    const obtenerTorneosPaginados = () => {


        const inicio = (paginaActual - 1) * torneosPorPagina;
        const fin = inicio + torneosPorPagina;
        return torneos.slice(inicio, fin);
    };
    const totalPaginas = Math.ceil(torneos.length / torneosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const handleCantidadChange = (e) => {
        const valor = e.target.value;
        setCantidad(valor);

        // Mostrar el input para cantidad si el valor es "otro"
        setMostrarInputCantidad(valor === "otro");
    };

    return (
        <>
            <Header />
            <section className="torneos">
                <div className="cabecera-torneos">
                    <h1 className="titulo-torneos">TORNEOS</h1>
                    {Admin && (
                        <div className="botones-torneos">
                            <button className="btn-editar-torneos" onClick={() => abrirModalTorneo("agregar")}>
                                Agregar Torneo
                            </button>
                            <button
                                className="btn-editar-torneos"
                                onClick={abrirModalCategoria}
                            >
                                Agregar Categoría
                            </button>
                        </div>
                    )}
                </div>

                <div className="torneos-container">
                    {obtenerTorneosPaginados().map((torneo) => (
                        <div key={torneo.id} className="torneo-tor">
                            <h2>{torneo.nombre}</h2>
                            <p>
                                {new Date(torneo.fecha_inicio).toLocaleDateString('es-ES', {
                                    timeZone: 'UTC',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <p>
                                {new Date(torneo.fecha_fin).toLocaleDateString('es-ES', {
                                    timeZone: 'UTC',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            {/* Superposición: Condicional de estado del torneo */}
                            {
                                new Date(torneo.fecha_fin) < new Date() && (
                                    <div className="overlay">
                                        <span>Torneo Finalizado</span>
                                    </div>
                                )
                            }
                            <div className="categorias-container">
                                <h3>Categorías:</h3>
                                {torneo.categorias && torneo.categorias.length > 0 ? (
                                    torneo.categorias.map((categoria) => (
                                        <div key={categoria.id} className="categoria-item">
                                            <p><strong>Nombre:</strong> {categoria.nombre}</p>
                                            <p><strong>Cantidad:</strong> {categoria.cantidad}</p>
                                            <p><strong>Formato:</strong> {categoria.formato}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay categorías añadidas.</p>
                                )}
                            </div>

                            {Admin && (
                                <div className="botones-acciones">
                                    <button
                                        className="btn-editar-torneos"
                                        onClick={() => abrirModalTorneo("editar", torneo)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                </div>
                <div className="paginacion">
                    {[...Array(totalPaginas)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => cambiarPagina(index + 1)}
                            className={paginaActual === index + 1 ? "activo" : ""}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                {mostrarModal && (
                    <div className="modal-overlay-torneos" onClick={(e) => {
                        if (e.target.classList.contains('modal-overlay-torneos')) {
                            cerrarModalTorneo();
                        }
                    }}>
                        <div className="modal-content-torneos">
                            <h2>{modo === "editar" ? "Editar Torneo" : "Agregar Torneo"}</h2>
                            <form id="form-torneo" onSubmit={handleSubmitTorneo}>
                                <label>Nombre de Torneo:</label>
                                <input
                                    type="text"
                                    value={torneoEditado.nombre}
                                    onChange={(e) =>
                                        setTorneoEditado({ ...torneoEditado, nombre: e.target.value })
                                    }
                                    required
                                    disabled={new Date(torneoEditado.fecha_fin) < new Date()} // Deshabilitar si la fecha de fin ya pasó
                                />
                                <label>Fecha de Torneo Inicio:</label>
                                <input
                                    type="date"
                                    value={torneoEditado.fecha_inicio}
                                    min={new Date().toISOString().split("T")[0]} // Fecha mínima: hoy
                                    onChange={(e) => {
                                        const nuevaFechaInicio = e.target.value;
                                        if (new Date(nuevaFechaInicio) > new Date(torneoEditado.fecha_fin)) {
                                            alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
                                        } else {
                                            setTorneoEditado({ ...torneoEditado, fecha_inicio: nuevaFechaInicio });
                                        }
                                    }}
                                    required
                                    disabled={new Date(torneoEditado.fecha_fin) < new Date()} // Deshabilitar si la fecha de fin ya pasó
                                />
                                <label>Fecha de Torneo Fin:</label>
                                <input
                                    type="date"
                                    value={torneoEditado.fecha_fin}
                                    min={torneoEditado.fecha_inicio} // No puede ser anterior a la fecha de inicio
                                    onChange={(e) => {
                                        const nuevaFechaFin = e.target.value;
                                        if (new Date(torneoEditado.fecha_inicio) > new Date(nuevaFechaFin)) {
                                            alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
                                        } else {
                                            setTorneoEditado({ ...torneoEditado, fecha_fin: nuevaFechaFin });
                                        }
                                    }}
                                    required
                                    disabled={new Date(torneoEditado.fecha_fin) < new Date()} // Deshabilitar si la fecha de fin ya pasó
                                />
                                <div className="modal-buttons-torneos">
                                    <button
                                        type="submit"
                                        className="btn-guardar-torneos"
                                        disabled={new Date(torneoEditado.fecha_fin) < new Date()} // Deshabilitar si la fecha de fin ya pasó
                                    >
                                        {modo === "editar" ? "Guardar" : "Añadir"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {mostrarModalCategoria && (
                    <div className="modal-overlay-torneos" onClick={(e) => {
                        if (e.target.classList.contains('modal-overlay-torneos')) {
                            cerrarModalCategoria();
                        }
                    }}>
                        <div className="modal-content-torneos">
                            <h2>Agregar Categoría</h2>
                            <form id="form-categoria" onSubmit={manejarEnvioCategoria}>
                                <label>Seleccionar Torneo:</label>
                                <select
                                    value={torneoId}
                                    onChange={(e) => setTorneoId(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione un torneo</option>
                                    {torneos
                                        .filter((torneo) => new Date(torneo.fecha_inicio) > new Date()) // Filtra torneos no iniciados
                                        .map((torneo) => (
                                            <option key={torneo.id} value={torneo.id}>
                                                {torneo.nombre}
                                            </option>
                                        ))}
                                </select>


                                <label>Nombre de Categoría:</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                                <label>Cantidad:</label>
                                <select
                                    value={cantidad}
                                    onChange={handleCantidadChange}
                                    required
                                >
                                    <option value="">Selecciona una cantidad</option>
                                    <option value="8">8</option>
                                    <option value="16">16</option>
                                    <option value="32">32</option>
                                    <option value="otro">Otro</option>
                                </select>

                                {mostrarInputCantidad && (
                                    <input
                                        type="number"
                                        id="cantidadInput"
                                        value={cantidad === "otro" ? "" : cantidad}
                                        onChange={(e) => setCantidad(e.target.value)}
                                        placeholder="Ingresa otra cantidad"
                                        required
                                    />
                                )}

                                <label>Formato:</label>
                                <select
                                    value={formato}
                                    onChange={(e) => setFormato(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione un formato</option>
                                    <option value="Eliminación directa">Eliminación Directa</option>
                                </select>
                                <label>Banner:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (!file.type.startsWith("image/")) {
                                                Swal.fire({
                                                    icon: "error",
                                                    title: "Formato no permitido",
                                                    text: "Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.).",
                                                });
                                                e.target.value = ""; // Limpia el input
                                                return;
                                            }
                                            setBanner(file); // Actualiza el estado con el archivo válido
                                        }
                                    }}
                                    required
                                />

                                <button type="submit" className="btn-guardar-torneos">Guardar Categoría</button>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default CrearEventos;