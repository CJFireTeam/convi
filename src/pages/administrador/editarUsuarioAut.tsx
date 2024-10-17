import { api_getOneUser, api_postCourses, api_role, api_updateUser } from "@/services/axios.services";
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
    establishment: {
        id: number;
        name: string;
    }
    courses: {
        id: number;
        grade: string;
        letter: string;
    }[]
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


export default function EditarUsuarioAut() {
    const searchParams = useSearchParams()
    const search = searchParams.get("id")
    const userId = String(search)

    const [dataUser, setDataUser] = useState<IUser>();
    const [regionList, setRegionList] = useState<string[]>([]);
    const [comunaList, setComunaList] = useState<string[]>([]);


    const EditUserSchema = z.object({
        firstname: z.string(),
        secondname: z.string(),
        first_lastname: z.string(),
        second_lastname: z.string(),
        username: z.string(),
        email: z.string(),
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
                                <div className="grid md:grid-cols-4 mb-4">
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
                                </div>

                                <div className="grid md:grid-cols-3 mb-4">
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

                                    {/* Dirección */}
                                    <div className="md:mr-4">
                                        <label htmlFor="direccion">Direccion:</label>
                                        <input type="text" {...register('direccion')} defaultValue={dataUser?.direccion} className="input input-primary w-full" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 mb-4">
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
                                </div>

                                <div className="grid md:grid-cols-3 mb-4">
                                    {/* Confirmado */}
                                    <div className="md:mr-4 my-auto">
                                        <label className="inline-flex items-center">
                                            <span className="mr-2">Cuenta Confirmada:</span>
                                            <input type="checkbox" {...register('confirmed')} className="toggle toggle-primary" defaultChecked={dataUser?.confirmed} />
                                        </label>
                                    </div>

                                    {/* Bloqueado */}
                                    <div className="md:mr-4 my-auto">
                                        <label className="inline-flex items-center">
                                            <span className="mr-2">Cuenta Bloqueada:</span>
                                            <input type="checkbox" {...register('blocked')} className="toggle toggle-primary" defaultChecked={dataUser?.blocked} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-4">
                                    <button type="submit" className="btn btn-primary w-full col-span-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="grid md:grid-cols-12 gap-4 border rounded-md shadow-md p-4 mt-2">
                        <div className="md:col-start-1 md:col-end-13">
                            <InsertCourse
                                userId={userId}
                                establishmentId={dataUser.establishment.id}
                                course={dataUser.courses}
                                tipo={dataUser.tipo}
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    )
}


interface IFormCourse {
    grade: string;
    letter: string;
    establishment: number;
    users: number;

}
interface IFormCourseAct {
    grade: string;
    letter: string;
    establishment: number;
    users: number;
}


interface props {
    userId: string;
    establishmentId: number;
    course: {
        id: number;
        grade: string;
        letter: string;
    }[]
    tipo: string;
}

export function InsertCourse(props: props) {

    const CourseSchema = z.object({
        grade: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato invalido' }),
        letter: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato invalido' }),
        establishment: z.number(),
        users: z.number()
    });

    const { register, watch, setValue, handleSubmit, formState: { errors }, control } = useForm<IFormCourse>({
        resolver: zodResolver(CourseSchema),
    });

    const onSubmit = async (data: IFormCourse) => {
        try {
            if (props.tipo == 'alumno' && props.course.length === 0) {
                const response = await api_postCourses(data);
                toast.success('Curso agregado correctamente')
            }
            if (props.tipo == 'apoderado') {
                const response = await api_postCourses(data);
                toast.success('Curso agregado correctamente')
            }
            //el id del formulario se lo especifico a la api y luego la data, queda para mañana 
        }
        catch (errors) {
            console.log(errors);
            toast.error('Ha sucedio un error inesperado.')
        }
        console.log('data formulario curso: ', data);
    }

    useEffect(() => {
        setValue('establishment', props.establishmentId);
        setValue('users', parseInt(props.userId));
    }, [props.establishmentId, props.userId,props.course]);

    return (
        <>
            {props.tipo == 'alumno' && props.course.length === 0 &&
                (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid md:grid-cols-4 items-center">
                            <div>
                                <p className="text-xl font-bold">AGREGAR CURSO DEL USUARIO:</p>
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="Curso" className="font-semibold">Curso actual: </label>
                                <input type="text"
                                    {...register('grade', { setValueAs: (value) => value === '' ? undefined : value })}
                                    className="input input-primary w-full"
                                    maxLength={7} />
                                {errors.grade?.message && (<p className="text-red-600 text-sm mt-1">{errors.grade.message}</p>)}
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="letra" className="font-semibold">Letra: </label>
                                <input type="text"
                                    {...register('letter', { setValueAs: (value) => value === '' ? undefined : value })}
                                    className="input input-primary w-full"
                                    maxLength={1}
                                />
                                {errors.letter?.message && (<p className="text-red-600 text-sm mt-1">{errors.letter.message}</p>)}
                            </div>

                            <div className="mt-2 md:mt-5">
                                <button type="submit" className="btn btn-primary w-full row-start-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            {props.tipo == 'alumno' && props.course.length !== 0 &&
                (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid md:grid-cols-4 items-center">
                            <div>
                                <p className="text-xl font-bold">ACTUALIZAR CURSO DEL USUARIO:</p>
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="Curso" className="font-semibold">Curso actual: </label>
                                <input type="text"
                                    {...register('grade', { setValueAs: (value) => value === '' ? undefined : value })}
                                    className="input input-primary w-full"
                                    maxLength={7} 
                                    defaultValue={props.course[0].grade}
                                    />
                                {errors.grade?.message && (<p className="text-red-600 text-sm mt-1">{errors.grade.message}</p>)}
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="letra" className="font-semibold">Letra: </label>
                                <input type="text"
                                    {...register('letter', { setValueAs: (value) => value === '' ? undefined : value })}
                                    className="input input-primary w-full"
                                    maxLength={1}
                                    defaultValue={props.course[0].letter}
                                />
                                {errors.letter?.message && (<p className="text-red-600 text-sm mt-1">{errors.letter.message}</p>)}
                            </div>

                            <div className="mt-2 md:mt-5">
                                <button type="submit" className="btn btn-primary w-full row-start-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            {props.tipo == 'apoderado' &&
                (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid md:grid-cols-4 items-center">
                            <div>
                                <p className="text-xl font-bold">AGREGAR CURSO DEL USUARIO:</p>
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="Curso" className="font-semibold">Curso actual: </label>
                                <input type="text"
                                    {...register('grade', { setValueAs: (value) => value === '' ? undefined : value })}
                                    className="input input-primary w-full"
                                    maxLength={7} />
                                {errors.grade?.message && (<p className="text-red-600 text-sm mt-1">{errors.grade.message}</p>)}
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="letra" className="font-semibold">Letra: </label>
                                <input type="text"
                                    {...register('letter', { setValueAs: (value) => value === '' ? undefined : value })}
                                    className="input input-primary w-full"
                                    maxLength={1}
                                />
                                {errors.letter?.message && (<p className="text-red-600 text-sm mt-1">{errors.letter.message}</p>)}
                            </div>

                            <div className="mt-2 md:mt-5">
                                <button type="submit" className="btn btn-primary w-full row-start-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </form>
                )}

        </>
    );
}