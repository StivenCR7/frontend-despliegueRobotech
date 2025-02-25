import React, { useState, useEffect } from 'react';
import '../css/Noticias.css';
import HeaderClub from './header_club';
import api from "../api";
const Noticias = () => {
  
  const [noticias, setNoticias] = useState([]);
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
      <HeaderClub />
      <section className="noticias">
        <div className="cabecera-noticias">
          <h1 className="titulo-noticias">NOTICIAS</h1>
        </div>
        <div className="noticias-container">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="noticia">
              <img
                src={noticia.imagen}
                alt="Imagen"
                className="imagen-noti"
              />
              <h2>{noticia.titulo}</h2>
              <p>{noticia.descripcion}</p>
              
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
      </section>
    </>
  );
};

export default Noticias;
