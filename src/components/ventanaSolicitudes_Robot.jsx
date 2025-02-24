import React, { useState, useEffect } from "react";
import Header from './headervalidacion';
import '../css/validacion.css';
import api from "../api";

const VentanaSolicitudesRobot = () => {
  const [estados, setEstados] = useState([]); // Lista de estados
  const [robots, setRobots] = useState([]); // Lista de robots
  const [selectedEstados, setSelectedEstados] = useState({}); // Estados seleccionados por robot
  const [categoriaId, setCategoriaId] = useState(1); // ID de la categoría que se desea filtrar
  const [categorias, setCategorias] = useState([]); // Lista de categorías
  const [torneos, setTorneos] = useState([]); // Lista de torneos
  const [modalImage, setModalImage] = useState(null); // Estado para la imagen seleccionada

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl); // Abrir el modal con la imagen seleccionada
  };

  const closeModal = () => {
    setModalImage(null); // Cerrar el modal
  };
  // Obtener lista de estados desde el backend
  useEffect(() => {
    api.get("/robots/estados")
      .then(response => {
        console.log("Estados:", response.data); // Verifica la respuesta
        setEstados(response.data);
      })
      .catch(err => console.error("Error al obtener estados:", err));
  }, []);

  // Obtener torneos desde el backend
  useEffect(() => {
    api.get("/torneos")
      .then(response => {
        console.log("Torneos:", response.data); // Verifica la respuesta
        setTorneos(response.data); // Guarda los torneos en el estado
      })
      .catch(err => {
        console.error("Error al obtener torneos:", err);
      });
  }, []);

  // Obtener categorías desde el backend y filtrar por torneos no finalizados
  useEffect(() => {
    api
      .get("/robots/obtener/categorias")
      .then((response) => {
        console.log("Categorías antes de filtrar:", response.data); // Verifica la respuesta
        const currentDate = new Date();
        const filteredCategorias = response.data.filter(categoria => {
          // Accede a la fecha de inicio del torneo desde el objeto anidado
          const fechaInicio = new Date(categoria.torneos.fecha_inicio);
          return fechaInicio > currentDate; // Filtra categorías con torneos que no han comenzado
        });
        console.log("Categorías filtradas:", filteredCategorias); // Verifica las categorías filtradas
        setCategorias(filteredCategorias); // Guarda las categorías filtradas en el estado
      })
      .catch((error) => {
        console.error("Error al obtener las categorías:", error);
      });
  }, []); // No es necesario depender de torneos aquí, ya que estamos accediendo directamente a la propiedad anidada

  // Obtener robots por categoría desde el backend
  useEffect(() => {
    if (categoriaId) { // Solo hacer la llamada si hay una categoría seleccionada
      console.log("Obteniendo robots para la categoría:", categoriaId);
      api.get(`/robots/listar/${categoriaId}`)
        .then(response => {
          console.log("Respuesta de robots:", response.data); // Verifica la respuesta
          const robotsData = response.data; // Ajusta según la estructura de la respuesta
          if (Array.isArray(robotsData)) {
            setRobots(robotsData); // Solo establece si es un array
          } else {
            console.error("La respuesta no es un array:", robotsData);
            setRobots([]); // Establecer robots como un array vacío si la respuesta no es válida
          }
        })
        .catch(err => {
          console.error("Error al obtener robots:", err);
          setRobots([]); // Establecer robots como un array vacío en caso de error
        });
    }
  }, [categoriaId]);

  // Manejar la actualización de múltiples estados
  const handleEstadoChange = async () => {
  const updates = Object.entries(selectedEstados); // [robotId, estado]

  if (updates.length === 0) {
    Swal.fire("Selecciona al menos un robot y un estado válido!");
    return;
  }

  try {
    const requests = updates.map(([robotId, estado]) =>
      api.put(
        `/robots/estado/${robotId}`,
        estado,
        { headers: { "Content-Type": "text/plain" } }
      )
    );

    await Promise.all(requests); // Espera que todas las solicitudes se completen

    // Actualizar los robots en el estado después de la actualización
    const robotsActualizados = robots.map((robot) => {
      const estadoSeleccionado = selectedEstados[robot.id];
      if (estadoSeleccionado) {
        return { ...robot, estados: { ...robot.estados, nombre: estadoSeleccionado } }; // Actualiza el estado del robot
      }
      return robot;
    });
    setRobots(robotsActualizados); // Establecer el nuevo estado de robots

    Swal.fire({
      title: "Estados actualizados correctamente!",
      icon: "success",
    });

  } catch (err) {
    console.error("Error al actualizar los estados:", err);
    Swal.fire({
      title: "Uups",
      text: "Error al actualizar los estados!",
      icon: "error",
    });
  }
};


  return (
    <>
      <Header />
      <h1>Área de Validación de Robots</h1>
      <div className="container-soli">
        <label>Seleccionar categoría: </label>
        <select onChange={(e) => setCategoriaId(e.target.value)} value={categoriaId}>
          <option value="">Selecciona una categoría</option>
          {/* Mostrar dinámicamente las categorías */}
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>

        {/* Tabla para mostrar los robots */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Peso</th>
              <th>Dimensiones</th>
              <th>Foto</th>
              <th>Competidor</th>
              <th>Categoria</th>
              <th>Estado</th>
              <th>Seleccionar Estado</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(robots) && robots.length > 0 ? (
              robots.map((robot) => (
                <tr key={robot.id}>
                  <td>{robot.id}</td>
                  <td>{robot.nombre}</td>
                  <td>{robot.peso}</td>
                  <td>{robot.dimensiones}</td>
                  <td>
                    <img
                      src={`${api.defaults.baseURL}/images/${robot.foto}`}
                      alt={robot.nombre}
                      width={75}
                      height={75}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleImageClick(`${api.defaults.baseURL}/images/${robot.foto}`)}
                    />
                  </td>
                  <td>{robot.competidores.nombre}</td>
                  <td>{robot.categorias.nombre}</td>
                  <td>{robot.estados.nombre}</td>
                  <td>
                    <select
                      value={selectedEstados[robot.id] || ""}
                      onChange={(e) =>
                        setSelectedEstados({
                          ...selectedEstados,
                          [robot.id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecciona un estado</option>
                      {estados.map((estado) => (
                        <option key={estado.id} value={estado.nombre}>
                          {estado.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No hay robots disponibles para esta categoría.</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Botón para guardar cambios */}
        <button className="btn-guardar-tra" onClick={handleEstadoChange}>Guardar Cambios</button>

      </div>
      {/* Modal para mostrar la imagen ampliada */}
      {modalImage && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content">
            <img src={modalImage} alt="Robot Ampliado" />
          </div>
        </div>
      )}
    </>
  );
};

export default VentanaSolicitudesRobot;
