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
export function api_usersByRole(role: number, establishment: number) {
  let query = `populate[users][filters][role]=${role}`
  return api.get(`establishments/${establishment}?${query}`)
}

export function api_establishmentByComuna(comuna: string) {
  return api.get("establishments?fields[0]=name&filters[Comuna][$eq]=" + comuna)
}
  //FALTA AGREGAR EL LUGAR
export function api_cases({createdBy,userId}:{createdBy: number,userId?:number}) {
  let query = `?populate[created][populate][0]=role&populate[directed][populate][0]=role`
  query = query + `&filters[$or][0][created]=${createdBy}`
  if (userId) query = query + `&filters[$or][1][directed]=${userId}`
  return api.get(`cases${query}`)
}

export function api_casesRoles() {
  return api.get(`role-lists?filters[forCases][$eq]=true`)
}
export function api_changePassword(data:any) {
  return api.post(`auth/change-password`,data)
}