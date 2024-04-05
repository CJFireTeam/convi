import {z} from 'zod'


export const recoverSchema = z.object({
    email: z.string().email({
        message: "Porfavor ingresa un email valido",
    }),
});

export const recoverPasswordSchema = z.object({
    newPassword: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    confirmNewPassword: z.string().min(6,{
        message: "La confirmación debe tener al menos 6 caracteres."
    }),

}).refine(data => data.newPassword === data.confirmNewPassword,{
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"]
})