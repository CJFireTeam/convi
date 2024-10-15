import { api_getOneUser } from "@/services/axios.services";
import { getComunas, getRegiones } from "@/services/local.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
    tipo: string;
    direccion: string;
    region: string;
    comuna: string;
    phone: string;
}

export default function EditarUsuario() {
    const searchParams = useSearchParams();
    const search = searchParams.get("id");
    const userId = String(search);

    const [dataUser, setDataUser] = useState<IUser>()

    const getUser = async () => {
        try {
            const response = await api_getOneUser(parseInt(userId));
            setDataUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        getUser();
    }, [search]);

    const [regionList, setRegionList] = useState<string[]>([]);
    useEffect(() => {
        const Regiones = async () => {
            const data = await getRegiones();
            setRegionList(data.data.data);
        };
        Regiones();
    }, []);

    const EditUserSchema = z.object({
        firstname: z.string(),
        secondname: z.string(),
        first_lastname: z.string(),
        second_lastname: z.string(),
        username: z.string(),
        email: z.string(),
        tipo: z.string(),
        confirmed: z.boolean(),
        direccion: z.string(),
        region: z.string(),
        comuna: z.string(),
        phone: z.string(),
        blocked: z.boolean(),
    });

    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<IFormValue>({
        resolver: zodResolver(EditUserSchema),
    });

    const regionE = watch('region');
    const [comunaList, setComunaList] = useState<string[]>([]);
    const getComuna = async (region: string) => {
        if (region) {
            try {
                const comunas = await getComunas(region);
                setComunaList(comunas.data.data);
            } catch (error) {
                console.error('Error fetching comunas:', error);
            }
        }
    };

    useEffect(() => {
        if (dataUser?.region) {
            getComuna(dataUser.region);
        }
    }, [dataUser]);

    useEffect(() => {
        if (regionE) {
            getComuna(regionE);
        }
    }, [regionE]);

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
                    <form onSubmit={handleSubmit(() => {/* Handle form submit */ })}>
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

                                    {/* tipo */}
                                    <div className="md:mr-4">
                                        <label htmlFor="tipo">Tipo: </label>
                                        <select {...register('tipo')} className="select select-primary w-full" defaultValue={dataUser?.tipo}>
                                            <option value="alumno">alumno</option>
                                            <option value="apoderado">apoderado</option>
                                            <option value="otro">otro</option>
                                        </select>
                                    </div>

                                    {/* Confirmado */}
                                    <div className="md:mr-4 my-auto">
                                        <label className="inline-flex items-center">
                                            <span className="mr-2">Confirmado:</span>
                                            <input type="checkbox" {...register('confirmed')} className="toggle-checkbox checkbox-primary" defaultChecked={dataUser?.confirmed} />
                                        </label>
                                    </div>

                                    {/* Dirección */}
                                    <div className="md:mr-4">
                                        <label htmlFor="direccion">Direccion:</label>
                                        <input type="text" {...register('direccion')} defaultValue={dataUser?.direccion} className="input input-primary w-full" />
                                    </div>

                                    {/* Región */}
                                    <div className="md:mr-4">
                                        <label htmlFor="region">Region:</label>
                                        <select {...register('region')} className="select select-primary w-full" defaultValue={dataUser?.region}>
                                            {regionList.map((region: string) => (
                                                <option value={region} key={region}>
                                                    {region}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Comuna */}
                                    <div className="md:mr-4">
                                        <label htmlFor="comuna">Comuna:</label>
                                        <select
                                            {...register('comuna')}
                                            className="select select-primary w-full"
                                            defaultValue={dataUser.comuna}
                                        >
                                            {comunaList.map((comuna: string) => (
                                                <option value={comuna} key={comuna}>
                                                    {comuna}
                                                </option>
                                            ))}
                                        </select>
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
                                            <input type="checkbox" {...register('blocked')} className="toggle-checkbox checkbox-primary" defaultChecked={dataUser?.blocked} />
                                        </label>
                                    </div>
                                </div>
                                <div className="my-6">
                                    <button type="submit" className="btn btn-primary">
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </>
    )
}
