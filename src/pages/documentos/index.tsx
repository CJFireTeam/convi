import SinCursoAsig from "@/components/documentos/sincursosasig";
import { api_getAllUserByEstablishment, api_postDocument, api_uploadFiles } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Select from "react-select";
import CantUploadDoc from "@/components/documentos/cantuploaddoc";
import { IUserEstablishment } from "@/interfaces/documentos.interface";
import router from "next/router";
import DocumentosCreados from "@/components/documentos/documentoscreados";
import DocumentosRecibidos from "@/components/documentos/documentosrecibidos";
import DocumentosEstablecimiento from "@/components/documentos/documentosestablecimiento";
import DocumentosCurso from "@/components/documentos/documentoscurso";
import DocumentosAlumno from "@/components/documentos/documentAlum/documentosalumno";
interface FormValues {
    descriptionDoc: string;
    userId: number;
    establishmentId: number;
    document: FileList;
    user_destiny?: number;
    establishment_course?: number;
}

export default function Index() {
    const { user, GetRole } = useUserStore();

    const DocumentSchema = z.object({
        descriptionDoc: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' })
            .min(1, { message: 'La descripción no puede estar vacía' }),
        userId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        establishmentId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        document: z
            .any()
            .refine((files) => {
                if (typeof window !== "undefined" && files instanceof FileList) {
                    return files.length > 0;
                }
                return true;
            }, "Se requiere al menos un archivo")
            .refine((files) => {
                if (typeof window !== "undefined" && files instanceof FileList) {
                    return files.length <= 4;
                }
                return true;
            }, "No se pueden subir más de 4 archivos"),
        user_destiny: z.number().optional(),
        establishment_course: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' }).optional(),
    });

    const { register, watch, setValue, control, reset, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(DocumentSchema),
    });

    useEffect(() => {
        if (!user || !user.establishment?.id) return;
        setValue('userId', user.id);
        setValue('establishmentId', user.establishment?.id || 0);
    }, [user, setValue]);

    // Estado para controlar la visibilidad de los selects
    const [isCourseSelected, setIsCourseSelected] = useState(false);
    const [isUserSelected, setIsUserSelected] = useState(false);

    // Función para manejar el cambio en el Select de cursos
    const handleCourseChange = (val: any) => {
        if (val) {
            setValue("establishment_course", Number(val?.id));
            setIsCourseSelected(true); // Curso seleccionado, ocultar usuario
            setIsUserSelected(false); // Reiniciar el estado de usuario
        } else {
            // Si se elimina la selección, restablecer ambos
            setValue("establishment_course", undefined);
            setIsCourseSelected(false);
        }
    };

    // Función para manejar el cambio en el Select de usuarios
    const handleUserChange = (val: any) => {
        if (val) {
            setValue("user_destiny", Number(val?.id));
            setIsUserSelected(true); // Usuario seleccionado, ocultar curso
            setIsCourseSelected(false); // Reiniciar el estado de curso
        } else {
            // Si se elimina la selección, restablecer ambos
            setValue("user_destiny", undefined);
            setIsUserSelected(false);
        }
    };

    const [userEstablishment, setUserEstablishment] = useState<IUserEstablishment[]>([]);
    const getAllUserByEstablishment = async () => {
        try {
            const data = await api_getAllUserByEstablishment(user.establishment.id, user.id);
            setUserEstablishment(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (!user.id || !user.establishment?.id) return;
        getAllUserByEstablishment();
    }, [user]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            // Crear un objeto FormData para enviar los archivos
            const formData = new FormData();

            // Añadir todos los archivos al FormData
            for (let i = 0; i < data.document.length; i++) {
                formData.append('files', data.document[i]);
            }

            // Subir los archivos usando la nueva función de servicio
            const uploadResponse = await api_uploadFiles(formData);

            // Crear un array de objetos de los archivos con la estructura que espera Strapi
            const fileArray = uploadResponse.data.map((file: any) => ({
                id: file.id,
                name: file.name,
                alternativeText: file.alternativeText,
                caption: file.caption,
                width: file.width,
                height: file.height,
                formats: file.formats,
                hash: file.hash,
                ext: file.ext,
                mime: file.mime,
                size: file.size,
                url: file.url,
                previewUrl: file.previewUrl,
                provider: file.provider,
                provider_metadata: file.provider_metadata,
                folderPath: file.folderPath,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt
            }));

            // Crear el objeto de documento con la referencia a los archivos
            const documentData = {
                descriptionDoc: data.descriptionDoc,
                userId: data.userId,
                establishmentId: data.establishmentId,
                document: fileArray, // Enviar el array de archivos
                user_destiny: data.user_destiny,
                establishment_course: data.establishment_course,
            };

            // Crear el documento en Strapi
            const response = await api_postDocument(documentData);

            toast.success('Documentos subidos con éxito.');
            router.reload();
        } catch (error) {
            console.error('Error al subir los documentos:', error);
            toast.error('Ha ocurrido un error inesperado.')
        } finally {
            setIsSubmitting(false);
        }
    };


    if ((GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor") && user.canUploadDoc == false) {

        return (
            <CantUploadDoc />
        )
    }

    if ((GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor") && user.canUploadDoc == true && user.establishment_courses.length === 0) {
        return (
            <>
                <SinCursoAsig />
            </>
        );
    }

    if ((GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor") && user.canUploadDoc == true) {
        return (
            <>
                <Head>
                    <title>Documentos</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                </Head>
                <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-2 mx-auto mb-4 w-full border rounded-lg shadow-md p-4 items-center text-center">
                    <div className="col-span-2">
                        <span className="text-2xl font-bold">Subir Documentos:</span>
                        <p className="text-sm font-semibold text-slate-500">nota: deje en blanco para enviar documento al colegio completo. </p>
                    </div>

                    {/* Select de curso */}
                    <div className="col-span-2 md:col-span-1 items-center mb-4">
                        {!isUserSelected && (
                            <>
                                <label htmlFor="curso" className="font-semibold">Seleccione un curso: </label>
                                <Controller
                                    control={control}
                                    name="establishment_course"
                                    render={({ field: { onChange, value, name, ref } }) =>
                                    (
                                        <Select placeholder="Seleccione curso (opcional)"
                                            getOptionValue={(option) => option.id.toString()}
                                            getOptionLabel={(option) => option.Grade + " " + option.Letter}
                                            value={user.establishment_courses.find((e) => e.id === value)}
                                            options={user.establishment_courses}
                                            onChange={handleCourseChange}
                                            menuPortalTarget={document.body}
                                            loadingMessage={() => "Cargando opciones..."}
                                            isLoading={user.establishment_courses.length === 0}
                                            isClearable
                                        />
                                    )}
                                />
                                {errors.establishment_course?.message && (<p className="text-red-600 text-sm mt-1">{errors.establishment_course.message}</p>)}
                            </>
                        )}
                    </div>

                    {/* Select de usuario */}
                    <div className="col-span-2 md:col-span-1 items-center mb-4">
                        {!isCourseSelected && (
                            <>
                                <label htmlFor="curso" className="font-semibold">Seleccione un usuario: </label>
                                <Controller
                                    control={control}
                                    name="user_destiny"
                                    render={({ field: { onChange, value, name, ref } }) => (
                                        <Select
                                            placeholder="Seleccione usuario (opcional)"
                                            getOptionValue={(option) => option.id.toString()}
                                            getOptionLabel={(option) => option.firstname + " " + option.first_lastname}
                                            value={userEstablishment.find((e) => e.id === value)}
                                            options={userEstablishment}
                                            onChange={handleUserChange} // Usar la nueva función
                                            menuPortalTarget={document.body}
                                            loadingMessage={() => "Cargando opciones..."}
                                            isLoading={userEstablishment.length === 0}
                                            isClearable
                                        />
                                    )}
                                />
                                {errors.user_destiny?.message && (<p className="text-red-600 text-sm mt-1">{errors.user_destiny.message}</p>)}
                            </>
                        )}
                    </div>

                    <div className="col-span-2 md:col-span-1 mb-4 my-auto">
                        <input type="file" id="fileInput" multiple {...register("document", { setValueAs: (value) => value === "" ? undefined : value })}
                            className="file-input file-input-primary w-full" />
                        {errors.document?.message && (<p className="text-red-600 text-sm mt-1">{errors.document.message}</p>)}
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="descripcion" className="font-semibold">Descripción del archivo:</label>
                        <textarea className="textarea textarea-primary w-full bg-white" placeholder="ingrese una breve descripcion.." {...register("descriptionDoc", { setValueAs: (value) => value === "" ? undefined : value })} />
                        {errors.descriptionDoc?.message && (<p className="text-red-600 text-sm mt-1">{errors.descriptionDoc.message}</p>)}
                    </div>

                    <div className="col-span-2">
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-outline">
                            {isSubmitting ? 'Subiendo...' : 'Guardar'}
                        </button>
                    </div>
                </form >
                <DocumentosCreados
                    establishmentId={user.establishment.id}
                    userId={user.id}
                />
                <DocumentosRecibidos
                    establishmentId={user.establishment.id}
                    userId={user.id}
                />
                <DocumentosEstablecimiento
                    establishmentId={user.establishment.id}
                    userId={user.id}
                />
                <DocumentosCurso
                    establishmentId={user.establishment.id}
                    userId={user.id}
                    userCourses={user.establishment_courses}
                />
            </>
        )
    }

    if (GetRole() === "Authenticated" && (user.tipo === 'alumno')) {
        return (
            <>
                <DocumentosAlumno />
            </>)
    }



}