import {z} from 'zod'


export const changepassswordSchema = z.object({
    currentPassword: z.string({required_error:"campo invalido", invalid_type_error:"campo invalido"
    }),  
    password: z.string().min(6,{
        message: "La nueva contraseña debe tener al menos 6 caracteres."
    }),
    passwordConfirmation: z.string().min(6,{
        message: "La confirmación debe tener al menos 6 caracteres."
    }),

})


  