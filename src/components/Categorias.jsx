import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../api";

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        peso: "",
        dimensiones: "",
        competidorId: "",
        foto: null,
    });
    const [competidores, setCompetidores] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token"); // Asegúrate de que el token esté almacenado

    useEffect(() => {
        // Cargar categorías desde la API
        api.get("/categorias")
            .then(response => setCategorias(response.data))
            .catch(error => console.error("Error al obtener categorías:", error));

        // Cargar competidores (ajusta la URL según tu API)
        api.get("/competidores", { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setCompetidores(response.data))
            .catch(error => console.error("Error al obtener competidores:", error));
    }, [token]);

    const abrirFormulario = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setMostrarFormulario(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, foto: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("nombre", formData.nombre);
        formDataToSend.append("peso", formData.peso);
        formDataToSend.append("dimensiones", formData.dimensiones);
        formDataToSend.append("competidorId", formData.competidorId);
        formDataToSend.append("foto", formData.foto);

        try {
            await api.post(
                `/robots/registrar/${categoriaSeleccionada.id}`,
                formDataToSend,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({ title: "¡Robot registrado exitosamente!", icon: "success" });

            setFormData({ nombre: "", peso: "", dimensiones: "", competidorId: "", foto: null });
            setMostrarFormulario(false);
        } catch (error) {
            console.error("Error al Inscribir robot:", error);
            Swal.fire({ icon: "error", title: "Oops...", text: "Error al crear robot!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="categorias-container">
            <h1>Selecciona una categoría</h1>
            <div className="categorias-grid">
                {categorias.map((categoria) => (
                    <div key={categoria.id} className="categoria-card" onClick={() => abrirFormulario(categoria)}>
                        <img src={categoria.banner} alt={categoria.nombre} className="categoria-banner" />
                        <h2>{categoria.nombre}</h2>
                    </div>
                ))}
            </div>

            {mostrarFormulario && (
                <div className="formulario-overlay" onClick={(e) => {
                    if (e.target.classList.contains("formulario-overlay")) setMostrarFormulario(false);
                }}>
                    <div className="formulario-content">
                        <h2>Registrar Robot en {categoriaSeleccionada?.nombre}</h2>
                        <form onSubmit={handleSubmit}>
                            <label>Nombre:</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

                            <label>Peso:</label>
                            <input type="text" name="peso" value={formData.peso} onChange={handleChange} required />

                            <label>Dimensiones:</label>
                            <input type="text" name="dimensiones" value={formData.dimensiones} onChange={handleChange} required />

                            <label>Selecciona un Competidor:</label>
                            <select name="competidorId" value={formData.competidorId} onChange={handleChange} required>
                                {competidores.length > 0 ? (
                                    competidores.map((competidor) => (
                                        <option key={competidor.id} value={competidor.id}>
                                            {competidor.nombre}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No hay competidores disponibles</option>
                                )}
                            </select>

                            <label>Foto:</label>
                            <label className="label-file" htmlFor="foto">Seleccionar Imagen</label>
                            <input
                                type="file"
                                id="foto"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                                className="input-file"
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Registrando..." : "Registrar Robot"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorias;
