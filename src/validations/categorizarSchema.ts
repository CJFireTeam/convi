import {z} from 'zod';

export const categorizarSchema = z.object({
    category: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    fase: z.number(),
});