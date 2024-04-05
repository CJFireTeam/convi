
import { z } from 'zod';

export const suggestionSchema = z.object({
    TextoSugerencia:z.string().min(1,{message:'El campo no puede estar vacio.'}),
    establishment:z.number({ invalid_type_error: "Dato no valido",}).optional()
  });