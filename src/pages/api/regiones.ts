import type { NextApiRequest, NextApiResponse } from 'next'
import Json from '@/services/dpa/dpa.regiones.services.json'
type ResponseData = {
  data: string[]
}
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({ data: Json })
}