import WarningAlert from "@/components/alerts/warningAlert";
import { api_deleteCourse, api_getEstablishmentCoursesByUser, api_getEstablishmentCoursesSinPag, api_getOneUser, api_postCourses, api_putEstablishmentCourses, api_role, api_updateUser } from "@/services/axios.services";
import { getComunas, getRegiones } from "@/services/local.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Select from "react-select";
import metaI from "@/interfaces/meta.interface";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import Head from "next/head";
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
    establishment: {
        id: number;
        name: string;
    }
    courses: {
        id: number;
        grade: string;
        letter: string;
    }[]
    canUploadDoc: boolean;
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
    canUploadDoc: boolean;
}

interface IRole {
    id: number;
    name: string;
}

export default function EditarUsuario() {
    const [loadingButton, setLoadingButton] = useState(false)
    const searchParams = useSearchParams()
    const search = searchParams.get("id")
    const userId = String(search)

    const [dataUser, setDataUser] = useState<IUser>();
    const [regionList, setRegionList] = useState<string[]>([]);
    const [comunaList, setComunaList] = useState<string[]>([]);
    const [roleList, setRoleList] = useState<IRole[]>([]);


    const EditUserSchema = z.object({
        firstname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        secondname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        first_lastname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        second_lastname: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        username: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        email: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        role: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        confirmed: z.boolean(),
        direccion: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        region: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        comuna: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        phone: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        blocked: z.boolean(),
        canUploadDoc: z.boolean(),
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
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.')
        } finally {
            setLoadingButton(false)
        }
    }
    if (!dataUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }
    if (!dataUser) return (
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
    )
    return (
        <>
            <Head>
                <title>Administrar Usuarios</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
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
                                <Input {...register('secondname', { setValueAs: (value) => value === '' ? undefined : value })} type="text" className="input input-primary w-full" placeholder="Ingrese su segundo nombre..." defaultValue={dataUser?.secondname} />
                                {errors.secondname?.message && (<p className="text-red-600 text-sm mt-1">{errors.secondname.message}</p>)}
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
                                <label htmlFor="direccion">Dirección:</label>
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
                                            className="select select-primary w-full bg-white"
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
                                {errors.role?.message && (<p className="text-red-600 text-sm mt-1">{errors.role.message}</p>)}
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

                        <div className="grid md:grid-cols-2">
                            {/* Confirmado */}
                            <div className="md:mr-4 my-auto">
                                <label className="inline-flex items-center">
                                    <span className="mr-2">Cuenta Confirmada:</span>
                                    <input type="checkbox" {...register('confirmed')} className="toggle toggle-primary bg-white" defaultChecked={dataUser?.confirmed} />
                                </label>
                            </div>

                            {/* Documentos */}
                            <div className="md:mr-4 my-auto mb-2">
                                <label className="inline-flex items-center">
                                    <span className="mr-2">Puede subir documentos:</span>
                                    <input type="checkbox" {...register('canUploadDoc')} className="toggle toggle-primary bg-white" defaultChecked={dataUser?.canUploadDoc} />
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

                        <div className="grid md:grid-cols-4 mt-4">
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
            <InsertCourse
                userId={userId}
                establishmentId={dataUser.establishment.id}
            />
        </>
    )
}



interface IFormCourse {
    establishment_courses: number;
}

interface props {
    userId: string;
    establishmentId: number;
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

interface ICourse {
    attributes: {
        Grade: string;
        Letter: string;
        establishment:{
            data:{
                id:number;
                attributes:{
                    name:string;
                }
            }
        }
    }
    id: number;
}
    

export function InsertCourse(props: props) {
    const [loadingButton, setLoadingButton] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const CourseSchema = z.object({
        establishment_courses: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato invalido' }),
    });

    const { register, watch, setValue, handleSubmit, formState: { errors }, control } = useForm<IFormCourse>({
        resolver: zodResolver(CourseSchema),
    });

    const [coursesEs, setCoursesEs] = useState<ICoursesEstablishment[]>([])
    const getCoursesEstablishment = async () => {
        try {
            const data = await api_getEstablishmentCoursesSinPag(props.establishmentId);
            const establishmentCourses = data.data.data;

            // Filtrar los cursos para que solo se incluyan aquellos que el usuario no tiene inscritos
            const userCourseIds = courseByUser.map(course => course.id);

            const filteredCourses = establishmentCourses.filter((course: any) =>
                !userCourseIds.includes(course.id) && !course.attributes.Eliminado // Asegúrate de que el curso no esté marcado como eliminado
            );

            setCoursesEs(filteredCourses);
        } catch (error) {
            console.error(error);
        }
    }

    const [loading, setLoading] = useState(true)
    const [courseByUser, setCourseByUser] = useState<ICourse[]>([]);
    const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
    const getCoursesByUser = async () => {
        try {
            setLoading(true)
            const data = await api_getEstablishmentCoursesByUser(props.establishmentId, parseInt(props.userId), metaData.page)
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

    useEffect(() => {
        if (props.establishmentId && courseByUser) {
            getCoursesEstablishment();
        }
    }, [props.establishmentId, courseByUser]);

    const onSubmit = async (data: IFormCourse) => {
        try {
            setLoadingButton(true);
    
            // Combinar los cursos existentes con el nuevo curso seleccionado
            const currentCourseIds = courseByUser.map(course => course.id); // Obtén los IDs de los cursos actuales
            const updatedCourses = [...currentCourseIds, data.establishment_courses]; // Añade el nuevo curso
    
            // Envía la lista actualizada al backend
            await api_putEstablishmentCourses(parseInt(props.userId), {
                establishment_courses: updatedCourses,
            });
    
            toast.success('Curso agregado correctamente');
            // Actualiza las listas de cursos después de la operación
            await getCoursesByUser();
            await getCoursesEstablishment();
        } catch (error) {
            console.error('Error al agregar curso:', error);
            toast.error('Ha sucedido un error inesperado.');
        } finally {
            setLoadingButton(false);
        }
    };

    const updatePage = (number: number) => {
        setMetaData(prev => ({ ...prev, page: number }))
    }

    useEffect(() => {
        if (props.establishmentId || props.userId) {
            getCoursesByUser()
        }
    }, [props.establishmentId, metaData.page])

    const eliminarclick = async (courseId: number) => {
        try {
            setLoadingDelete(true);
    
            // Filtra los cursos actuales para eliminar el seleccionado
            const updatedCourses = courseByUser
                .filter(course => course.id !== courseId)
                .map(course => course.id); // Obtén los IDs de los cursos restantes
    
            // Envía la lista actualizada al backend
            await api_putEstablishmentCourses(parseInt(props.userId), {
                establishment_courses: updatedCourses,
            });
    
            toast.success('Curso eliminado exitosamente.');
            // Actualiza las listas de cursos después de la operación
            await getCoursesByUser();
            await getCoursesEstablishment();
        } catch (error) {
            console.error('Error al eliminar el curso', error);
            toast.error('Ha sucedido un error inesperado.');
        } finally {
            setLoadingDelete(false);
        }
    };
    

    return (
        <>
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
                                getOptionLabel={(option) => option.attributes.Grade + " " + option.attributes.Letter + " " + option.attributes.establishment.data.attributes.name}
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

                    <div className="mt-2 md:mt-11 mb-6">
                        {!loadingButton && (
                            <button type="submit" className="btn btn-primary btn-outline w-full ">
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
                                <Card className="mt-2">
                                    <CardHeader>
                                        <CardTitle>Cursos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="font-semibold" >
                                            {c.attributes.Grade + " " + c.attributes.Letter}
                                        </ span>
                                        <br />
                                        <span className="font-semibold" >
                                            {c.attributes.establishment.data.attributes.name}
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