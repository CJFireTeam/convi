import router, { useRouter } from "next/router";
import WarningAlert from "@/components/alerts/warningAlert";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateUserByAdminSchema } from "@/validations/createUserByAdminSchema";
import { getComunas, getRegiones } from "@/services/local.services";
import { api_role } from "@/services/axios.services";
import axios, { AxiosError } from "axios";
export interface IUser {
    username: string;
    email: string;
    role?: number;
    first_lastname: string;
    second_lastname: string;
    firstname: string;
    secondname: string;
    region: string;
    comuna: string;
    direccion: string;
    phone: string;
    password: string;
}

function generateRandomPassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 6; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

export default function CrearUsuario() {
    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<IUser>({
        resolver: zodResolver(CreateUserByAdminSchema),
        defaultValues: {

        }
    });

    const onSubmit = async (data: IUser) => {
        const id = toast.loading("Creando...");
    data.username = data.email
    data.password = generateRandomPassword()
    try {  
        console.log("data enviada al posss", data)
    //   await axios.post(
    //     process.env.NEXT_PUBLIC_BACKEND_URL + "auth/local/register",
    //     data
    //   );
    //   toast.update(id, {
    //     render: "Usuario creado correctamente",
    //     type: "success",
    //     isLoading: false,
    //     autoClose: 3000,
    //   });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          if (error.response.data.error.message)
            if (error.response.data.error.message === "Email or Username are already taken") toast.update(id, {
              render: "Error: El correo electronico Ya se encuentra en uso.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
              
            })
            router.push({ pathname: "/login" });
            
        }
      } else {
        toast.update(id, {
          render: "Ocurrió un error al crear la cuenta.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
    }
    function atrasButton() {
        router.push("/administrador");
    }
    const [regionList, setRegionList] = useState<string[]>([]);

    useEffect(() => {
        const Regiones = async () => {
            const data = await getRegiones();
            setRegionList(data.data.data);
        };
        Regiones();
    }, []);

    const regionWatch = watch("region");
    const [comunaList, setComunaList] = useState<string[]>([]);
    const handleChangeRegion = async (
        region: string
    ) => {
        setValue("comuna", "")
        const comunas = await getComunas(region);
        setComunaList(comunas.data.data);
    };
    useEffect(() => {
        if (!regionWatch || regionWatch.length === 0) return;
        handleChangeRegion(regionWatch)
    }, [regionWatch])

    const [roleList, setRoleList] = useState<string[]>([]);

    const getRoleList = async () => {
        const role = await api_role();
        setRoleList(role.data.data);
    }

    useEffect(()=>{
        getRoleList()
    },[])

    return (
        <>

        <div className="mb-4">
                    <button onClick={atrasButton}>
                        <ArrowLeftIcon className="h-8 w-8 text-primary "></ArrowLeftIcon>
                    </button>
                </div>
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">Crear Cuenta de Usuario</h2>
            <p className="text-gray-600 mb-6">Ingrese los detalles del nuevo usuario</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email", { setValueAs: (value) => value === "" ? undefined : value })}
                            //onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.email?.message && (<p className="text-error text-sm mb-4 text-center">{errors.email.message}</p>)}
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select {...register("role", { setValueAs: (value) => value === "" ? undefined : Number(value) })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6">
                                <option value={""}>Seleccione el rol del usuario</option>
                                {roleList.map((role: any) => (
                                    <option value={role.id} key={role.id}>
                                        {role.attributes.name}
                                    </option>
                                ))}
                            </select>
                        {errors.role?.message && (<p className="text-error text-sm mb-4 text-center">{errors.role.message}</p>)}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">Primer Nombre</label>
                        <input
                            id="firstname"
                            type="text"
                            {...register("firstname", { setValueAs: (value) => value === "" ? undefined : value })}
                            //onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.firstname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.firstname.message}</p>)}
                    </div>
                    <div>
                        <label htmlFor="secondname" className="block text-sm font-medium text-gray-700 mb-1">Segundo Nombre</label>
                        <input
                            id="secondname"
                            type="text"
                            {...register("secondname", { setValueAs: (value) => value === "" ? undefined : value })}
                            //onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.secondname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.secondname.message}</p>)}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="first_lastname" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                        <input
                            id="first_lastname"
                            type="text"
                            {...register("first_lastname", { setValueAs: (value) => value === "" ? undefined : value })}
                            //onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.first_lastname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.first_lastname.message}</p>)}
                    </div>
                    <div>
                        <label htmlFor="second_lastname" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                        <input
                            id="second_lastname"
                            type="text"
                            {...register("second_lastname", { setValueAs: (value) => value === "" ? undefined : value })}
                            //onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.second_lastname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.second_lastname.message}</p>)}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Región de Residencia</label>
                        <select {...register("region", { setValueAs: (value) => value === "" ? undefined : value })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6">
                                <option value={""}>Seleccione su region de residencia</option>
                                {regionList.map((region: string) => (
                                    <option value={region} key={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        {errors.region?.message && (<p className="text-error text-sm mb-4 text-center">{errors.region.message}</p>)}
                    </div>
                    <div>
                        <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">Comuna de Residencia</label>
                        <select {...register("comuna", { setValueAs: (value) => value === "" ? undefined : value })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6">
                                <option value={""}>Seleccione su comuna de residencia</option>
                                {comunaList.map((comuna: string) => (
                                    <option value={comuna} key={comuna}>
                                        {comuna}
                                    </option>
                                ))}
                            </select>
                        {errors.comuna?.message && (<p className="text-error text-sm mb-4 text-center">{errors.comuna.message}</p>)}
                    </div>
                </div>
                <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                        id="direccion"
                        type="text"
                        {...register("direccion", { setValueAs: (value) => value === "" ? undefined : value })}
                        //onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.direccion?.message && (<p className="text-error text-sm mb-4 text-center">{errors.direccion.message}</p>)}
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                        id="phone"
                        type="tel"
                        {...register("phone", { setValueAs: (value) => value === "" ? undefined : value })}
                        //onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.phone?.message && (<p className="text-error text-sm mb-4 text-center">{errors.phone.message}</p>)}
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Crear Usuario
                    </button>
                </div>
            </form>
        </div>
        </>
    );
}