import axios from 'axios';
import Cookies from "js-cookie";
let token = Cookies.get("bearer")
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token, // Aquí puedes agregar tu header personalizado, como Authorization
  },
});
api.interceptors.request.use(
  (config) => {
    const newToken = Cookies.get("bearer");
    config.headers.Authorization = 'Bearer ' + newToken;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 404) {
      // Aquí ejecutas la acción de deslogueo
      console.log('Error 404 - Deslogueando...');
    }
    return Promise.reject(error);
  }
);

export function api_me() {
  return api.get('users/me?populate=*');
}
export function api_usersByRole(role: number,establishment:number) {
  let query = `filters[id][$eq]=${establishment}`
  query = query + `&populate[users][populate][1]=role&filters[users][role][id]=${role}`
  return api.get(`establishments?${query}`)
}

export function api_establishmentByComuna(comuna: string) {
  return api.get("establishments?fields[0]=name&filters[Comuna][$eq]=" +comuna)
}
  //FALTA AGREGAR EL LUGAR
export function api_cases(createdBy: number) {
  let query = `cases?populate=directed`
  query = query + `&filters[created]=${createdBy}`
  return api.get(query)
}

export function api_casesRoles() {
  return api.get(`role-lists?filters[forCases][$eq]=true`)
}
