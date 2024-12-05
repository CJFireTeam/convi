import { api_putUserEstablishmen } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import {
    UserIcon
} from "@heroicons/react/20/solid";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

enum UserTypes {
    "apoderado" = "Apoderado",
    "alumno" = "Alumno",
    "otro" = "",
    "admin" = "Administrador de establecimiento"
}
export default function Perfil() {

    const { user, role, setUser } = useUserStore()

    const { push } = useRouter();

    function cambiarContraseñaClick() {
        push("/perfil/cambiarContrasena");
    }
    function editarPerfilClick() {
        push("/perfil/editar");
    }

    const [loading, setLoading] = useState(false);
    const handleClickUpdate = async (userId: number, id: number) => {
        try {
            setLoading(true);
            const response = await api_putUserEstablishmen(userId, id);

            // Busca el establecimiento actualizado
            const updatedEstablishment = user.establishment_authenticateds.find(e => e.id === id);

            // Verifica si se encontró el establecimiento
            if (updatedEstablishment) {
                // Actualiza el estado del usuario solo si se encontró el establecimiento
                setUser({ ...user, establishment: updatedEstablishment });
                toast.success('Colegio principal actualizado con éxito.');
            } else {
                // Maneja el caso en que no se encontró el establecimiento
                toast.error('No se pudo encontrar el establecimiento actualizado.');
            }
        } catch (error) {
            console.log(error);
            toast.error('Ha ocurrido un error inesperado.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Mi perfil</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <div className="flex flex-col mx-auto xl:w-1/2 sm:flex-row rounded-lg border shadow-lg animate-fadein p-4 md:p-10 lg:p-10">
                <div className="flex w-full flex-col">
                    <span className="text-base font-semibold leading-6 text-gray-900">Rol:</span>
                    <span className="mb-2">
                        {role.name === "Authenticated" && user.tipo ? UserTypes[user.tipo] : role.name
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
                        {user.tipo === "alumno" &&
                            <>
                                <span className="text-base font-semibold leading-6 text-gray-900">Establecimiento:</span>
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


            {role.name === "Authenticated" && <>
                {user.tipo === "apoderado" &&
                    <>
                        <div className="border rounded-lg shadow-lg animate-fadein p-4 mt-3 lg:w-3/4 mx-auto">
                            <div className="grid grid-cols-1 gap-2">
                                <div className="border-b-2 border-primary">
                                    <p className="font-bold text-lg m-2">Establecimiento primario:</p>
                                    <p className="font-semibold m-2">{user.establishment?.name ? user.establishment.name : 'Sin establecimiento primario'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="">
                                    <p className="font-bold text-lg m-2">Establecimientos:</p>
                                    <p className="text-gray-400 m-2">Click para cambiar establecimiento primario.</p>
                                    {user.establishment_authenticateds.length > 0 ? (<>
                                        <div className="grid md:grid-cols-4 gap-2 m-2" >
                                            {user.establishment_authenticateds.map((e, index) => (
                                                <button
                                                    className="w-full h-auto p-2 btn btn-primary btn-outline"
                                                    key={index}
                                                    onClick={() => handleClickUpdate(user.id, e.id)}
                                                    disabled={loading}
                                                >
                                                    {!loading ? e.name : 'cargando...'}

                                                </button>

                                            ))}
                                        </div>
                                    </>) : 'Sin establecimientos'}

                                </div>
                            </div>
                        </div>
                    </>}
            </>
            }

        </>
    );
}
