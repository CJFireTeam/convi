import {
    ChevronDownIcon,
    MagnifyingGlassIcon,
    UserIcon,
} from "@heroicons/react/20/solid";

export default function Perfil() {
    return (
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm ">
        <div className="flex justify-center items-center flex-col">
            <UserIcon className="h-16 w-16 rounded-full bg-gray-50"></UserIcon>
            <span> Leonardo Retamal</span>
            <span> Correo: Leonardo.Retamal.morales</span>

            <button className={`flex w-full justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              >
              Cambiar Contraseña
              </button>
        </div>
        </div>
        

    )
}
