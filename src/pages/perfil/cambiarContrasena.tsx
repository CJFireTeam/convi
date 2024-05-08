import { api_changePassword } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { changepassswordSchema } from "@/validations/changepasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import router from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";


type Inputs = {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
}




export default function CambiarContrasena() {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: zodResolver(changepassswordSchema),
    });
    const onSubmit = async (data: Inputs) => {
        if (data.password !== data.passwordConfirmation) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        try {

            const resp = await api_changePassword(data)
            toast.success('Contraseña cambiada');
            setTimeout(() => {
                router.push("/perfil");
            }, 3000);
        } catch (error) {
            console.log(error);
            if (error.response.data.error.message === 'The provided current password is invalid') {
                toast.error('Contraseña anterior invalida')
            } else {
                toast.error('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
            }
        }
    }


    return (<>

        <div className="flex flex-col items-center ">
            <div className="flex flex-col sm:flex-col rounded-lg shadow-2xl animate-fadein p-2 mb-4">
                <form onSubmit={handleSubmit(onSubmit)} >

                    <div className="flex flex-row mb-4" >
                        <span className="text-base font-semibold leading-6 text-gray-900 mr-3">Ingrese contraseña actual: </span>
                        <input
                            type="text"
                            id="currentPassword"
                            {...register('currentPassword')}
                            className="flexbg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Contraseña actual" required />
                    </div>
                    {errors.currentPassword?.message && (<p className="text-error text-sm mb-4">{errors.currentPassword.message}</p>)}

                    <div className="flex flex-row mb-4" >
                        <span className="text-base font-semibold leading-6 text-gray-900 mr-3">Ingrese nueva contraseña: </span>
                        <input type="password"
                            id="password"
                            {...register('password')}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Nueva contraseña" required />
                    </div>
                    {errors.password?.message && (<p className="text-error text-sm mb-4">{errors.password.message}</p>)}

                    <div className="flex flex-row mb-4" >
                        <span className="text-base font-semibold leading-6 text-gray-900 mr-2">Confirmar nueva contraseña: </span>
                        <input type="password"
                            id="passwordConfirmation"
                            {...register('passwordConfirmation')}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Repita la contraseña" required />
                    </div>
                    {errors.passwordConfirmation?.message && (<p className="text-error text-sm mb-4">{errors.passwordConfirmation.message}</p>)}

                    <div className=" flex flex-col item-center">
                        <button className="flex w-full justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-2 sm:mb-0"
                            type="submit"
                        >
                            Cambiar Contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>);
}