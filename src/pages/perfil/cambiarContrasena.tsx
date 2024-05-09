import { api_changePassword } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { changepassswordSchema } from "@/validations/changepasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, isAxiosError } from "axios";
import router from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

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
            if (isAxiosError(error) && error.response?.data?.error?.message === 'The provided current password is invalid') {
                toast.error('Contraseña anterior invalida')
            } else {
                toast.error('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
            }
        }
    }

    function atrasBoton() {
        router.push("/perfil");
    }


    return (<>

        <div className="flex flex-col items-center">
            <div className="flex flex-col rounded-lg border shadow-2xl animate-fadein mb-4 p-10">
                <div className="mb-4">
                    <button onClick={atrasBoton}>
                        <ArrowLeftIcon className="h-8 w-8 text-primary "></ArrowLeftIcon>
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} >

                    <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
                        <div className="text-left ">
                            <span className="text-base font-semibold leading-6 text-gray-900">Ingrese contraseña actual:</span>
                        </div>
                        <input
                            type="text"
                            id="currentPassword"
                            {...register('currentPassword')}
                            className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Contraseña actual" required />
                    </div>
                    {errors.currentPassword?.message && (<p className="text-error text-sm mb-4">{errors.currentPassword.message}</p>)}

                    <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
                        <div className="text-left ">
                            <span className="text-base font-semibold leading-6 text-gray-900">Ingrese nueva contraseña:</span>
                        </div>
                        <input type="password"
                            id="password"
                            {...register('password')}
                            className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Nueva contraseña" required />
                    </div>
                    {errors.password?.message && (<p className="text-error text-sm mb-4">{errors.password.message}</p>)}

                    <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
                        <div className="text-left">
                            <span className="text-base font-semibold leading-6 text-gray-900">Confirmar nueva contraseña:</span>
                        </div>
                        <input type="password"
                            id="passwordConfirmation"
                            {...register('passwordConfirmation')}
                            className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Repita la contraseña" required />
                    </div>
                    {errors.passwordConfirmation?.message && (<p className="text-error text-sm mb-4">{errors.passwordConfirmation.message}</p>)}

                    <div className="flex flex-col item-center">
                        <button className="flex w-full justify-center text-white hover:brightness-90 rounded-md px-3 py-1.5 text-sm font-semibold bg-primary"
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