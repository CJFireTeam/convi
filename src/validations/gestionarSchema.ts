import { z } from 'zod';

export const gestionarSchema = z.object({
    options: z.array(z.string(), { required_error: "Seleccione al menos 1 opción para complementar la denuncia", invalid_type_error: "Seleccione al menos 1 opción para complementar la denuncia" }).min(1, { message: "Seleccione al menos 1 opción para complementar la denuncia" }),
    // fase: z.number(),
});