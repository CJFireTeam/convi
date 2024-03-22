
import axios from 'axios';
import Cookies from "js-cookie";

let token = Cookies.get("bearer");

const api2 = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_LOCAL_URL, // Cambia la URL base según tus necesidades
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
});

api2.interceptors.request.use(
  (config) => {
    const newToken = Cookies.get("bearer");
    if (newToken !== token) {
      token = newToken;
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api2.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 404) {
      console.log('Error 404 - Deslogueando...');
    }
    return Promise.reject(error);
  }
);

export function getRegiones() {
  return api2.get('regiones');
}
export function getComunas(comuna:string) {
    return api2.get('comunas?region='+ comuna);
  }
  

