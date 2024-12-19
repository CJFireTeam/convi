import {z} from 'zod'


export const CreateUserByAdminSchema = z.object({
    email: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).email({
        message: "Porfavor ingresa un email valido",
    }),
    role: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo invalido" }),
    establishment: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo invalido" }),
    first_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    second_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    firstname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    secondname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    region: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
    comuna: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
    direccion: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    phone: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
})


  