import React, { useState, useEffect } from "react";
import api from "../api";
import '../css/Competencias.css';
import Header from "./header_club";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


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
        // Decodifica el token para obtener el clubId
        const decodedToken = jwtDecode(token);
        const clubId = decodedToken.clubId;
    
        // Obtener competidores y filtrar solo los del club logueado
        api
          .get("/competidores/listar", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const competidoresFiltrados = response.data.filter(
              (competidor) =>
                competidor.clubes && competidor.clubes.id === Number(clubId)
            );
            setCompetidores(competidoresFiltrados);
          })
          .catch((error) =>
            console.error("Error al obtener competidores:", error)
          );
      }, [token]);



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
    
        // Validar que se haya seleccionado un competidor
        if (!formData.competidorId) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Debe seleccionar un competidor válido",
          });
          setLoading(false);
          return;
        }
    
        const formDataToSend = new FormData();
        formDataToSend.append("nombre", formData.nombre);
        formDataToSend.append("peso", formData.peso);
        formDataToSend.append("dimensiones", formData.dimensiones);
        // Convertir a número en caso de ser necesario
        formDataToSend.append("competidorId", Number(formData.competidorId));
        if (formData.foto) {
          formDataToSend.append("foto", formData.foto);
        }
    
        try {
          // Suponiendo que la ruta para registrar robots requiera el id de categoría u otro parámetro
          const response = await api.post(
            `/robots/registrar/${formData.categoriaId || 1}`, // Ajusta la URL según tus necesidades
            formDataToSend,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire({
            title: "¡Robot registrado exitosamente!",
            icon: "success",
          });
          setFormData({
            nombre: "",
            peso: "",
            dimensiones: "",
            competidorId: "",
            foto: null,
            categoriaId: formData.categoriaId || 1,
          });
        } catch (error) {
          console.error("Error al registrar robot:", error);
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
                                        required
                                    />
                                    <label>Selecciona un Competidor:</label>
                                    <select name="competidorId" value={formData.competidorId} onChange={handleChange} required>
                                        <option value="">Seleccione un competidor</option>
                                        {competidores.map((competidor) => (
                                            <option key={competidor.id} value={competidor.id}>
                                                {competidor.nombre}
                                            </option>
                                        ))}
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
