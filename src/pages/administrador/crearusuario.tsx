import router, { useRouter } from "next/router";
import WarningAlert from "@/components/alerts/warningAlert";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateUserByAdminSchema } from "@/validations/createUserByAdminSchema";
import { getComunas, getRegiones } from "@/services/local.services";
import { api_allEstablishment, api_role, api_updateUser } from "@/services/axios.services";
import axios, { AxiosError } from "axios";
export interface IFormValue {
    username: string;
    email: string;
    first_lastname: string;
    second_lastname: string;
    firstname: string;
    secondname: string;
    region: string;
    comuna: string;
    direccion: string;
    phone: string;
    password: string;
    tipo: string;
    role: number;
    establishment: number;
    canUploadDoc: boolean;
    region_establishment: string;
    comuna_establishment: string;
}
interface IRole {
    id: number;
    name: string
}

interface IEstablishment {
    id: number;
    attributes: {
        name: string;
        comuna: string;
    };
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
    const [regionList, setRegionList] = useState<string[]>([]);
    const [comunaList, setComunaList] = useState<string[]>([]);
    const [regionEstablishmentList, setRegionEstablishmentList] = useState<string[]>([]);
    const [comunaEstablishmentList, setComunaEstablishmentList] = useState<string[]>([]);
    const [establishmentList, setEstablishmentList] = useState<IEstablishment[]>([]);
    const [regionEstablecimiento, setRegionEstablecimiento] = useState<string>("");
    const [comunaEstablecimiento, setComunaEstablecimiento] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const fetchRegiones = async () => {
        try {
            const regionData = await getRegiones();
            setRegionList(regionData.data.data);
        } catch (error) {
            console.error("Error fetching regiones:", error);
        }
    };

    const fetchComunas = async (region: string) => {
        try {
            const comunaData = await getComunas(region);
            setComunaList(comunaData.data.data);
        } catch (error) {
            console.error("Error fetching comunas:", error);
        }
    };

    const fetchRegionesEstablecimiento = async () => {
        try {
            const regionData = await getRegiones();
            setRegionEstablishmentList(regionData.data.data);
        } catch (error) {
            console.error("Error fetching regiones del establecimiento:", error);
        }
    };

    const fetchComunasEstablecimiento = async (region: string) => {
        try {
            const comunaData = await getComunas(region);
            setComunaEstablishmentList(comunaData.data.data);
        } catch (error) {
            console.error("Error fetching comunas del establecimiento:", error);
        }
    };

    useEffect(() => {
        fetchRegiones();
        fetchRegionesEstablecimiento();
    }, []);

    const { register, watch, setValue, handleSubmit, formState: { errors }, control } = useForm<IFormValue>({
        resolver: zodResolver(CreateUserByAdminSchema),
        defaultValues: {

        }
    });
    

    const onSubmit = async (data: IFormValue) => {
        const id = toast.loading("Creando...");

        const transformedData = {
            ...data,
            username: data.email,
            password: generateRandomPassword(),
            tipo: "otro",
            canUploadDoc: false
        };
        try {
            console.log("data enviada al posss", transformedData)
            const response = await axios.post(
                process.env.NEXT_PUBLIC_BACKEND_URL + "auth/local/register",
                transformedData
            );
            const updateRoleUser = {
                role: data.role
            }
            const userId = response.data.user.id;
            await api_updateUser(Number(userId), updateRoleUser);

            const emailResponse = await axios.post(
                process.env.NEXT_PUBLIC_BACKEND_URL + "send-password-email",
                {
                    email: data.email,
                    password: transformedData.password
                }
            );
            toast.update(id, {
                render: "Usuario creado correctamente",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
            router.push("/administrador")
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

    const [roleList, setRoleList] = useState<IRole[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roleData = await api_role()
                const filteredRoles = roleData.data.roles.filter(
                    (role: IRole) => role.name === "Encargado de Convivencia Escolar" || role.name === "Profesor"
                )
                setRoleList(filteredRoles)
                const regionData = await getRegiones()
                setRegionList(regionData.data.data)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [])

    return (
        <>

            <div className="mb-4">
                <button onClick={atrasButton}>
                    <ArrowLeftIcon className="h-8 w-8 text-primary "></ArrowLeftIcon>
                </button>
            </div>
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-primary">
                <h2 className="text-2xl font-bold mb-2 text-center">Crear Cuenta de Usuario</h2>
                <p className="text-gray-600 mb-6 text-center">Ingrese los detalles del nuevo usuario</p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <p className="text-black">Información personal:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                            <input
                                id="email"
                                type="email"
                                {...register("email", { setValueAs: (value) => value === "" ? undefined : value })}
                                //onChange={handleInputChange}
                                className="w-full input input-primary bg-white"
                            />
                            {errors.email?.message && (<p className="text-error text-sm mb-4 text-center">{errors.email.message}</p>)}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono*</label>
                            <input
                                id="phone"
                                type="tel"
                                {...register("phone", { setValueAs: (value) => value === "" ? undefined : value })}
                                //onChange={handleInputChange}
                                className="w-full input input-primary bg-white"
                            />
                            {errors.phone?.message && (<p className="text-error text-sm mb-4 text-center">{errors.phone.message}</p>)}
                        </div>

                        <div>
                            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">Primer Nombre*</label>
                            <input
                                id="firstname"
                                type="text"
                                {...register("firstname", { setValueAs: (value) => value === "" ? undefined : value })}
                                //onChange={handleInputChange}
                                className="w-full input input-primary bg-white"
                            />
                            {errors.firstname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.firstname.message}</p>)}
                        </div>
                        <div>
                            <label htmlFor="secondname" className="block text-sm font-medium text-gray-700 mb-1">Segundo Nombre*</label>
                            <input
                                id="secondname"
                                type="text"
                                {...register("secondname", { setValueAs: (value) => value === "" ? undefined : value })}
                                //onChange={handleInputChange}
                                className="w-full input input-primary bg-white"
                            />
                            {errors.secondname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.secondname.message}</p>)}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="first_lastname" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno*</label>
                            <input
                                id="first_lastname"
                                type="text"
                                {...register("first_lastname", { setValueAs: (value) => value === "" ? undefined : value })}
                                //onChange={handleInputChange}
                                className="w-full input input-primary bg-white"
                            />
                            {errors.first_lastname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.first_lastname.message}</p>)}
                        </div>
                        <div>
                            <label htmlFor="second_lastname" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno*</label>
                            <input
                                id="second_lastname"
                                type="text"
                                {...register("second_lastname", { setValueAs: (value) => value === "" ? undefined : value })}
                                //onChange={handleInputChange}
                                className="w-full input input-primary bg-white"
                            />
                            {errors.second_lastname?.message && (<p className="text-error text-sm mb-4 text-center">{errors.second_lastname.message}</p>)}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Región de Residencia*</label>
                            <select {...register("region", { setValueAs: (value) => value === "" ? undefined : value })} className="w-full select select-primary bg-white">
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
                            <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">Comuna de Residencia*</label>
                            <select {...register("comuna", { setValueAs: (value) => value === "" ? undefined : value })} className="w-full select select-primary bg-white">
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
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección*</label>
                            <input
                                id="direccion"
                                type="text"
                                {...register("direccion", { setValueAs: (value) => value === "" ? undefined : value })}
                                //onChange={handleInputChange}
                                className="w-full input input-primary bg-white"
                            />
                            {errors.direccion?.message && (<p className="text-error text-sm mb-4 text-center">{errors.direccion.message}</p>)}
                        </div>
                    </div>
                    <p className="text-black">Información laboral:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="establishment" className="block text-sm font-medium text-gray-700 mb-1">Establecimiento*</label>
                            <select {...register("establishment", { setValueAs: (value) => value === "" ? undefined : Number(value) })} className="w-full select select-primary bg-white">
                                <option value={""}>Seleccione el establecimiento</option>
                                {establishmentList.map((establishment: IEstablishment) => (
                                    <option value={establishment.id} key={establishment.id}>
                                        {establishment.attributes.name}
                                    </option>
                                ))}
                            </select>
                            {errors.establishment?.message && (<p className="text-error text-sm mb-4 text-center">{errors.establishment.message}</p>)}
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol*</label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="w-full select select-primary bg-white"
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    >
                                        <option value="">Seleccione un rol</option>
                                        {roleList.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.role?.message && (<p className="text-error text-sm mb-4 text-center">{errors.role.message}</p>)}
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-primary text-white font-medium rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Crear Usuario
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}