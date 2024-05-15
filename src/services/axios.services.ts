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

export function api_cases({ createdBy, userId, page = 1 }: { createdBy: number, userId?: number, page?: number }) {
  let query = `?populate[created][populate][0]=role&populate[directed][populate][0]=role`
  query = query + `&filters[$or][0][created]=${createdBy}`
  if (userId) query = query + `&filters[$or][1][directed]=${userId}`
  query = query + `&pagination[page]=${page}&pagination[pageSize]=10`
  return api.get(`cases${query}`)
}

export function api_casesOne(id: string) {
  let query = `?populate[created][populate][0]=role&populate[directed][populate][0]=role`
  return api.get(`cases/${id}${query}`)
}

export function api_casesByFase({ createdBy, userId, fase }: { createdBy: number, userId?: number, fase: number }) {
  let query = `?populate[created][populate][0]=role&populate[directed][populate][0]=role`
  query = query + `&filters[$or][0][created]=${createdBy}`
  if (userId) query = query + `&filters[$or][1][directed]=${userId}`
  query = query + `&filters[fase][$eq]=${fase}`
  return api.get(`cases${query}`)
}
export function api_casesRoles() {
  return api.get(`role-lists?filters[forCases][$eq]=true`)
}
export function api_changePassword(data: any) {
  return api.post(`auth/change-password`, data)
}

export function api_updateUser(id: number, data: any) {
  return api.put(`users/${id}`, data)
}

export function api_updateCases(id: number, data: any) {
  return api.put(`cases/${id}`, { data: data })
}

export function api_getPositions({ Stablishment, page }: { Stablishment: string, page: number }) {
  let query = `?filters[$and][0][establishment][name][$eq]=${Stablishment}`
  query = query + `&pagination[page]=${page}&pagination[pageSize]=5`
  query = query + `&sort[0]=id:asc`
  return api.get(`positions${query}`)
}
export function api_postPositions(data: any) {
  return api.post(`positions`, { data: data })
}
export function api_putPositions(id: number, data: any) {
  return api.put(`positions/${id}`, { data: data })
}
export function api_getProfessionals({ position, Stablishment, page }: { position: string, Stablishment: string, page: number }) {
  let query = `?filters[$and][0][establishment][name][$eq]=${Stablishment}`  
  // query = query + `&pagination[page]=${page}&pagination[pageSize]=5`
  query = query + `?filters[$and][0][position][name][$eq]={position}`
  // query = query + `&sort[0]=id:asc`
  return api.get(`professionals${query}`)
}
export function api_postProfessionals(data: any) {
  return api.post(`professionals`, { data: data })
}