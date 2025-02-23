import React, { useState, useEffect } from 'react';
import Header from '../components/headeradmin';
import '../css/trabajadores.css';
import { obtenerTrabajadores, eliminarTrabajador, agregarTrabajador, actualizarRol, obtenerRoles } from "../services/TrabajadoresServices.jsx";

const Trabajadores = () => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [roles, setRoles] = useState([]); // Estado para almacenar los roles
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoTrabajador, setNuevoTrabajador] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        contrasena: '',
        rol: { id: '' },
    });
    const [cambiosRoles, setCambiosRoles] = useState({}); // Estado para almacenar los roles modificados temporalmente
    const [paginaActual, setPaginaActual] = useState(1); // Estado para la página actual
    const trabajadoresPorPagina = 20; // Definir cuántos trabajadores por página
    const [trabajadoresPagina, setTrabajadoresPagina] = useState([]);

    // Cargar trabajadores y roles al iniciar
    useEffect(() => {
        cargarTrabajadores();
        cargarRoles();
    }, []);

    // Cargar los trabajadores y roles
    const cargarTrabajadores = async () => {
        try {
            const response = await obtenerTrabajadores();
            const trabajadoresFiltrados = response.data.filter(
                trabajador => trabajador.rol?.nombre !== 'Administrador'
            );
            setTrabajadores(trabajadoresFiltrados);
            actualizarTrabajadoresPagina(trabajadoresFiltrados);
        } catch (error) {
            console.error('Error al obtener trabajadores:', error);
        }
    };

    // Cargar roles
    const cargarRoles = async () => {
        try {
            const response = await obtenerRoles();
            setRoles(response.data);
        } catch (error) {
            console.error('Error al obtener roles:', error);
        }
    };

    // Actualizar la lista de trabajadores de acuerdo con la página actual
    const actualizarTrabajadoresPagina = (trabajadores) => {
        const primerIndice = (paginaActual - 1) * trabajadoresPorPagina;
        const trabajadoresPaginaActual = trabajadores.slice(primerIndice, primerIndice + trabajadoresPorPagina);
        setTrabajadoresPagina(trabajadoresPaginaActual);
    };

    // Cambiar de página anterior
    const handlePaginaAnterior = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
            actualizarTrabajadoresPagina(trabajadores);
        }
    };

    // Cambiar de página siguiente
    const handlePaginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            setPaginaActual(paginaActual + 1);
            actualizarTrabajadoresPagina(trabajadores);
        }
    };

    // Función para manejar el cambio de página cuando se hace clic en un número
    const handlePaginaSeleccionada = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        actualizarTrabajadoresPagina(trabajadores);
    };

    // Calcular el total de páginas
    const totalPaginas = Math.ceil(trabajadores.length / trabajadoresPorPagina);

    // Función para eliminar un trabajador
    const handleEliminarTrabajador = async (idTrabajador) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este trabajador?')) {
            try {
                await eliminarTrabajador(idTrabajador);
                Swal.fire({
                    title: "Trabajador eliminado correctamente!",
                    icon: "success",
                });
                cargarTrabajadores(); // Recargar la lista de trabajadores
            } catch (error) {
                console.error('Error al eliminar trabajador:', error);
            }
        }
    };

    // Guardar los cambios de roles localmente
    const handleRolChange = (idTrabajador, idRol) => {
        setCambiosRoles({ ...cambiosRoles, [idTrabajador]: idRol });
    };

    // Guardar todos los roles modificados al servidor
    const handleGuardarCambios = async () => {
        try {
            const promesas = Object.entries(cambiosRoles).map(([idTrabajador, idRol]) =>
                actualizarRol(idTrabajador, idRol)
            );
            await Promise.all(promesas); // Ejecutar todas las actualizaciones en paralelo
            Swal.fire({
                title: "Roles actualizados correctamente!",
                icon: "success",
            });
            setCambiosRoles({}); // Limpiar cambios locales
            cargarTrabajadores(); // Actualizar la lista de trabajadores
        } catch (error) {
            console.error('Error al guardar cambios:', error);
        }
    };

    // Función para agregar un trabajador
    const handleAgregarTrabajador = async (e) => {
        e.preventDefault();
        try {
            await agregarTrabajador(nuevoTrabajador);
            Swal.fire({
                title: "Trabajador agregado correctamente!",
                icon: "success",
            });
            cerrarModal();
            cargarTrabajadores();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Uups...",
                    text: "Error al agregar trabajador!",
                });
            }
        }
    };

    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevoTrabajador({
            nombre: '',
            apellido: '',
            telefono: '',
            correo: '',
            contrasena: '',
            rol: { id: '' },
        });
    };

    return (
        <>
            <Header />
            <div className="boton-tra">
                <h1>Trabajadores</h1>
                <button className="btn-agregar-tra" onClick={abrirModal}>
                    Agregar Trabajador
                </button>
                <button className="btn-agregar-tra" onClick={handleGuardarCambios}>
                    Guardar Cambios
                </button>
            </div>

            <div className="container-tra">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th> </th>
                            <th> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {trabajadoresPagina.map((trabajador) => (
                            <tr key={trabajador.id}>
                                <td>{trabajador.nombre}</td>
                                <td>{trabajador.apellido}</td>
                                <td>{trabajador.telefono}</td>
                                <td>{trabajador.correo}</td>
                                <td>{trabajador.rol.nombre}</td>
                                <td>
                                    <select
                                        value={cambiosRoles[trabajador.id] || trabajador.rol?.id || ''}
                                        onChange={(e) => handleRolChange(trabajador.id, e.target.value)}
                                    >
                                        <option value="">Seleccionar Rol</option>
                                        {roles.map((rol) => (
                                            <option key={rol.id} value={rol.id}>
                                                {rol.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="btn-eliminar-tra"
                                        onClick={() => handleEliminarTrabajador(trabajador.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

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
            </div>

            {mostrarModal && (
                <div className="modal-overlay-tra" onClick={(e) => {
                    if (e.target.classList.contains('modal-overlay-tra')) {
                        cerrarModal();
                    }
                }}>
                    <div className="modal-content-tra">
                        <h2>Agregar Trabajador</h2>
                        <form id="form-tra" onSubmit={handleAgregarTrabajador}>
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={nuevoTrabajador.nombre}
                                onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, nombre: e.target.value })}
                                pattern="[A-Za-z\s]+"
                                onInvalid={(e) => e.target.setCustomValidity('El nombre solo puede contener letras.')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Apellido"
                                value={nuevoTrabajador.apellido}
                                onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, apellido: e.target.value })}
                                pattern="[A-Za-z\s]+"
                                onInvalid={(e) => e.target.setCustomValidity('El apellido solo puede contener letras.')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Teléfono"
                                value={nuevoTrabajador.telefono}
                                onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, telefono: e.target.value })}
                                pattern="9\d{8}"
                                onInvalid={(e) => e.target.setCustomValidity('El teléfono debe empezar con "9" y contener 9 dígitos.')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Correo"
                                value={nuevoTrabajador.correo}
                                onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, correo: e.target.value })}
                                pattern="^[^\s@]+@gmail\.com$"
                                onInvalid={(e) => e.target.setCustomValidity('Ingrese correo válido de Gmail (example@gmail.com).')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                required
                            />

                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={nuevoTrabajador.contrasena}
                                onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, contrasena: e.target.value })}
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                                onInvalid={(e) => e.target.setCustomValidity('La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un símbolo.')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                required
                            />
                            <select
                                value={nuevoTrabajador.rol.id}
                                onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, rol: { id: e.target.value } })}
                                required
                            >
                                <option value="">Seleccionar Rol</option>
                                {roles.map((rol) => (
                                    <option key={rol.id} value={rol.id}>
                                        {rol.nombre}
                                    </option>
                                ))}
                            </select>
                            <button type="submit-tra" id="submit-tra">Agregar Trabajador</button>
                         
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Trabajadores;