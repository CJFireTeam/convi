import { useUserStore } from "@/store/userStore";
import {
    UserIcon
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

enum UserTypes {
    "apoderado" = "Apoderado",
    "alumno" = "Alumno",
    "otro" = "",
}
export default function Perfil() {

    const { user, role } = useUserStore()

    const { push } = useRouter();

    function cambiarContraseñaClick() {
        push("/perfil/cambiarContrasena");
    }
    function editarPerfilClick() {
        push("/perfil/editar");
    }

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col sm:flex-row rounded-lg border shadow-lg animate-fadein p-4 md:p-10 lg:p-10">

                <div className="flex flex-col sm:w-1/2">
                    <span className="text-base font-semibold leading-6 text-gray-900">Rol:</span>
                    <span className="mb-2">
                    { role.name === "Authenticated" && user.tipo ? UserTypes[user.tipo] : role.name
                    }</span>
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
                    {role.name === "Authenticated" && <>                    
                        { user.tipo === "apoderado"  && <span className="mb-2"><button className="rounded-md  py-1.5 text-sm font-semibold  hover:brightness-90 mb-2 sm:mb-0">Mis establecimientos</button></span>}
                        { user.tipo === "alumno"  && 
                        <>
                            <span className="text-base font-semibold leading-6 text-gray-900">Establecimiento</span>
                            <span className="mb-2">{user.establishment_authenticateds[0].name}</span>

                        </>}
                        </>
                    }
                </div>

                <div className="flex flex-col sm:w-1/2 sm:ml-20 items-center">
                    <UserIcon className="h-16 w-16 rounded-full  text-primary mb-12 mt-3"></UserIcon>
                    <button className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 bg-primary text-white hover:brightness-90 mb-2 sm:mb-0"
                    onClick={cambiarContraseñaClick}
                    >
                        Cambiar Contraseña
                    </button>
                    <button className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 bg-primary text-white hover:brightness-90 mb-2 sm:mb-0 mt-2"
                    onClick={editarPerfilClick}
                    >
                        Actualizar Información
                    </button>
                </div>
            </div>
        </div>
    );
}
