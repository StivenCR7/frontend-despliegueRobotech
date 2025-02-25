import React, { useEffect, useState } from "react";
import '../css/Inicio.css'
import api from "../api";
import { Link, useNavigate } from 'react-router-dom';
import Header from "./header_club";

function Inicioo() {
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [encuentros, setEncuentros] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  // Obtener torneos
  useEffect(() => {
    cargarNoticias();
    cargarranking();
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

  const cargarranking = async () => {
    api.get("/api/participaciones")
      .then(response => {
        const dataOrdenada = response.data.sort((a, b) => b.victorias - a.victorias);
        setParticipaciones(dataOrdenada.slice(0, 4)); // Solo tomamos los 4 primeros
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al obtener las participaciones:", error);
        setLoading(false);
      });
  }
  const cargarNoticias = async () => {
    try {
      const response = await api.get("/noticias/listar");
      const noticiasAleatorias = seleccionarNoticiasAleatorias(response.data, 3);
      setNoticias(noticiasAleatorias);
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    }
  };
  // Función para seleccionar 'n' elementos aleatorios de un array
  const seleccionarNoticiasAleatorias = (array, n) => {
    const noticiasMezcladas = array.sort(() => Math.random() - 0.5);
    return noticiasMezcladas.slice(0, n);
  };

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
  return (<>
    <Header />
    <div className="container-inicio2">
      {/* Sidebar */}
      <div className="sidebar-inicio2">
  <div className="logo-inicio2">Robotech Esports</div>
  <h2>Torneos</h2>
  {torneos
    .filter((torneo) => new Date(torneo.fecha_fin) > new Date()) // Filtra los torneos no finalizados
    .map((torneo) => (
      <div
        key={torneo.id}
        className={`box-pos2 ${selectedTorneo === torneo.id ? "selected2" : ""}`}
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
          className={`box-pos2 ${selectedCategoria === categoria.id ? "selected2" : ""}`}
          onClick={() => fetchEncuentros(categoria.id)}
        >
          {categoria.nombre}
        </div>
      ))}
    </>
  )}
</div>


      {/* Main Content */}
      <div className="main-content-inicio">
        {/* Match Schedule Section */}

        <div className="schedule-section-inicio">
          {encuentros.map((match) => (
            <div key={match.encuentroId}>
              <h3>{match.fechaEncuentro || "Pendiente"}</h3>
              <p>Ronda: {match.rondaEncuentro}</p>
              <div className="match-schedule-inicio">
                <div className="match-card-inicio">
                  <a href="https://www.youtube.com/@ROBOTECH2025" target="blank"><button className="play-btn-inicio">▶</button></a>
                  <div className="teams-inicio">
                    <div className="team-inicio">{match.robot1Nombre}</div>
                    <div className="score-inicio"> {match.resultado ? match.resultado_robot_1 : "N/A"}</div>
                    <div className="vs-inicio">vs</div>
                    <div className="score-inicio">  {match.resultado ? match.resultado_robot_2 : "N/A"}</div>
                    <div className="team-inicio">{match.robot2Nombre}</div>
                  </div>
                  <div className="details-inicio">{match.categoriaFormato}</div>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Rankings and News Section */}
        < div className="right-section-inicio" >
          {/* Global Rankings */}
          < div className="global-rankings-inicio" >
            <h3>Ranking</h3>

            <div className="tabla-estilo">
              <div className="tabla-header">
                <span>ID</span>
                <span>Robot</span>
                <span>Victorias</span>
              </div>

              {participaciones.length > 0 ? (
                participaciones.map((participacion) => (
                  <div key={participacion.id} className="fila">
                    <span>{participacion.id}</span>
                    <span>{participacion.robot?.nombre || "N/A"}</span>
                    <span>{participacion.victorias}</span>
                  </div>
                ))
              ) : (
                <p>No hay participaciones registradas.</p>
              )}
              <Link to="/Ranking">Ver mas</Link>
            </div>
          </div>

          {/* News Section */}
          <div className="news-section-inicio">
            <h3>Noticias</h3>
            {noticias.map((noticia) => (
              <div key={noticia.id}>

                <ul  className="texto-truncado">
                  <li>
                    <img
                      src={`${api.defaults.imageURL}${noticia.imagen}`}
                      alt="Imagen"
                      className="imagen-noti"
                      width={60} height={60}
                    />
                    <p>{noticia.titulo}</p>
                    <span>{noticia.descripcion}</span>
                  </li>

                </ul>
              </div>
            ))}
            <Link to="/noticias">Ver mas</Link>
          </div>
        </div>
      </div >
    </div >
  </>
  );
}

export default Inicioo
