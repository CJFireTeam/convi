import axios from 'axios';
import { format } from 'date-fns';
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

export function api_postUser(data: any) {
  return api.post(`professionals`, { data: data })
}
export function api_me() {
  return api.get('users/me?populate=*');
}
export function api_role() {
  return api.get(`users-permissions/roles`)
}

export function api_usersByRole(role: number, establishment: number) {
  let query = `populate[users][filters][role]=${role}`
  return api.get(`establishments/${establishment}?${query}`)
}

export function api_establishmentByComuna(comuna: string) {
  return api.get("establishments?fields[0]=name&filters[Comuna][$eq]=" + comuna)
}
export function api_allEstablishment() {
  return api.get(`establishments`)
}
export function api_surveys({ createdBy, userId, page = 1 }: { createdBy: number, userId?: number, page?: number }) {
  let query = `?populate[creador][populate][0]=role`
  query = query + `&filters[creador]=${createdBy}`
  query = query + `&pagination[page]=${page}&pagination[pageSize]=10`
  query = query + `&sort[0]=FechaInicio%3Adesc`
  return api.get(`formularios${query}`)
}
export function api_getOneSurvey({ surveyId }: { surveyId?: number }) {
  let query = `?populate=formulario_pregutas`
  return api.get(`formularios/${surveyId}${query}`)
}

export function api_cases({ createdBy, userId, page = 1 }: { createdBy: number, userId?: number, page?: number }) {
  let query = `?populate[created][populate][0]=role&populate[directed][populate][0]=role`
  query = query + `&filters[$or][0][created]=${createdBy}`
  if (userId) query = query + `&filters[$or][1][directed]=${userId}`
  query = query + `&pagination[page]=${page}&pagination[pageSize]=10`
  query = query + `&sort[0]=createdAt%3Adesc`
  return api.get(`cases${query}`)
}

export function api_complaint({ caseId }: { caseId: number }) {
  // let query = `?populate=*`;
  let query = `?filters[first_case]=${caseId}`

  return api.get(`complaints${query}`)
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
export function api_updateComplaint(id: number, data: any) {
  return api.put(`complaints/${id}`, { data: data })
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
  query = query + `&filters[$and][0][position][name][$eq]=${position}`
  // query = query + `&sort[0]=id:asc`
  return api.get(`professionals${query}`)
}
export function api_postProfessionals(data: any) {
  return api.post(`professionals`, { data: data })
}

export function api_putProfessionals(id: number, data: any) {
  return api.put(`professionals/${id}`, data);
}


export function api_postSurveys(data: any) {
  return api.post(`formularios`, { data: data })
}
export function api_postQuestions(data: any) {
  return api.post(`preguntas`, { data: data })
}

/* export function api_getQuestions(user: string, populate?: boolean) {
  let query = `?filters[$and][0][isCompleted][$eq]=${false}&filters[$and][1][user][username][$eq]=${user}&sort=createdAt:desc`
  if (populate) {
    query = query + '&populate=*'
  }

  return api.get(`userforms${query}`);
} */

export function api_getQuestions(user: string, populate?: boolean) {
  // Obtener la fecha actual en formato ISO sin hora
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  let query = `?filters[$and][0][isCompleted][$eq]=${false}&filters[$and][1][user][username][$eq]=${user}&filters[$and][2][formulario][FechaFin][$gte]=${currentDate}&sort=createdAt:desc`
  if (populate) {
    query = query + '&populate=*'
  }

  return api.get(`userforms${query}`);
}


export function api_getQuestionsCompleted(formId: number) {
  let query = `?filters[$and][0][isCompleted][$eq]=${true}&filters[$and][1][formulario][id][$eq]=${formId}&populate=*`
  return api.get(`userforms${query}`);
}
export function api_getQuestionsNotCompleted(formId: number) {
  let query = `?filters[$and][0][isCompleted][$eq]=${false}&filters[$and][1][formulario][id][$eq]=${formId}&populate=*`
  return api.get(`userforms${query}`);
}

export function api_getQuestionsByForm({ formId }: { formId: number }) {
  let query = `?filters[formulario][id][$eq]=${formId}`
  return api.get(`preguntas${query}`)
}

export function api_postResponseForm(data: any) {
  return api.post(`user-question-forms`, { data: data })
}

export function api_updateUserForm(id: number, data: any) {
  return api.put(`userforms/${id}`, { data: data });
}

export function api_getQuestionResponses({ questionId }: { questionId: number }) {
  let query = `?populate=respuesta,userform.user&filters[pregunta][id][$eq]=${questionId}`
  return api.get(`user-question-forms${query}`)
}


export function api_postSendMeeting(data: { CreationDate: string, RoomName: string, RoomUrl: string, Establishment: number, CreatorUser: number }) {
  return api.post(`meetings`, data)
}

export function api_postCase(caseData: {
  directed?: number,
  establishment: number,
  created?: number,
  fase: number,
  derived: boolean,
  story: string,
  measures: string
}) {
  return api.post(`cases`, { data: caseData })
}

export function api_getOneUser(userId: number) {
  let query = `?filters[$and][0][id][$eq]=${userId}`
  query += `&populate=*`
  return api.get(`users${query}`)
}


/* export function api_getUsersEstablishment(escuelaId:number){
  let query = `?filters[$and][0][role][name][$eq]=Profesor&filters[$and][1][establishment][id][$eq]=${escuelaId}`
  query = query + `&filters[$and][0][role][name][$eq]=Encargado de Convivencia Escolar&filters[$and][1][establishment][id][$eq]=${escuelaId}`
  query = query + `&filters[$and][0][role][name][$eq]=Authenticated&filters[$and][1][tipo][$eq]=alumno[$and][2][establishment_authenticateds][id][$eq]=${escuelaId}`
  return api.get(`users${query}`)
} */

export function api_getUsersProfeEstablishment(escuelaId: number) {
  let query = `?filters[$and][0][role][name][$eq]=Profesor&filters[$and][1][establishment][id][$eq]=${escuelaId}`
  return api.get(`users${query}`)
}

export function api_getUsersEncargadoEstablishment(escuelaId: number) {
  let query = `?filters[$and][0][role][name][$eq]=Encargado de Convivencia Escolar&filters[$and][1][establishment][id][$eq]=${escuelaId}`
  return api.get(`users${query}`)
}

export function api_GetUsersApoderadosEstablishment(escuelaId: number) {
  let query = `?filters[$and][0][role][name][$eq]=Authenticated`
  query = query + `&filters[$and][1][tipo][$eq]=apoderado`
  query = query + `&filters[$and][2][establishment][id][$eq]=${escuelaId}`
  return api.get(`users${query}`)
}
export function api_GetUsersAlumnosEstablishment(escuelaId: number) {
  let query = `?filters[$and][0][role][name][$eq]=Authenticated`
  query = query + `&filters[$and][1][tipo][$eq]=alumno`
  query = query + `&filters[$and][2][establishment][id][$eq]=${escuelaId}`
  return api.get(`users${query}`)
}

export function api_getAllUsersOtrosByEstablishment({ establishment, page }: { establishment: string, page: number }) {
  let query = `?filters[$and][0][establishment][name][$eq]=${establishment}`
  query += `&filters[$or][0][role][name][$eq]=Encargado de Convivencia Escolar`
  query += `&filters[$or][1][role][name][$eq]=Profesor`
  query += `&populate[role][fields][0]=name`
  query += `&sort[0]=id:asc`
  return api.get(`users${query}`)
}

export function api_getAllUsersAutByEstablishment({ establishment, page }: { establishment: string, page: number }) {
  let query = `?filters[$and][0][establishment][name][$eq]=${establishment}`
  query += `&filters[$or][0][tipo][$eq]=alumno`
  query += `&filters[$or][1][tipo][$eq]=apoderado`
  query += `&sort[0]=tipo:asc`
  return api.get(`users${query}`)
}

export function api_postCourses(data: any) {
  return api.post(`courses`, { data: data })
};

export function api_updateCourses(id: number, data: any) {
  return api.put(`courses/${id}`, { data: data })
}

export function api_postDocument(data: any) {
  return api.post(`documents`, { data: data })
}

export function api_uploadFiles(formData: FormData) {
  return api.post('upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function api_getAllDocumentbyEstablishment(escuelaId: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${escuelaId}`
  query += `&filters[$and][1][Eliminado][$eq]=false`
  query += `&populate=*`
  return api.get(`documents${query}`)
}

