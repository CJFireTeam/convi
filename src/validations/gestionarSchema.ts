import { z } from 'zod';

export const gestionarSchema = z.object({
    inform: z.string({ required_error: "Seleccione al menos 1 opción", invalid_type_error: "Seleccione al menos 1 opción" }),
    denounce: z.array(z.string(), { required_error: "Seleccione al menos 1 opción", invalid_type_error: "Seleccione al menos 1 opción" }).min(1, { message: "Seleccione al menos 1 opción" }),
    derive: z.array(z.string(), { required_error: "Seleccione al menos 1 opción", invalid_type_error: "Seleccione al menos 1 opción" }).min(1, { message: "Seleccione al menos 1 opción" }),
});