import {z} from 'zod'


export const editProfileSchema = z.object({
    first_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    second_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    firstname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    secondname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    region: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
    comuna: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
    direccion: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    phone: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),

})


  