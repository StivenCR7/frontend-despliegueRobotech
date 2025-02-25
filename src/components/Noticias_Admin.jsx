import React, { useState, useEffect } from 'react';
import api from "../api";
import '../css/Noticias.css';
import Header from './headeradmin';

const Noticias = () => {
  const Admin = true;
  const [noticias, setNoticias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modo, setModo] = useState('');
  const [noticiaEditada, setNoticiaEditada] = useState({ titulo: '', descripcion: '', imagen: null });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalNoticias, setTotalNoticias] = useState(0);
  const noticiasPorPagina = 9;


  useEffect(() => {
    cargarNoticias();
  }, [paginaActual]);

  const cargarNoticias = async () => {
    try {
      const response = await api.get("/noticias/listar", {
        params: {
          _page: paginaActual,
          _limit: noticiasPorPagina,
        },
      });
      setNoticias(response.data);

      // Obtener el total de noticias para la paginación
      const totalResponse = await api.get("noticias/listar");
      setTotalNoticias(totalResponse.data.length);
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    }
  };

  const abrirModal = (accion, noticia = null) => {
    setModo(accion);
    if (accion === 'editar' && noticia) {
      setNoticiaEditada(noticia);
    } else {
      setNoticiaEditada({ titulo: '', descripcion: '', imagen: null });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("titulo", noticiaEditada.titulo);
    formData.append("descripcion", noticiaEditada.descripcion);
    if (noticiaEditada.imagen) {
      formData.append("imagen", noticiaEditada.imagen);
    }

    try {
      if (modo === 'agregar') {
        await api.post("noticias/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          title: "Noticia Agregada Correctamente!",
          icon: "success",
        });
      } else if (modo === 'editar') {
        await api.put(`noticias/update/${noticiaEditada.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          title: "Noticia Actualizada Correctamente!",
          icon: "success",
        });
      }

      cargarNoticias();
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar noticia:", error);
    }
  };

  const eliminarNoticia = async (id) => {
    try {
      await api.delete(`noticias/delete/${id}`);
      Swal.fire({
        title: "Noticia Eliminada Correctamente!",
        icon: "success",
      });
      cargarNoticias();
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
    }
  };

  // Calcular el número total de páginas
  const totalPaginas = Math.ceil(totalNoticias / noticiasPorPagina);

  // Navegar entre páginas
  const manejarPagina = (numeroPagina) => {
    if (numeroPagina > 0 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina);
    }
  };

  return (
    <>
      <Header />
      <section className="noticias">
        <div className="cabecera-noticias">
          <h1 className="titulo-noticias">NOTICIAS</h1>
          {Admin && (
            <button className="btn-agregar-noticias" onClick={() => abrirModal('agregar')}>Agregar Noticia</button>
          )}
        </div>
        <div className="noticias-container">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="noticia">
              <img src={`${noticia.imagen}`} alt="Imagen" className="imagen-noti" />
              <h2>{noticia.titulo}</h2>
              <p>{noticia.descripcion}</p>
              {Admin && (
                <>
                  <button className="btn-editar-noti" onClick={() => abrirModal('editar', noticia)}>Editar</button>
                  <button className="btn-eliminar-noti" onClick={() => eliminarNoticia(noticia.id)}>Eliminar</button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div className="paginacion">
          <button className='btn-paginacion'
            onClick={() => manejarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <span>{paginaActual} de {totalPaginas}</span>
          <button className='btn-paginacion'
            onClick={() => manejarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>

        {mostrarModal && (
          <div className="modal-overlay-noti" onClick={(e) => {
            if (e.target.classList.contains('modal-overlay-noti')) {
              cerrarModal();
            }
          }}>
            <div className="modal-content-noti">
              <h2>{modo === 'editar' ? 'Editar Noticia' : 'Agregar Noticia'}</h2>
              <form id="form-noticia" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={noticiaEditada.titulo}
                  onChange={(e) => setNoticiaEditada({ ...noticiaEditada, titulo: e.target.value })}
                  placeholder="Título"
                  required
                />
                <textarea
                  value={noticiaEditada.descripcion}
                  onChange={(e) => setNoticiaEditada({ ...noticiaEditada, descripcion: e.target.value })}
                  placeholder="Descripción"
                  className="textarea-descripcion-noticias"
                  required
                />
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
                      setNoticiaEditada({ ...noticiaEditada, imagen: file });
                    }
                  }}
                />


                <button type="submit-noti" id="submit-noti">Guardar</button>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Noticias;
