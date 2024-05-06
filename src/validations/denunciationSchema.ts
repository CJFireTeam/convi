import { z } from 'zod';

export const denunciationSchema = z.object({
    first_case: z.number().optional(),
    derived: z.string().optional(),
    created: z.number(),
    nameSchoolar: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(5, { message: 'Debe tener almenos 5 caracteres.' }),
    course: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    teacher: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(5, { message: 'Debe tener almenos 5 caracteres.' }),
    date: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    details: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(10, { message: 'Debe tener almenos 10 caracteres.' }),
    measures: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(10, { message: 'Debe tener almenos 10 caracteres.' }),

});