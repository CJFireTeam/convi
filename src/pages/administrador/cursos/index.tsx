import { useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "react-toastify"
import Head from "next/head"
import ViewEstablishmentCourses from "@/components/administrador/viewestblishmentcourses"
import WarningAlert from "@/components/alerts/warningAlert"
import { api_getUsersProfeEstablishment, api_postEstablishmentCourses } from "@/services/axios.services"
import { useUserStore } from "@/store/userStore"
import router from "next/router"
import { IUserEstablishment } from "@/interfaces/documentos.interface"
import Select from "react-select";


interface IFormEstablishmentCourse {
    Letter: string;
    Grade: string;
    establishment: number;
    LeadTeacher?:number;
}

const EstablishmentCourseSchema = z.object({
    Letter: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' })
        .regex(/^[A-Z]$/, { message: 'La letra debe ser una única letra mayúscula (ejemplo: A, B, C)' }),
    Grade: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' })
        .regex(/^[1-8][°a-zA-Z]*$/, { message: 'El curso debe comenzar con un número del 1 al 8 seguido de letras (ejemplo: 1°A, 2°medio,)' }),
    establishment: z.number(),
    LeadTeacher:z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }).optional(),
})

export default function Index() {
    const { user, GetRole } = useUserStore()
    const [loading, setLoading] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    const [refreshCourses, setRefreshCourses] = useState(false)

    const { register, setValue,control, handleSubmit, formState: { errors } } = useForm<IFormEstablishmentCourse>({
        resolver: zodResolver(EstablishmentCourseSchema),
    })

    const [teacher,setTeacher]=useState<IUserEstablishment[]>([]);
    const getTeachers = async () =>{
        try {
            const data = await api_getUsersProfeEstablishment(user.establishment.id);
            setTeacher(data.data);
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(()=>{
        if( !user || !user.establishment?.id )return;
        getTeachers()
    },[user,user.establishment?.id])

    useEffect(() => {
        if (user) {
            setValue('establishment', user.establishment.id)
            setLoading(false)
        }
    }, [user, setValue])

    const onSubmit = async (data: IFormEstablishmentCourse) => {
        try {
            setLoadingButton(true)
            setRefreshCourses(prev => !prev)
            await api_postEstablishmentCourses(data)
            toast.success('Curso agregado correctamente')
        } catch (error) {
            console.error(error)
            toast.error('Ha ocurrido un error inesperado.')
        } finally {
            setLoadingButton(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    if (GetRole() !== "admin") {
        return router.push('/')
    }

    return (
        <>
            <Head>
                <title>Administrar Cursos</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="grid lg:grid-cols-2">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid lg:grid-cols-2 border rounded-md p-4 shadow-md mb-2 lg:mb-0 lg:mr-2">
                        <div className="lg:col-span-2 mb-3">
                            <p className="text-2xl font-bold">Agregue un nuevo curso</p>
                        </div>
                        <div className="mb-2 lg:mb-0 lg:mr-2">
                            <label htmlFor="curso" className="font-semibold">Ingrese curso</label>
                            <input
                                type="text"
                                className="input input-primary w-full"
                                maxLength={8}
                                placeholder="ej: 1°medio"
                                {...register('Grade', { setValueAs: (value) => value === '' ? undefined : value })}
                            />
                            {errors.Grade?.message && <p className="text-red-600 text-sm mt-1">{errors.Grade.message}</p>}
                        </div>

                        <div className="mb-2 lg:mb-0 lg:mr-2">
                            <label htmlFor="letra" className="font-semibold">Ingrese letra</label>
                            <input
                                type="text"
                                className="input input-primary w-full"
                                maxLength={1}
                                placeholder="ej: B"
                                {...register('Letter', { setValueAs: (value) => value === '' ? undefined : value })}
                            />
                            {errors.Letter?.message && <p className="text-red-600 text-sm mt-1">{errors.Letter.message}</p>}
                        </div>

                        <div className="mb-2 lg:mb-0 lg:mr-2">
                        <label htmlFor="user" className="font-semibold">Seleccione un usuario: </label>
                                <Controller
                                    control={control}
                                    name="LeadTeacher"
                                    render={({ field: { onChange, value, name, ref } }) => (
                                        <Select
                                            placeholder="Seleccione usuario (opcional)"
                                            getOptionValue={(option) => option.id.toString()}
                                            getOptionLabel={(option) => option.firstname + " " + option.first_lastname}
                                            value={teacher.find((e) => e.id === value)}
                                            options={teacher}
                                            onChange={(val) => {
                                                if (val) {
                                                    setValue("LeadTeacher", val.id); // Solo llama a setValue si val no es undefined
                                                }
                                            }}
                                            menuPortalTarget={document.body}
                                            loadingMessage={() => "Cargando opciones..."}
                                            isLoading={teacher.length === 0}
                                            isClearable
                                        />
                                    )}
                                />
                                {errors.LeadTeacher?.message && (<p className="text-red-600 text-sm mt-1">{errors.LeadTeacher.message}</p>)}
                        </div>

                        <div className="mb-2 lg:mb-0 lg:mt-6 mx-auto lg:mx-0">
                            {!loadingButton && (
                                <button type="submit" className="btn btn-outline btn-primary">
                                    Guardar
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </button>
                            )}

                            {loadingButton && (<>
                                <button type="button" className="btn btn-outline btn-primary" disabled>
                                    Guardar
                                    <span className="loading loading-spinner loading-lg"></span>
                                </button>
                            </>)}
                        </div>
                    </div>
                </form>
                <div className="border rounded-md p-4 shadow-md">
                    <ViewEstablishmentCourses establishmentId={user.establishment.id} refreshTrigger={refreshCourses} />
                </div>
            </div>
        </>
    )
}