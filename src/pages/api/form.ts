import axios,{AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface body  {
  location: number;
  formulary: number
}
// Define la función manejadora de la API con los tipos correctos para req y res
export default async function  handler (req: NextApiRequest, res: NextApiResponse) {
  // Verifica si el método de la solicitud es POST
  if (req.method === 'POST') {
    const  body:body = req.body 
    // Maneja la lógica de la solicitud POST aquí
    const stablishment  = await axios.get(`${backendUrl}establishments/${req.body.location}`,{headers:{"Content-Type":'application/json;charset=utf-8',Authorization: req.headers.authorization}})
    const stablishmentName  = (stablishment.data.data.attributes.name);

    const users = await axios.get(`${backendUrl}users?filters[$and][0][establishment_authenticateds][name][$eq]=${stablishmentName}&filters[$or][1][tipo][$ne]=otro`,{headers:{"Content-Type":'application/json;charset=utf-8',Authorization: req.headers.authorization}})
    for (const element of users.data) {
      try {
        console.log(element.id)
        const response = await axios.post(`${backendUrl}userforms`, { data:{formulario: body.formulary,user:element.id} },{headers:{"Content-Type":'application/json;charset=utf-8',Authorization: req.headers.authorization}});
        console.log(response)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error.response?.data)

        }
        return res.status(400).json({ error: `Error a procesar usuario ${element.id}` });
      }
    }
    res.status(200).json({ message: 'Solicitud POST recibida correctamente' });
  } else {
    // Para cualquier otro método, envía un 404
    res.status(404).json({ error: 'No se encontró la ruta' });
  }
}