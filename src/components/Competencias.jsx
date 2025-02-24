import React, { useState, useEffect } from "react";
import api from "../api";
import '../css/Competencias.css';
import Header from "./header_club";
import { useParams } from "react-router-dom";


const Competencias = () => {
    const { torneoId, categoriaId } = useParams(); // Obtener los parámetros de la URL
    const [categorias, setCategorias] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [error, setError] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [competidores, setCompetidores] = useState([]);
    const token = localStorage.getItem("token");
    const [formData, setFormData] = useState({
        nombre: '',
        peso: '',
        dimensiones: '',
        competidorId: '',
        foto: null,
        categoriaId: categoriaId // Establecer la categoría seleccionada
    });

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await api.get(`/torneos/${torneoId}/todasCate`);
                setCategorias(response.data);
                const categoria = response.data.find(cat => cat.id === parseInt(categoriaId));
                setSelectedCategoria(categoria || null);
            } catch {
                setError("Error al cargar las categorías.");
            }
        };
        fetchCategorias();
    }, [torneoId, categoriaId]);

    useEffect(() => {
        // Obtener competidores
        api.get('/competidores/listar', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                console.log('Competidores obtenidos:', response.data);
                setCompetidores(response.data);
            })
            .catch(error => console.error('Error al obtener competidores:', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Verificar si el archivo es una imagen
            if (!file.type.startsWith("image/")) {
                Swal.fire({
                    icon: "error",
                    title: "Formato no permitido",
                    text: "Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.).",
                });
                e.target.value = ""; // Limpia el input
                return;
            }
            setFormData({ ...formData, foto: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('');

        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre);
        formDataToSend.append('peso', formData.peso);
        formDataToSend.append('dimensiones', formData.dimensiones);
        formDataToSend.append('competidorId', formData.competidorId);
        formDataToSend.append('categoriaId', formData.categoriaId); // Usar la categoría seleccionada
        if (formData.foto) {
            formDataToSend.append('foto', formData.foto);
        }

        try {
            const response = await api.post(
                `/robots/registrar/${formData.categoriaId}`,
                formDataToSend,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                title: "¡Robot registrado exitosamente!",
                icon: "success",
            });
            setFormData({ nombre: '', peso: '', dimensiones: '', competidorId: '', foto: null, categoriaId: categoriaId }); // Reiniciar el formulario
        } catch (error) {
            console.error("Error al Inscribir robot:", error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al crear robot!",
            });
        } finally {
            setLoading(false);
        }
        
    };

    return (
        <>
            <Header />
            <main className="crobot-container">
                <section className="crobot">
                    <div className="cabecera-crobot">
                        <h1 className="titulo-crobot">{selectedCategoria ? selectedCategoria.nombre : "Selecciona una categoría"}</h1>
                    </div>

                    <div className="background-crobot">
                        <div className="contenido-crobot">
                            {selectedCategoria && selectedCategoria.banner ? (
                                <img src={`${api.defaults.baseURL}/images/${selectedCategoria.banner}`} alt="Banner de la categoría" className="banner-image" />
                            ) : (
                                <p>Selecciona una categoría para ver su información</p>
                            )}
                            <button className="btn-participa-crobot" onClick={() => setMostrarFormulario(true)}>
                                Participa aquí
                            </button>
                        </div>
                    </div>

                    {mostrarFormulario && (
                        <div className=" formulario-overlay" onClick={(e) => {
                            if (e.target.classList.contains('formulario-overlay')) {
                                setMostrarFormulario(false);
                            }
                        }}>
                            <div className="formulario-content">
                                <h2>Registrar Robot</h2>
                                <form onSubmit={handleSubmit}>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Nombre"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="peso"
                                        value={formData.peso}
                                        onChange={handleChange}
                                        placeholder="Peso"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="dimensiones"
                                        value={formData.dimensiones}
                                        onChange={handleChange}
                                        placeholder="Dimensiones"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={selectedCategoria ? selectedCategoria.nombre : ''} readOnly
                                        onChange={handleChange}
                                        placeholder="Categoria Seleccionada:"
                                        pattern="[A-Za-z\s]+"
                                        onInvalid={(e) => e.target.setCustomValidity('El nombre solo puede contener letras.')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                        required
                                    />
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
                                        {loading ? 'Registrando...' : 'Registrar Robot'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
};

export default Competencias;
