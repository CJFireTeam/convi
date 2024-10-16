import { api_getOneUser, api_role, api_updateUser } from "@/services/axios.services";
import { getComunas, getRegiones } from "@/services/local.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

interface IUser {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    second_lastname: string;
    first_lastname: string;
    firstname: string;
    secondname: string;
    tipo: string;
    direccion: string;
    region: string;
    comuna: string;
    phone: string;
    role: {
        id: number;
        name: string;
    }
}

interface IFormValue {
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    second_lastname: string;
    first_lastname: string;
    firstname: string;
    secondname: string;
    role: number;
    direccion: string;
    region: string;
    comuna: string;
    phone: string;
}

interface IRole {
    id: number;
    name: string;
}

export default function EditarUsuario() {
    const searchParams = useSearchParams()
    const search = searchParams.get("id")
    const userId = String(search)

    const [dataUser, setDataUser] = useState<IUser>();
    const [regionList, setRegionList] = useState<string[]>([]);
    const [comunaList, setComunaList] = useState<string[]>([]);
    const [roleList, setRoleList] = useState<IRole[]>([]);


    const EditUserSchema = z.object({
        firstname: z.string(),
        secondname: z.string(),
        first_lastname: z.string(),
        second_lastname: z.string(),
        username: z.string(),
        email: z.string(),
        role: z.number({ required_error: 'Campo requerido.' }),
        confirmed: z.boolean(),
        direccion: z.string(),
        region: z.string({ required_error: 'Campo requerido.' }),
        comuna: z.string({ required_error: 'Campo requerido.' }),
        phone: z.string(),
        blocked: z.boolean(),
    });

    const { register, watch, setValue, handleSubmit, formState: { errors }, control } = useForm<IFormValue>({
        resolver: zodResolver(EditUserSchema),
    });


    const regionWatch = watch("region")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await api_getOneUser(parseInt(userId))
                setDataUser(userData.data[0])
                const roleData = await api_role()
                const filteredRoles = roleData.data.roles.filter(
                    (role:IRole) => role.name === "Encargado de Convivencia Escolar" || role.name === "Profesor"
                )
                setRoleList(filteredRoles)
                const regionData = await getRegiones()
                setRegionList(regionData.data.data)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [userId])

    useEffect(() => {
        if (dataUser && dataUser.region) {
            handleChangeRegion(dataUser.region)
        }
    }, [dataUser])

    useEffect(() => {
        if (regionWatch) {
            handleChangeRegion(regionWatch)
        }
    }, [regionWatch])

    const handleChangeRegion = async (region: string) => {
        setValue("comuna", "")
        const comunas = await getComunas(region)
        setComunaList(comunas.data.data)
    }

    const onSubmit = async (data: IFormValue) => {

        try {
            // Transformar valores vacíos en undefined
            const transformedData = {
                ...data,
                region: data.region === "" ? undefined : data.region,
                comuna: data.comuna === "" ? undefined : data.comuna,
            }
            await api_updateUser(Number(userId), transformedData)
            toast.success('Perfil actualizado')
        } catch (error) {
            console.error(error)
            toast.error('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.')
        }
    }

    return (
        <>
            {!dataUser ? (
                <div className="grid md:grid-cols-12 gap-4 border rounded-md shadow-md p-4">
                    <div className="md:col-start-0 md:col-end-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-primary hover:text-green-700 cursor-pointer" onClick={() => { router.back() }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <div className="md:col-start-2 md:col-end-13 mx-auto my-auto">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid md:grid-cols-12 gap-4 border rounded-md shadow-md p-4">
                            <div className="md:col-start-0 md:col-end-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-primary hover:text-green-700 cursor-pointer" onClick={() => { router.back() }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div className="md:col-start-2 md:col-end-13">
                                <div className="grid md:grid-cols-4">
                                    {/* Campos de texto */}
                                    <div className="md:mr-4">
                                        <label htmlFor="nombre">Primer Nombre: </label>
                                        <input {...register('firstname')} type="text" className="input input-primary w-full" placeholder="Ingrese su primer nombre..." defaultValue={dataUser?.firstname} />
                                    </div>

                                    {/* Segundo Nombre */}
                                    <div className="md:mr-4">
                                        <label htmlFor="secondname">Segundo Nombre: </label>
                                        <input {...register('secondname')} type="text" className="input input-primary w-full" placeholder="Ingrese su segundo nombre..." defaultValue={dataUser?.secondname} />
                                    </div>

                                    {/* Apellido */}
                                    <div className="md:mr-4">
                                        <label htmlFor="apellido">Primer Apellido: </label>
                                        <input {...register('first_lastname')} type="text" className="input input-primary w-full" placeholder="Ingrese su primer apellido..." defaultValue={dataUser?.first_lastname} />
                                    </div>

                                    {/* Segundo Apellido */}
                                    <div className="md:mr-4">
                                        <label htmlFor="second_lastname">Segundo Apellido: </label>
                                        <input {...register('second_lastname')} type="text" className="input input-primary w-full" defaultValue={dataUser?.second_lastname} />
                                    </div>

                                    {/* username */}
                                    <div className="md:mr-4">
                                        <label htmlFor="username">Username: </label>
                                        <input {...register('username')} type="text" className="input input-primary w-full" defaultValue={dataUser?.username} />
                                    </div>

                                    {/* email */}
                                    <div className="md:mr-4">
                                        <label htmlFor="email">Correo electronico: </label>
                                        <input type="email" {...register('email')} className="input input-primary w-full" defaultValue={dataUser?.email} />
                                    </div>

                                    {/* Rol */}
                                    <div className="md:mr-4">
                                        <label htmlFor="role">Rol*: </label>
                                        <Controller
                                            name="role"
                                            control={control}
                                            defaultValue={dataUser.role.id}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="select select-primary w-full"
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                >
                                                    <option value="" disabled>Seleccione un rol</option>
                                                    {roleList.map((role) => (
                                                        <option key={role.id} value={role.id}>
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                    </div>


                                    {/* Confirmado */}
                                    <div className="md:mr-4 my-auto">
                                        <label className="inline-flex items-center">
                                            <span className="mr-2">Confirmado:</span>
                                            <input type="checkbox" {...register('confirmed')} className="toggle-checkbox checkbox-primary rounded-full" defaultChecked={dataUser?.confirmed} />
                                        </label>
                                    </div>

                                    {/* Dirección */}
                                    <div className="md:mr-4">
                                        <label htmlFor="direccion">Direccion:</label>
                                        <input type="text" {...register('direccion')} defaultValue={dataUser?.direccion} className="input input-primary w-full" />
                                    </div>

                                    {/* Región */}
                                    <div className="md:mr-4">
                                        <label htmlFor="region">Región*: </label>
                                        <Controller
                                            name="region"
                                            control={control}
                                            defaultValue={dataUser.region}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="select select-primary w-full"
                                                >
                                                    <option value="">Seleccione una región</option>
                                                    {regionList.map((region) => (
                                                        <option key={region} value={region}>
                                                            {region}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                        {errors.region?.message && (<p className="text-red-600 text-sm mt-1">{errors.region.message}</p>)}
                                    </div>

                                    {/* Comuna */}
                                    <div className="md:mr-4">
                                        <label htmlFor="comuna">Comuna*: </label>
                                        <Controller
                                            name="comuna"
                                            control={control}
                                            defaultValue={dataUser.comuna}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="select select-primary w-full"
                                                >
                                                    <option value="">Seleccione una comuna</option>
                                                    {comunaList.map((comuna) => (
                                                        <option key={comuna} value={comuna}>
                                                            {comuna}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                        {errors.comuna?.message && (<p className="text-red-600 text-sm mt-1">{errors.comuna.message}</p>)}
                                    </div>

                                    {/* Teléfono */}
                                    <div className="md:mr-4">
                                        <label htmlFor="phone">Telefono:</label>
                                        <input type="text" {...register('phone')} className="input input-primary w-full" defaultValue={dataUser?.phone} />
                                    </div>

                                    {/* Bloqueado */}
                                    <div className="md:mr-4 my-auto">
                                        <label className="inline-flex items-center">
                                            <span className="mr-2">Bloqueado:</span>
                                            <input type="checkbox" {...register('blocked')} className="toggle-checkbox checkbox-primary rounded-full" defaultChecked={dataUser?.blocked} />
                                        </label>
                                    </div>

                                    <div className="my-4 md:col-span-4">
                                        <button type="submit" className="btn btn-primary">
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </>
    )
}
