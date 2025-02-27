import React, { useState, useEffect } from "react";
import api from "../api";
import Header from './headervalidacion';
import '../css/validacion.css';

const VentanaSolicitudesCompetidor = () => {
  const [competidores, setCompetidores] = useState([]); // Lista de competidores
  const [estados, setEstados] = useState([]); // Lista de estados
  const [selectedEstados, setSelectedEstados] = useState({}); // Estados seleccionados por competidor
  const [paginaActual, setPaginaActual] = useState(1); // Página actual de la tabla
  const [competidoresPagina, setCompetidoresPagina] = useState([]); // Competidores a mostrar en la página actual
  const competidoresPorPagina = 5; // Cantidad de competidores por página

  // Obtener lista de competidores desde el backend
  useEffect(() => {
    api.get("/competidores/listar")
      .then(response => {
        setCompetidores(response.data);
        actualizarCompetidoresPagina(response.data);
      })
      .catch(err => console.error("Error al obtener competidores:", err));
  }, []);

  // Obtener lista de estados desde el backend
  useEffect(() => {
    api.get("/competidores/estados")
      .then(response => setEstados(response.data))
      .catch(err => console.error("Error al obtener estados:", err));
  }, []);

  // Actualizar la lista de competidores para la página actual
  const actualizarCompetidoresPagina = (competidores) => {
  const primerIndice = (paginaActual - 1) * competidoresPorPagina;
  const competidoresPaginaActual = competidores.slice(primerIndice, primerIndice + competidoresPorPagina);
  setCompetidoresPagina(competidoresPaginaActual);
};

  // Cambiar de página anterior
  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
      actualizarCompetidoresPagina(competidores);
    }
  };

  // Cambiar de página siguiente
  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
      actualizarCompetidoresPagina(competidores);
    }
  };

  // Función para manejar el cambio de página cuando se hace clic en un número
  const handlePaginaSeleccionada = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    actualizarCompetidoresPagina(competidores);
  };

  // Calcular el total de páginas
  const totalPaginas = Math.ceil(competidores.length / competidoresPorPagina);
  // useEffect para actualizar la página correctamente y evitar la recarga
  useEffect(() => {
    actualizarCompetidoresPagina(competidores);
  }, [competidores, paginaActual]);
  
  // Manejar la actualización de múltiples estados
const handleEstadoChange = async () => {
  const updates = Object.entries(selectedEstados); // [competidorId, estado]

  if (updates.length === 0) {
    Swal.fire("Selecciona al menos un competidor y un estado válido!");
    return;
  }

  try {
    const requests = updates.map(([competidorId, estado]) =>
      api.put(`/competidores/estado/${competidorId}`, estado, {
        headers: { "Content-Type": "text/plain" },
      })
    );

    await Promise.all(requests); // Espera que todas las solicitudes se completen

    // Nueva solicitud GET para obtener la lista actualizada desde el backend
    const response = await api.get("/competidores/listar");
    setCompetidores(response.data);

    // Limpia los estados seleccionados después de la actualización
    setSelectedEstados({});

    Swal.fire({
      title: "Estados actualizados correctamente!",
      icon: "success",
    });

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error al actualizar los estados!",
    });
    console.error("Error al actualizar los estados:", err);
  }
};

  return (
    <>
      <Header />
      <h1>Área de Validación de Competidores</h1>
      <div className="container-soli">
        {/* Tabla para mostrar los competidores */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Alias</th>
              <th>Edad</th>
              <th>Correo</th>
              <th>Club</th>
              <th>Estado</th>
              <th>Seleccionar Estado</th>
            </tr>
          </thead>
          <tbody>
            {competidoresPagina.map((competidor) => (
              <tr key={competidor.id}>
                <td>{competidor.id}</td>
                <td>{competidor.nombre}</td>
                <td>{competidor.apellido}</td>
                <td>{competidor.dni}</td>
                <td>{competidor.alias}</td>
                <td>{competidor.edad}</td>
                <td>{competidor.correo}</td>
                <td>{competidor.clubes ? competidor.clubes.nombre : "Sin club"}</td>
                <td>{competidor.estados.nombre}</td>
                <td>
                  <select
                    value={selectedEstados[competidor.id] || ""}
                    onChange={(e) =>
                      setSelectedEstados({
                        ...selectedEstados,
                        [competidor.id]: e.target.value,
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
            ))}
          </tbody>
        </table>
      </div>
      {/* Botón para guardar cambios */}
      <button className="btn-guardar-tra" onClick={handleEstadoChange}>Guardar Cambios</button>

      {/* Paginación */}
      <div className="paginacion">
        <button className='btn-paginacion' onClick={handlePaginaAnterior} disabled={paginaActual === 1}>
          Anterior
        </button>

        {/* Botones de paginación */}
        {[...Array(totalPaginas)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePaginaSeleccionada(index + 1)}
            className={paginaActual === index + 1 ? 'pagina-activa btn-editar-torneos' : 'btn-editar-torneos'}
          >
            {index + 1}
          </button>
        ))}

        <button className='btn-paginacion' onClick={handlePaginaSiguiente} disabled={paginaActual === totalPaginas}>
          Siguiente
        </button>
      </div>
    </>
  );
};

export default VentanaSolicitudesCompetidor;
