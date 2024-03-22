import type { NextApiRequest, NextApiResponse } from 'next'
import Json from '@/services/dpa/dpa.comunas.services.json'
type ResponseData = {
  data?: string[]
  error?: string;
}
type RegionData = {
    [region: string]: string[];
  };
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
  ) {
    const { region } = req.query as { region: string }; // Obtener el valor de la query 'region'
    if (!region) {
      res.status(400).json({ error: 'La región es requerida en la consulta.' });
    } else {
      const JsonData: RegionData = Json;
      const comunas = JsonData[region];
      if (!comunas) {
        res.status(404).json({ error: 'La región especificada no existe.' });
      } else {
        res.status(200).json({ data: comunas });
      }
    }
  }
