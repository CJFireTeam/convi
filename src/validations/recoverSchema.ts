import {z} from 'zod'

export const recoverSchema = z.object({
    email: z.string().email({
        message: "Porfavor ingresa un email valido",
    }),

});