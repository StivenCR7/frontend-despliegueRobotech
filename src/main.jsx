import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/login';
import VentanaSolicitudes from './components/ventanaSolicitudes';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Trabajadores from './components/trabajadores';
import Inicioo from './components/Inicio';
import CrearEventos from './components/CrearEventos ';
import VentanaSolicitudesRobot from './components/ventanaSolicitudes_Robot'
import VentanaSolicitudesCompetidor from './components/ventanaSolicitudes_Competidor'
import Posiciones from './components/Posiciones';
import VentanaRepClub from './components/ventanaRepClub';

import NoticiasAdmin from './components/Noticias_Admin';
import Noticias from './components/Noticias';
import { AuthProvider } from "./services/AuthContextToken";
import PrivateRoute from './services/PrivateRoute';
import Ranking from './components/Ranking';
import VentanaTrabajador from './components/VentanaTrabajadores';
import Competencias from './components/Competencias';
import PosicionesInvi from './components/PosicionesInvi';

const App = () => {
  return (

    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Inicioo />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/Ranking" element={<Ranking />} />
        <Route path="/PosicionesInvi" element={<PosicionesInvi/>}/>
        <Route path="/VentanaTrabajador" element={<VentanaTrabajador/>}/>

        <Route element={<PrivateRoute allowedRoles={["Administrador"]} />}>
          <Route path="/trabajadores" element={<Trabajadores />} />
          <Route path="/noticiasadmin" element={<NoticiasAdmin />} />
          <Route path="/CrearEventos" element={<CrearEventos />} />

        </Route>
        <Route element={<PrivateRoute allowedRoles={["RepresentanteClub", "Administrador"]} />}>
          <Route path="/competencias/:torneoId/:categoriaId" element={<Competencias />} />
          <Route path="/ventanaClub" element={<VentanaRepClub />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["Verificador de Solicitudes", "Administrador"]} />}>
          <Route path="/ventanaSolicitudes/clubes" element={<VentanaSolicitudes />} />
          <Route path="/ventanaSolicitudes/competidores" element={<VentanaSolicitudesCompetidor />} />
          <Route path="/ventanaSolicitudes/robots" element={<VentanaSolicitudesRobot />} />

        </Route>
        <Route element={<PrivateRoute allowedRoles={["Gestor de resultados", "Administrador"]} />}>
          <Route path="/posiciones" element={<Posiciones />} />
        </Route>
        
      </Routes>
    </Router >
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AuthProvider>
  <App />
</AuthProvider>);