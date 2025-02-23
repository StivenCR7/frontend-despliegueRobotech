import api from "../api";

// Obtener todos los trabajadores
export const obtenerTrabajadores = async () => {
  return await api.get("/trabajadores/listar");
};

// Obtener un trabajador por ID
export const obtenerPorIdTrabajador = async (id) => {
  return await api.get(`/trabajadores/listar/${id}`);
};

// Obtener todos los roles
export const obtenerRoles = async () => {
  return await api.get("/trabajadores/roles");
};

// Agregar un nuevo trabajador
export const agregarTrabajador = async (nuevoTrabajador) => {
  return await api.post("/trabajadores/add", nuevoTrabajador);
};

// Actualizar Datos de contacto (solo trabajadores)
export const actualizarDatosContacto = async (id, datosActualizados) => {
  return await api.put(`/trabajadores/update-datos/${id}`, datosActualizados);
};
// Actualizar solo el rol de un trabajador (envía el idRol como número)
export const actualizarRol = async (idTrabajador, idRol) => {
  return await api.patch(`/trabajadores/updateRol/${idTrabajador}`, idRol, {
    headers: { 'Content-Type': 'application/json' },
  });
};


// Eliminar Trabajador
export const eliminarTrabajador = async (idTrabajador) => {
  return await api.delete(`/trabajadores/delete/${idTrabajador}`);
};
