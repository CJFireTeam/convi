import axios from 'axios';
import Cookies from "js-cookie";
let token = Cookies.get("bearer")
const api2 = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_LOCAL_URL || process.env.VERCEL_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token, // Aquí puedes agregar tu header personalizado, como Authorization
  },
});
api2.interceptors.request.use(
  (config) => {
    const newToken = Cookies.get("bearer");
    config.headers.Authorization = 'Bearer ' + newToken;

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
      // Aquí ejecutas la acción de deslogueo
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
 
export function assignFormUsers(location:number,formulary:number) {
  return api2.post('form',{location:location,formulary:formulary});
}

