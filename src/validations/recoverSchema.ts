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

export const registerSchema = z.object({
    email: z.string().email({
        message: "Porfavor ingresa un email valido",
    }),
    password: z.string().min(6,{
        message: "Su contraseña necesita tener un largo minimo de 6."
    }),
    first_lastname: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    second_lastname: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    firstname: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    secondname: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    tipo: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    region: z.string().min(3,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }).default(""),
    comuna: z.string().min(2,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }).default(""),
    direccion: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    establishment_authenticateds: z.number().array()
})