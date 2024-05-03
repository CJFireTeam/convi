
import { z } from 'zod';

export const suggestionSchema = z.object({
  suggestion: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(10, { message: 'Debe tener almenos 10 caracteres.' }),
  establishment: z.string().optional(),
  created: z.number()
});