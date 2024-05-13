import { z } from 'zod'


export const recoverSchema = z.object({
    email: z.string().email({
        message: "Porfavor ingresa un email valido",
    }),
});

export const recoverPasswordSchema = z.object({
    newPassword: z.string().min(6, {
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    confirmNewPassword: z.string().min(6, {
        message: "La confirmación debe tener al menos 6 caracteres."
    }),

}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"]
})

export const registerSchema = z.object({
    email: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).email({
        message: "Porfavor ingresa un email valido",
    }),
    password: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(6, {
        message: "Su contraseña necesita tener un largo minimo de 6."
    }),
    first_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    second_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    firstname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    secondname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    region: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
    comuna: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
    direccion: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    phone: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    // tipo: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    // establishment_authenticateds: z.number().array()
})