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

export function api_allEstablishments() {
  let query = `?populate[users][populate][role]=*`
  return api.get(`establishments${query}`)
}

export function api_allEstablishmentStatusTrue() {
  let query = `?filters[$and][0][status][$eq]=true`
  query += `&populate[users][populate][role]=*`
  return api.get(`establishments${query}`)
}

export function api_allEstablishmentStatusFalse() {
  let query = `?filters[$and][0][status][$eq]=false`
  return api.get(`establishments${query}`)
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

export function api_CasesOnes(id: number) {
  let query = `?filters[$and][0][id][$eq]=${id}`;
  query += `&populate[created][populate][establishment_courses][populate][LeadTeacher]=*`;
  return api.get(`cases${query}`);
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


export function api_postSendMeeting(data: any) {
  console.log('Sending meeting data:', data);
  return api.post(`meetings`, data);
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

export function api_getOneUserDoc(userId: number) {
  let query = `?filters[$and][0][id][$eq]=${userId}`
  query += `&populate[role]=*`
  query += `&populate[establishment]=*`
  query += `&populate[establishment_authenticateds]=*`
  query += `&populate[courses][populate][establishment_courses]=*`
  query += `&populate[documents][populate]=*`
  query += `&populate[user_destiny]=*`
  query += `&populate[documentsList]=*`
  return api.get(`users${query}`)
}

export function api_getUsersEstablishment(escuelaId: number) {
  let query = `?filters[$and][0][establishment][id][$eq]=${escuelaId}`
  query += `&filters[$and][1][role][name][$ne]=admin`
  return api.get(`users${query}`)
}

export function api_getAllAdministrador() {
  let query = `?filters[$and][0][role][name][$eq]=admin`
  query += `&populate=*`
  return api.get(`users${query}`)
}
export function api_getActiveAdministrador() {
  let query = `?filters[$and][0][role][name][$eq]=admin`
  query += `&filters[$and][1][blocked][$eq]=false`
  query += `&filters[$and][2][confirmed][$eq]=true`
  query += `&populate=*`
  return api.get(`users${query}`)
}

export function api_getpendientAdministrador() {
  let query = `?filters[$and][0][role][name][$eq]=admin`
  query += `&filters[$and][1][blocked][$eq]=false`
  query += `&filters[$and][2][confirmed][$eq]=false`
  query += `&populate=*`
  return api.get(`users${query}`)
}

export function api_getBlockAdministrador() {
  let query = `?filters[$and][0][role][name][$eq]=admin`
  query += `&filters[$and][1][blocked][$eq]=true`
  query += `&filters[$and][2][confirmed][$eq]=true`
  query += `&populate=*`
  return api.get(`users${query}`)
}



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
  query = query + `&filters[$and][2][establishment_authenticateds][id][$eq]=${escuelaId}`
  return api.get(`users${query}`)
}
export function api_GetUsersAlumnosEstablishment(escuelaId: number, courses?: number) {
  let query = `?filters[$and][0][role][name][$eq]=Authenticated`
  query = query + `&filters[$and][1][tipo][$eq]=alumno`
  query = query + `&filters[$and][2][establishment_authenticateds][id][$eq]=${escuelaId}`
  if (courses) query += `&filters[$and][3][establishment_courses][id][$eq]=${courses}`;
  return api.get(`users${query}`)
}
export function api_getUsersEstablishment2(escuelaId: number, courses?: number) {
  let query = `?filters[$and][0][role][name][$ne]=admin`
  query = query + `&filters[$or][1][establishment][id][$eq]=${escuelaId}`
  query = query + `&filters[$or][2][establishment_authenticateds][id][$eq]=${escuelaId}`
  if (courses) query += `&filters[$and][3][establishment_courses][id][$eq]=${courses}&populate=*`;
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

export function api_getAllUserByEstablishment(establishment: number, userId: number) {
  let query = `?filters[$or][0][establishment][id][$eq]=${establishment}`
  query += `&filters[$or][1][establishment_authenticateds][id][$eq]=${establishment}`
  query += `&filters[$and][2][role][name][$ne]=admin`
  query += `&filters[$and][3][id][$ne]=${userId}`
  query += `&populate=*`
  return api.get(`users${query}`)
}


export function api_getAllUsersAutByEstablishment({ establishment, page }: { establishment: string, page: number }) {
  let query = `?filters[$and][0][establishment_authenticateds][name][$eq]=${establishment}`
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

export function api_getDocumentUserCreated(escuelaId: number, userId: number, page: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${escuelaId}`;
  query += `&filters[$and][1][userId][id][$eq]=${userId}`;
  query += `&filters[$and][2][Eliminado][$eq]=false`;
  query += `&populate=*`;
  query += `&sort=createdAt:desc`;
  query += `&pagination[page]=${page}&pagination[pageSize]=3`;
  return api.get(`documents${query}`);
}

export function api_putDocument(documentId: number, isDeleted: boolean) {
  // Define la URL del documento que deseas actualizar
  const url = `documents/${documentId}`; // Asegúrate de que la URL sea correcta
  // Realiza la solicitud PUT para actualizar el campo 'Eliminado'
  return api.put(url, { data: { Eliminado: isDeleted } });
}

export function api_getOneCourse(course: number) {
  return api.get(`courses/${course}?populate=*`)
}

export function api_getDocumentsByEstablishment2(establishmentId: number, userId: number, page: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${establishmentId}`
  query += `&filters[$and][1][establishment_course][id][$null]=true`
  query += `&filters[$and][2][user_destiny][id][$null]=true`
  query += `&filters[$and][3][Eliminado][$eq]=false`
  query += `&filters[$and][4][userId][id][$ne]=${userId}`
  query += `&populate=*&sort=createdAt:desc`
  query += `&pagination[page]=${page}&pagination[pageSize]=3`
  return api.get(`documents${query}`)
}

export function api_getDocumentsByCourse2(establishmentId: number, courseId: number, userId: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${establishmentId}`
  query += `&filters[$and][1][establishment_course][id]=${courseId}`
  query += `&filters[$and][2][user_destiny][id][$null]=true`
  query += `&filters[$and][3][Eliminado][$eq]=false`
  query += `&filters[$and][4][userId][id][$ne]=${userId}`
  query += `&populate=*&sort=createdAt:desc`
  return api.get(`documents${query}`)
}

export function api_getDocumentsByEstablishment(establishmentId: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${establishmentId}`
  query += `&filters[$and][1][establishment_course][id][$null][$eq]=true`
  query += `&filters[$and][3][user_destiny][id][$null]=true`
  query += `&filters[$and][4][Eliminado][$eq]=false`
  query += `&populate=*&sort=createdAt:desc`
  return api.get(`documents${query}`)
}

export function api_getDocumentsByCourse(courseId: number, establishmentId: number) {
  let query = `?filters[$and][0][establishment_course][id][$eq]=${courseId}`
  query += `&filters[$and][1][establishmentId][id][$eq]=${establishmentId}`
  query += `&filters[$and][2][user_destiny][id][$null]=true`
  query += `&filters[$and][3][Eliminado][$eq]=false`
  query += `&populate=*&sort=createdAt:desc`
  return api.get(`documents${query}`)
}


export function api_getDocumentsByUserDestinity(establishmentId: number, userId: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${establishmentId}`
  query += `&filters[$and][1][user_destiny][id][$eq]=${userId}`
  query += `&filters[$and][2][establishment_course][id][$null]=true`
  query += `&filters[$and][3][Eliminado][$eq]=false`
  query += `&populate=*&sort=createdAt:desc`
  return api.get(`documents${query}`)
}

/* export function api_getDocumentsByCourse2(establishmentId: number, courseGrade: string, courseLetter: string, userId: number, page: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${establishmentId}`
  query += `&filters[$and][1][userId][id][$ne]=${userId}`
  query += `&filters[$and][2][courseId][grade][$eq]=${courseGrade}`
  query += `&filters[$and][3][courseId][letter][$eq]=${courseLetter}`
  query += `&filters[$and][5][Eliminado][$eq]=false`
  query += `&populate=*`
  query += `&pagination[page]=${page}&pagination[pageSize]=1`
  return api.get(`documents${query}`)
} */



export function api_getDocumentsByUserDestinity2(establishmentId: number, userId: number, page: number) {
  let query = `?filters[$and][0][establishmentId][id][$eq]=${establishmentId}`
  query += `&filters[$and][1][user_destiny][id][$eq]=${userId}`
  query += `&filters[$and][2][establishment_course][id][$null]=true`
  query += `&filters[$and][4][Eliminado][$eq]=false`
  query += `&populate=*&sort=createdAt:desc`
  query += `&pagination[page]=${page}&pagination[pageSize]=3`
  return api.get(`documents${query}`)
}

export function api_getEstablishmentCoursesByUser(establishment: number, userId: number, page: number) {
  let query = `?filter[$and][0][establishment][id][$eq]=${establishment}`;
  query += `&filters[$and][1][users][id][$eq]=${userId}`;
  query += `&filters[$and][2][Eliminado][$eq]=false`; // Filtrar cursos donde Eliminado es false
  query += `&populate=*`;
  query += `&sort=createdAt:desc`; // Ordenar por el campo 'createdAt' en orden descendente
  query += `&pagination[page]=${page}&pagination[pageSize]=12`;

  return api.get(`establishment-courses${query}`);
}
export function api_getCoursesByUserSinPag(establishment: number, userId: number) {
  let query = `?filter[$and][0][establishment][id][$eq]=${establishment}`;
  query += `&filters[$and][1][users][id][$eq]=${userId}`;
  query += `&filters[$and][2][establishment_courses][Eliminado][$eq]=false`; // Filtrar cursos donde Eliminado es false
  query += `&populate[0]=establishment_courses`; // Poblar establishment_courses
  query += `&populate[establishment_courses][filters][Eliminado][$eq]=false`; // Aplica el filtro Eliminado=false
  query += `&sort=createdAt:desc`; // Ordenar por el campo 'createdAt' en orden descendente
  return api.get(`courses${query}`);
}

export function api_postEstablishmentCourses(data: any) {
  return api.post(`establishment-courses`, { data: data })
};

export function api_postEstablishment(data: any) {
  return api.post(`establishments`, { data: data })
}

export function api_putEstatusEstablishment(establishmentId: number, status: boolean) {
  const url = `establishments/${establishmentId}`;
  return api.put(url, { status: status })
}
export function api_putBlockedUser(userId: number, blocked: boolean) {
  const url = `users/${userId}`;
  return api.put(url, { blocked: blocked })
}

export function api_putEstablishment(establishmentId: number, data: { name: string; address: string; Phone: string; Comuna: string; }) {
  const url = `establishments/${establishmentId}`;
  return api.put(url, { data: data });
}

export function api_putStatusEstablishment(establishmentId: number, status: boolean) {
  const url = `establishments/${establishmentId}`;
  return api.put(url, { data: { status: status } })
}


export function api_getEstablishmentCourses(establishment: number, page: number) {
  let query = `?filter[$and][0][establishment][id][$eq]=${establishment}`
  query += `&filters[$and][1][Eliminado][$eq]=false`
  query += `&populate=*`;
  query += `&sort=Grade:asc`; // Ordenar por el campo 'Letter' en orden ascendente
  query += `&pagination[page]=${page}&pagination[pageSize]=6`
  return api.get(`establishment-courses${query}`)
}
export function api_getEstablishmentCoursesSinPag(establishment: number) {
  let query = `?filter[$and][0][establishment][id][$eq]=${establishment}`
  query += `&filters[$and][1][Eliminado][$eq]=false`
  query += `&populate=*`;
  query += `&sort=Grade:asc`; // Ordenar por el campo 'Letter' en orden ascendente
  return api.get(`establishment-courses${query}`)
}

export function api_putEliminadoEstablishmenCourses(CourseEsId: number, isDeleted: boolean) {
  // Define la URL del documento que deseas actualizar
  const url = `establishment-courses/${CourseEsId}`; // Asegúrate de que la URL sea correcta
  // Realiza la solicitud PUT para actualizar el campo 'Eliminado'
  return api.put(url, { data: { Eliminado: isDeleted } });
}

export function api_deleteCourse(CourseEsId: number) {
  return api.delete(`courses/${CourseEsId}`)
}

export function api_putEstablishmentCourses(userId: number, data: any) {
  // Define la URL del documento que deseas actualizar
  const url = `users/${userId}`; // Asegúrate de que la URL sea correcta
  // Realiza la solicitud PUT para actualizar el campo 'Eliminado'
  return api.put(url, data);
}

export function api_putUserAdmin(userId: number, data: any) {
  // Define la URL del documento que deseas actualizar
  const url = `users/${userId}`; // Asegúrate de que la URL sea correcta
  // Realiza la solicitud PUT para actualizar el campo 'Eliminado'
  return api.put(url, data);
}

export function api_putEstablishmenCourses(CourseEsId: number, LeadTeacher: number) {
  // Define la URL del documento que deseas actualizar
  const url = `establishment-courses/${CourseEsId}`; // Asegúrate de que la URL sea correcta
  // Realiza la solicitud PUT para actualizar el campo 'Eliminado'
  return api.put(url, { data: { LeadTeacher: LeadTeacher } });
}

export function api_putUserEstablishmen(userId: number, id: number) {
  const url = `users/${userId}`;
  return api.put(url, { establishment: id });
}
