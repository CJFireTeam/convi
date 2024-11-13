import metaI from "@/interfaces/meta.interface";
import { api_deleteCourse, api_getCoursesByUser, api_getEstablishmentCoursesSinPag, api_getOneUser, api_postCourses, api_role, api_updateCourses, api_updateUser } from "@/services/axios.services";
import { getComunas, getRegiones } from "@/services/local.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Select from "react-select";
import WarningAlert from "@/components/alerts/warningAlert";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    const [loadingButton, setLoadingButton] = useState(false)
    const [dataUser, setDataUser] = useState<IUser>();
    const [regionList, setRegionList] = useState<string[]>([]);
    const [comunaList, setComunaList] = useState<string[]>([]);


    const EditUserSchema = z.object({
        firstname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        secondname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        first_lastname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        second_lastname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        username: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        email: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        confirmed: z.boolean(),
        direccion: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        region: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        comuna: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        phone: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        blocked: z.boolean(),
    });

    const { register, watch, setValue, handleSubmit, formState: { errors }, control } = useForm<IFormValue>({
        resolver: zodResolver(EditUserSchema),
    });


    const regionWatch = watch("region")

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

    useEffect(() => {
        if (!userId || Number.isNaN(parseInt(userId))) return;
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
            setLoadingButton(true)
            // Transformar valores vacíos en undefined
            const transformedData = {
                ...data,
                region: data.region === "" ? undefined : data.region,
                comuna: data.comuna === "" ? undefined : data.comuna,
            }
            await api_updateUser(Number(userId), transformedData)
            toast.success('Perfil actualizado')
            fetchData();
        } catch (error) {
            console.error(error)
            toast.error('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.')
        } finally {
            setLoadingButton(false)
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
                                <div className="grid md:grid-cols-2 mb-4">
                                    {/* Campos de texto */}
                                    <div className="md:mr-4">
                                        <label htmlFor="nombre">Primer Nombre: </label>
                                        <Input {...register('firstname', { setValueAs: (value) => value === '' ? undefined : value })} type="text" className="input input-primary w-full" placeholder="Ingrese su primer nombre..." defaultValue={dataUser?.firstname} />
                                        {errors.firstname?.message && (<p className="text-red-600 text-sm mt-1">{errors.firstname.message}</p>)}
                                    </div>

                                    {/* Segundo Nombre */}
                                    <div className="md:mr-4">
                                        <label htmlFor="secondname">Segundo Nombre: </label>

                                        {errors.secondname?.message && (<p className="text-red-600 text-sm mt-1">{errors.secondname.message}</p>)}<Input {...register('secondname', { setValueAs: (value) => value === '' ? undefined : value })} type="text" className="input input-primary w-full" placeholder="Ingrese su segundo nombre..." defaultValue={dataUser?.secondname} />
                                    </div>

                                    {/* Apellido */}
                                    <div className="md:mr-4">
                                        <label htmlFor="apellido">Primer Apellido: </label>
                                        <Input {...register('first_lastname', { setValueAs: (value) => value === '' ? undefined : value })} type="text" className="input input-primary w-full" placeholder="Ingrese su primer apellido..." defaultValue={dataUser?.first_lastname} />
                                        {errors.first_lastname?.message && (<p className="text-red-600 text-sm mt-1">{errors.first_lastname.message}</p>)}
                                    </div>

                                    {/* Segundo Apellido */}
                                    <div className="md:mr-4">
                                        <label htmlFor="second_lastname">Segundo Apellido: </label>
                                        <Input {...register('second_lastname', { setValueAs: (value) => value === '' ? undefined : value })} type="text" className="input input-primary w-full" defaultValue={dataUser?.second_lastname} />
                                        {errors.second_lastname?.message && (<p className="text-red-600 text-sm mt-1">{errors.second_lastname.message}</p>)}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 mb-4">
                                    {/* username */}
                                    <div className="md:mr-4">
                                        <label htmlFor="username">Username: </label>
                                        <Input {...register('username', { setValueAs: (value) => value === '' ? undefined : value })} type="text" className="input input-primary w-full" defaultValue={dataUser?.username} />
                                        {errors.username?.message && (<p className="text-red-600 text-sm mt-1">{errors.username.message}</p>)}
                                    </div>

                                    {/* email */}
                                    <div className="md:mr-4">
                                        <label htmlFor="email">Correo electronico: </label>
                                        <Input type="email" {...register('email', { setValueAs: (value) => value === '' ? undefined : value })} className="input input-primary w-full" defaultValue={dataUser?.email} />
                                        {errors.email?.message && (<p className="text-red-600 text-sm mt-1">{errors.email.message}</p>)}
                                    </div>

                                    {/* Dirección */}
                                    <div className="md:mr-4">
                                        <label htmlFor="direccion">Direccion:</label>
                                        <Input type="text" {...register('direccion', { setValueAs: (value) => value === '' ? undefined : value })} defaultValue={dataUser?.direccion} className="input input-primary w-full" />
                                        {errors.direccion?.message && (<p className="text-red-600 text-sm mt-1">{errors.direccion.message}</p>)}
                                    </div>

                                    {/* Teléfono */}
                                    <div className="md:mr-4">
                                        <label htmlFor="phone">Telefono:</label>
                                        <Input type="text" {...register('phone', { setValueAs: (value) => value === '' ? undefined : value })} className="input input-primary w-full" defaultValue={dataUser?.phone} />
                                        {errors.phone?.message && (<p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>)}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 mb-4">
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
                                                    className="select select-primary w-full bg-white"
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
                                                    className="select select-primary w-full bg-white"
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
                                </div>

                                <div className="grid md:grid-cols-2 mb-4">
                                    {/* Confirmado */}
                                    <div className="md:mr-4 my-auto">
                                        <label className="inline-flex items-center">
                                            <span className="mr-2">Cuenta Confirmada:</span>
                                            <input type="checkbox" {...register('confirmed')} className="toggle toggle-primary bg-white" defaultChecked={dataUser?.confirmed} />
                                        </label>
                                    </div>

                                    {/* Bloqueado */}
                                    <div className="md:mr-4 my-auto">
                                        <label className="inline-flex items-center">
                                            <span className="mr-2">Cuenta Bloqueada:</span>
                                            <input type="checkbox" {...register('blocked')} className="toggle toggle-primary bg-white" defaultChecked={dataUser?.blocked} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-4">
                                    {!loadingButton && (
                                        <button type="submit" className="btn btn-outline btn-primary w-full col-span-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                            Guardar
                                        </button>
                                    )}
                                    {loadingButton && (<>
                                        <button type="button" className="btn btn-outline btn-primary w-full" disabled>
                                            Guardar
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </button>
                                    </>)}
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="grid md:grid-cols-12 gap-4 border rounded-md shadow-md p-4 mt-2">
                        <div className="md:col-start-1 md:col-end-13">
                            <InsertCourse
                                userId={userId}
                                establishmentId={dataUser.establishment.id}
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
    establishment_courses: number;
    establishment: number;
    users: number;

}

interface props {
    userId: string;
    establishmentId: number;
    tipo: string;
}

interface ICourse {
    attributes: {
        establishment_courses: {
            data: {
                attributes: {
                    Grade: string;
                    Letter: string;
                }
                id: number;
            }[]
        }
    }
    id: number;
}

interface ICoursesEstablishment {
    attributes: {
        Grade: string
        Letter: string
        establishment: {
            data: {
                attributes: {
                    name: string;
                }
                id: number;
            }
        }
    }
    id: number
}

export function InsertCourse(props: props) {
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    const [courseByUser, setCourseByUser] = useState<ICourse[]>([]);
    const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
    const getCoursesByUser = async () => {
        try {
            setLoading(true)
            const data = await api_getCoursesByUser(props.establishmentId, parseInt(props.userId), metaData.page)
            setCourseByUser(data.data.data);
            setMetaData(data.data.meta.pagination)
            // Verifica si no hay cursos después de la actualización
            if (data.data.data.length === 0 && metaData.page > 1) {
                updatePage(metaData.page - 1); // Retrocede a la página anterior
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updatePage = (number: number) => {
        setMetaData(prev => ({ ...prev, page: number }))
    }

    useEffect(() => {
        if (props.establishmentId || props.userId) {
            getCoursesByUser()
        }
    }, [props.establishmentId])

    const CourseSchema = z.object({
        establishment_courses: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato invalido' }),
        establishment: z.number(),
        users: z.number()
    });

    const { register, watch, setValue, handleSubmit, formState: { errors }, control } = useForm<IFormCourse>({
        resolver: zodResolver(CourseSchema),
    });

    const [coursesEs, setCoursesEs] = useState<ICoursesEstablishment[]>([])
    const getCoursesEstablishment = async () => {
        try {
            const data = await api_getEstablishmentCoursesSinPag(props.establishmentId)
            setCoursesEs(data.data.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (props.establishmentId) {
            getCoursesEstablishment()
        }

    }, [props.establishmentId])


    const onSubmit = async (data: IFormCourse) => {
        try {
            if (props.tipo == 'alumno' && courseByUser.length === 0) {
                setLoadingButton(true)
                const response = await api_postCourses(data);
                toast.success('Curso agregado correctamente');
                getCoursesByUser();
            }
            if (props.tipo == 'alumno' && courseByUser.length !== 0) {
                setLoadingButton(true)
                const response = await api_updateCourses(courseByUser[0].id, data);
                toast.success('Curso actualizado correctamente')
                getCoursesByUser()
            }
            if (props.tipo == 'apoderado') {
                setLoadingButton(true)
                const response = await api_postCourses(data);
                toast.success('Curso agregado correctamente')
                getCoursesByUser()
            }
        }
        catch (errors) {
            console.log(errors);
            toast.error('Ha sucedio un error inesperado.')
        } finally {
            setLoadingButton(false)
        }
        console.log('data formulario curso: ', data);
    }

    useEffect(() => {
        setValue('establishment', props.establishmentId);
        setValue('users', parseInt(props.userId));
    }, [props.establishmentId, props.userId]);

    const defaultValue =
        courseByUser.length > 0 &&
            courseByUser[0].attributes.establishment_courses.data.length > 0
            ? courseByUser[0].attributes.establishment_courses.data[0].id
            : undefined;

    const eliminarclick = async (CourseEsId: number) => {
        try {
            setLoadingDelete(true);
            const response = await api_deleteCourse(CourseEsId);
            // Aquí puedes manejar el estado de tu aplicación, como actualizar la lista de documentos
            toast.success('Curso eliminado exitosamente.')
            await getCoursesByUser()
            await getCoursesEstablishment()
        } catch (error) {
            console.error('Error al eliminar el curso', error);
        } finally {
            setLoadingDelete(false)
        }
    };

    return (
        <>
            {props.tipo == 'alumno' && courseByUser.length === 0 &&
                (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid md:grid-cols-3 items-center p-4">
                            <div>
                                <p className="text-xl font-bold">AGREGAR CURSO DEL USUARIO:</p>
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="letra" className="font-semibold">Curso: </label>
                                <Controller control={control} name="establishment_courses" render={({ field: { onChange, value, name, ref } }) =>
                                (
                                    <Select placeholder="Seleccione curso" getOptionValue={(option) => option.id.toString()}
                                        getOptionLabel={(option) => option.attributes.Grade + " " + option.attributes.Letter}
                                        value={coursesEs.find((e) => e.id === value)}
                                        options={coursesEs}
                                        onChange={(val) => {
                                            if (val) {
                                                setValue("establishment_courses", val.id); // Solo llama a setValue si val no es undefined
                                            }
                                        }}
                                        menuPortalTarget={document.body}
                                        loadingMessage={() => "Cargando opciones..."}
                                        isLoading={coursesEs.length === 0}
                                        isClearable
                                    />
                                )}
                                />
                                {errors.establishment_courses?.message && (<p className="text-red-600 text-sm mt-1">{errors.establishment_courses.message}</p>)}
                            </div>

                            <div className="mt-2 md:mt-5">
                                {!loadingButton && (
                                    <button type="submit" className="btn btn-primary btn-outline w-full row-start-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                        Guardar
                                    </button>
                                )}
                                {loadingButton && (<>
                                    <button type="button" className="btn btn-outline btn-primary w-full" disabled>
                                        Guardar
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </button>
                                </>)}
                            </div>
                        </div>
                    </form>
                )}
            {props.tipo == 'alumno' && courseByUser.length !== 0 &&
                (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid md:grid-cols-3 items-center p-4">
                            <div>
                                <p className="text-xl font-bold">ACTUALIZAR CURSO DEL USUARIO:</p>
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="letra" className="font-semibold">Curso: </label>
                                <Controller
                                    control={control}
                                    name="establishment_courses"
                                    defaultValue={defaultValue}
                                    render={({ field: { onChange, value, name, ref } }) =>
                                    (
                                        <Select placeholder="Seleccione curso" getOptionValue={(option) => option.id.toString()}
                                            getOptionLabel={(option) => option.attributes.Grade + " " + option.attributes.Letter}
                                            value={coursesEs.find((e) => e.id === value) || null}
                                            options={coursesEs}
                                            onChange={(val) => {
                                                if (val) {
                                                    setValue("establishment_courses", val.id); // Guarda solo el id en el formulario
                                                }
                                            }}
                                            menuPortalTarget={document.body}
                                            loadingMessage={() => "Cargando opciones..."}
                                            isLoading={coursesEs.length === 0}
                                            isClearable
                                        />
                                    )}
                                />
                                {errors.establishment_courses?.message && (<p className="text-red-600 text-sm mt-1">{errors.establishment_courses.message}</p>)}
                            </div>

                            <div className="mt-2 md:mt-5">
                                {!loadingButton && (
                                    <button type="submit" className="btn btn-outline btn-primary w-full row-start-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                        Guardar
                                    </button>
                                )}
                                {loadingButton && (<>
                                    <button type="button" className="btn btn-outline btn-primary w-full" disabled>
                                        Guardar
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </button>
                                </>)}
                            </div>
                        </div>
                    </form>
                )}
            {props.tipo == 'apoderado' &&
                (<>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid md:grid-cols-3 items-center border-b-2 border-b-primary p-4">
                            <div>
                                <p className="text-xl font-bold">AGREGAR CURSO DEL USUARIO:</p>
                            </div>

                            <div className="md:mr-2">
                                <label htmlFor="letra" className="font-semibold">Curso: </label>
                                <Controller control={control} name="establishment_courses" render={({ field: { onChange, value, name, ref } }) =>
                                (
                                    <Select placeholder="Seleccione curso" getOptionValue={(option) => option.id.toString()}
                                        getOptionLabel={(option) => option.attributes.Grade + " " + option.attributes.Letter}
                                        value={coursesEs.find((e) => e.id === value)}
                                        options={coursesEs}
                                        onChange={(val) => {
                                            if (val) {
                                                setValue("establishment_courses", val.id); // Solo llama a setValue si val no es undefined
                                            }
                                        }}
                                        menuPortalTarget={document.body}
                                        loadingMessage={() => "Cargando opciones..."}
                                        isLoading={coursesEs.length === 0}
                                        isClearable
                                    />
                                )}
                                />
                                {errors.establishment_courses?.message && (<p className="text-red-600 text-sm mt-1">{errors.establishment_courses.message}</p>)}
                            </div>

                            <div className="mt-2 md:mt-5">
                                {!loadingButton && (
                                    <button type="submit" className="btn btn-primary btn-outline w-full row-start-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                        Guardar
                                    </button>
                                )}
                                {loadingButton && (<>
                                    <button type="button" className="btn btn-outline btn-primary w-full" disabled>
                                        Guardar
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </button>
                                </>)}
                            </div>
                        </div>
                    </form>

                    {loading && (
                        <div className="flex flex-col items-center my-auto">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    )}

                    {!loading && courseByUser.length === 0 && (
                        <div className="flex flex-col items-center my-auto">
                            <WarningAlert message={'Sin cursos asignados'} />
                        </div>
                    )}

                    {courseByUser.length !== 0 && !loading && (<>
                        <div className="grid md:grid-cols-4 items-center text-center mt-4">
                            <div className="md:col-span-4">
                                <p className="text-xl font-bold">Cursos relacionados a este usuario</p>
                            </div>
                            {courseByUser.map((c, index) => (<>
                                <div key={index} className="m-2">
                                    {c.attributes.establishment_courses.data.length > 0 ? (<>
                                        <Card className="mt-2">
                                            <CardHeader>
                                                <CardTitle>Cursos</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                < span className="font-semibold" >
                                                    {c.attributes.establishment_courses.data[0].attributes.Grade + " " + c.attributes.establishment_courses.data[0].attributes.Letter}
                                                </ span>
                                            </CardContent>
                                            <CardFooter className="flex justify-center">
                                                <p className="font-semibold text-lg text-error cursor-pointer"
                                                    onClick={() => {
                                                        const modal = document.getElementById(`my_modal_${c.id}`) as HTMLDialogElement; // Usando ID único
                                                        modal?.showModal();
                                                    }}
                                                >Eliminar</p>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-error cursor-pointer"
                                                    onClick={() => {
                                                        const modal = document.getElementById(`my_modal_${c.id}`) as HTMLDialogElement; // Usando ID único
                                                        modal?.showModal();
                                                    }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </CardFooter>
                                        </Card>
                                    </>) : (
                                        <span className="font-semibold">Sin cursos disponibles</span>
                                    )}
                                </div>
                                {/* Open the modal using document.getElementById('ID').showModal() method */}
                                <dialog id={`my_modal_${c.id}`} className="modal">
                                    <div className="modal-box bg-white flex flex-col items-center">
                                        <h3 className="font-bold text-lg text-center">¿Estas seguro que quieres borrar el curso?</h3>
                                        <div className="modal-action">
                                            <form method="dialog">
                                                <button className="btn mr-4">Cancelar</button>
                                                {!loadingDelete && (
                                                    <button type="button" className="btn btn-outline btn-error" onClick={() => eliminarclick(c.id)}>
                                                        Aceptar
                                                    </button>
                                                )}
                                                {loadingDelete && (
                                                    <button type="button" className="btn btn-outline btn-error" disabled>
                                                        Aceptar
                                                        <span className="loading loading-spinner loading-lg"></span>
                                                    </button>
                                                )}
                                            </form>
                                        </div>
                                    </div>
                                </dialog>
                            </>))}
                        </div>
                        <Paginator metadata={metaData} setMetaData={updatePage} />
                    </>)}
                </>)}
        </>
    );
}

function Paginator({ metadata, setMetaData }: { metadata: metaI, setMetaData: (numero: number) => void }) {
    const changePage = (number: number) => {
        if (number > metadata.pageCount || number <= 0) return
        setMetaData(number)
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => changePage(metadata.page - 1)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Página Anterior
                </button>
                <button
                    onClick={() => changePage(metadata.page + 1)}
                    className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Próxima Página
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{Math.min(Number(metadata.pageSize) * metadata.page, metadata.total)}</span> de{" "}
                        <span className="font-medium">{metadata.total}</span> resultados
                    </p>
                </div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                        onClick={() => changePage(metadata.page - 1)}
                        className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                    >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {[...Array(metadata.pageCount)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => changePage(i + 1)}
                            className={`cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 md:inline-flex ${i + 1 === metadata.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => changePage(metadata.page + 1)}
                        className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                        <span className="sr-only">Siguiente</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </div>
    )
}