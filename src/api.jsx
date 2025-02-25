import axios from "axios";

const api = axios.create({
  baseURL: 
   "https://torneorobotech-dzawctb0axeggxe7.brazilsouth-01.azurewebsites.net", //URL api
});

// Interceptor para agregar el token en cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación (401 - Token inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Token expirado o inválido, cerrando sesión...");
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirige al login si el token expira
    }
    return Promise.reject(error);
  }
);

export default api;

