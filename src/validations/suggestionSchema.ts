
import { z } from 'zod';

export const suggestionSchema = z.object({
  TextoSugerencia: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(10, { message: 'Debe tener almenos 10 caracteres.' }),
  colegio: z.number().optional()
});