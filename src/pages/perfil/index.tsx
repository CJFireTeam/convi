import { useUserStore } from "@/store/userStore";
import {
    UserIcon
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

export default function Perfil() {

    const { user, role } = useUserStore()

    const { push } = useRouter();

    function cambiarContraseñaClick() {
        push("/perfil/cambiarcontrasena");
    }

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col sm:flex-row rounded-lg border shadow-lg animate-fadein p-4 md:p-10 lg:p-10">

                <div className="flex flex-col sm:w-1/2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Perfil de Usuario</h2>
                    <div className="mb-6">
                        <span className="text-lg font-semibold text-gray-700">Rol:</span>
                        <span className="text-base text-gray-900 ml-2">{role.name}</span>
                    </div>
                    {role.name !== "Authenticated" && (
                        <div className="mb-6">
                            <span className="text-lg font-semibold text-gray-700">Establecimiento:</span>
                            <span className="text-base text-gray-900 ml-2">{user.establishment.name}</span>
                        </div>
                    )}
                    <div className="mb-6">
                        <span className="text-lg font-semibold text-gray-700">Nombre:</span>
                        <span className="text-base text-gray-900 ml-2">{user.firstname} {user.first_lastname}</span>
                    </div>
                    <div className="mb-6">
                        <span className="text-lg font-semibold text-gray-700">Correo:</span>
                        <span className="text-base text-gray-900 ml-2">{user.email}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:w-1/2 sm:ml-20 items-center">
                    <UserIcon className="h-20 w-20 rounded-full text-primary mb-8 mt-3"></UserIcon> {/* Aumenta el tamaño de la imagen */}
                    <button className="w-full rounded-md px-4 py-2 text-base font-semibold bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 mb-4 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={cambiarContraseñaClick}
                    >
                        Cambiar Contraseña
                    </button>
                    <button className="w-full rounded-md px-4 py-2 text-base font-semibold bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Editar Perfil
                    </button>
                </div>
            </div>
        </div>
    );

}
