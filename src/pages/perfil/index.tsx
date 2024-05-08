import { useUserStore } from "@/store/userStore";
import {
    UserIcon
} from "@heroicons/react/20/solid";

export default function Perfil() {

    const { user, role } = useUserStore()

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col sm:flex-row rounded-lg border border-gray-400 animate-fadein p-2">

                <div className="flex flex-col sm:w-1/2">
                    <span className="text-base font-semibold leading-6 text-gray-900">Rol:</span>
                    <span className="mb-2">{role.name}</span>
                    {role.name !== "Authenticated" && (
                        <>
                            <span className="text-base font-semibold leading-6 text-gray-900">Establecimiento:</span>
                            <span className="mb-2">{user.establishment.name}</span>
                        </>
                    )}
                    <span className="text-base font-semibold leading-6 text-gray-900">Nombre:</span>
                    <span className="mb-2">{user.firstname} {user.first_lastname}</span>
                    <span className="text-base font-semibold leading-6 text-gray-900">Correo:</span>
                    <span className="mb-2">{user.email}</span>
                </div>

                <div className="flex flex-col sm:w-1/2 sm:ml-20 items-center">
                    <UserIcon className="h-16 w-16 rounded-full bg-gray-50 mb-12 mt-3"></UserIcon>
                    <button className="flex w-full justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-2 sm:mb-0"
                    >
                        Cambiar Contraseña
                    </button>
                    <button className="flex w-full justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-2"
                    >
                        Editar Perfil
                    </button>
                </div>
            </div>
        </div>
    );
}
