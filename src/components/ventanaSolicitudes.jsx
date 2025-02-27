import React, { useState, useEffect } from "react";
import api from "../api";
import Header from '../components/headervalidacion';
import '../css/validacion.css';

const VentanaSolicitudes = () => {
  const [estados, setEstados] = useState([]); // Lista de estados
  const [clubs, setClubs] = useState([]); // Lista de clubes
  const [selectedEstados, setSelectedEstados] = useState({}); // Estados seleccionados por club
  const [paginaActual, setPaginaActual] = useState(1); // Página actual de la tabla
  const [clubsPagina, setClubsPagina] = useState([]); // Trabajadores a mostrar en la página actual
  const clubesPorPagina = 10; // Cantidad de clubes por página

  // Obtener lista de estados desde el backend
  useEffect(() => {
    api.get("/clubes/estados")
      .then(response => setEstados(response.data))
      .catch(err => console.error("Error al obtener estados:", err));
  }, []);

  // Obtener lista de clubes desde el backend
  useEffect(() => {
    api.get("/clubes")
      .then(response => {
        setClubs(response.data);
        actualizarClubesPagina(response.data);
      })
      .catch(err => console.error("Error al obtener clubes:", err));
  }, []);

  // Actualizar la lista de clubes para la página actual
  const actualizarClubesPagina = (clubs) => {
    const primerIndice = (paginaActual - 1) * clubesPorPagina;
    const clubsPaginaActual = clubs.slice(primerIndice, primerIndice + clubesPorPagina);
    setClubsPagina(clubsPaginaActual);
  };

  // Cambiar de página anterior
  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
      actualizarClubesPagina(clubs);
    }
  };

  // Cambiar de página siguiente
  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
      actualizarClubesPagina(clubs);
    }
  };

  // Función para manejar el cambio de página cuando se hace clic en un número
  const handlePaginaSeleccionada = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    actualizarClubesPagina(clubs);
  };

  // Calcular el total de páginas
  const totalPaginas = Math.ceil(clubs.length / clubesPorPagina);

  // Manejar la actualización de múltiples estados
  // Actualizar la lista de clubes para la página actual cuando `clubs` cambie
  useEffect(() => {
    actualizarClubesPagina(clubs);
  }, [clubs, paginaActual]); // Se ejecuta cada vez que `clubs` o `paginaActual` cambian
  
  // Manejar la actualización de múltiples estados
  const handleEstadoChange = async () => {
  const updates = Object.entries(selectedEstados); // [clubId, estado]

  if (updates.length === 0) {
    alert("Selecciona al menos un club y un estado válido.");
    return;
  }

  try {
    const requests = updates.map(([clubId, estado]) =>
      api.put(
        `/clubes/estado/${clubId}`,
        estado,
        { headers: { "Content-Type": "text/plain" } }
      )
    );

    await Promise.all(requests); // Espera que todas las solicitudes se completen

    // 🔥 Obtener nuevamente los clubes desde el backend para asegurar datos frescos
    const response = await api.get("/clubes");
    setClubs(response.data); // Actualiza los clubes con datos recientes

    // 🔥 Actualizar la lista de clubes para la página actual
    actualizarClubesPagina(response.data);

    Swal.fire({
      title: "Estados actualizados correctamente!",
      icon: "success",
    });

  } catch (err) {
    Swal.fire({
      title: "Uups",
      text: "Error al actualizar los estados!",
      icon: "error",
    });
    console.error("Error al actualizar los estados:", err);
  }
};


  return (
    <>
      <Header />
      <h1>Área de Validación de Clubes</h1>
      <div className="container-soli">
        {/* Tabla para mostrar los clubes */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre Club</th>
              <th>Nombre Representante</th>
              <th>Número Contacto</th>
              <th>Dirección Club</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Seleccionar Estado</th>
            </tr>
          </thead>
          <tbody>
            {clubsPagina.map((club) => (
              <tr key={club.id}>
                <td>{club.id}</td>
                <td>{club.nombre}</td>
                <td>{club.nombre_representante}</td>
                <td>{club.telefono}</td>
                <td>{club.direccion}</td>
                <td>{club.correo}</td>
                <td>{club.estados.nombre}</td>
                <td>
                  <select
                    value={selectedEstados[club.id] || ""}
                    onChange={(e) =>
                      setSelectedEstados({
                        ...selectedEstados,
                        [club.id]: e.target.value,
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
        <button className="btn-paginacion" onClick={handlePaginaAnterior} disabled={paginaActual === 1}>
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

        <button className="btn-paginacion" onClick={handlePaginaSiguiente} disabled={paginaActual === totalPaginas}>
          Siguiente
        </button>
      </div>
    </>
  );
};

export default VentanaSolicitudes;
