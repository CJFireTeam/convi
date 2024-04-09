
import { z } from 'zod';

export const suggestionSchema = z.object({
    TextoSugerencia:z.string().min(10,{message:'Debe tener almenos 10 caracteres.'}),
    colegio:z.number({ invalid_type_error: "Dato no valido",}).optional()
  });