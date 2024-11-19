import WarningAlert from "@/components/alerts/warningAlert";
import { data } from "@/components/encargado/grafico1";
import { api_getAllUserByEstablishment, api_getCoursesByUserSinPag, api_getDocumentsAut, api_getDocumentsByEstablishment2, api_getDocumentsByUserDestinity2, api_getDocumentUserCreated, api_getOneCourse, api_getOneUser, api_postDocument, api_putDocument, api_uploadFiles } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { ArrowDownTrayIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Button } from "react-daisyui";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { saveAs } from 'file-saver';
import { TrashIcon } from "@heroicons/react/24/outline";
import { Menu } from '@headlessui/react'
import { getFile } from "../../services/images.service";
import router from "next/router";
import Select from "react-select";
import metaI from "@/interfaces/meta.interface";
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
    establishment_authenticateds: {
        name: string;
        id: number;
    }[]
    courses: {
        id: number;
    }[]
    canUploadDoc: boolean;
    documents: {
        id: number;
        descriptionDoc: string;
    }[]
}

interface IDocument {
    id: number;
    attributes: {
        Eliminado: boolean;
        courseId: {
            data: {
                id: number;
                attributes: {
                    establishment_courses: {
                        data: {
                            id: number;
                            attributes: {
                                Letter: string;
                                Grade: string;
                            }
                        }[]
                    }
                }
            }
        }
        descriptionDoc: string;
        document: {
            data: {
                attributes: {
                    createdAt: Date;
                    url: string;
                    name: string;
                }
                id: number;
            }[]
        }
        establishmentId: {
            data: {
                attributes: {
                    name: string;
                }
                id: number;
            }
        }
        userId: {
            data: {
                id: number;
                attributes: {
                    firstname: string;
                    first_lastname: string;
                }
            }
        }
        user_destiny: {
            data: {
                id: number;
                attributes: {
                    firstname: string;
                    first_lastname: string;
                }
            }
        }
    }
}

interface FormValues {
    descriptionDoc: string;
    userId: number;
    establishmentId: number;
    courseId?: number;
    document: FileList;
    user_destiny?: number;
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

export default function Index() {
    const { user, GetRole } = useUserStore();
    const [dataUser, setDataUser] = useState<IUser>();

    const fetchData = async () => {
        try {
            const userData = await api_getOneUser(user.id)
            setDataUser(userData.data[0])
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        if (!user || user.id == 0) return;
        fetchData()
    }, [user]);


    const [userEstablishment, setUserEstablishment] = useState<IUser[]>([]);
    const getAllUserByEstablishment = async () => {
        try {
            const data = await api_getAllUserByEstablishment(user.establishment.id, user.id);
            setUserEstablishment(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (!user || user.id == 0) return;
        // getAllUserByEstablishment();
    }, [user]);

    const [documentCreate, setDocumentCreate] = useState<IDocument[]>([]);
    const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
    const dataDocumentByCreate = async () => {
        try {
            const data = await api_getDocumentUserCreated(user.establishment.id, user.id, metaData.page);
            setDocumentCreate(data.data.data);
            setMetaData(data.data.meta.pagination);

            if (data.data.data.length === 0 && metaData.page > 1) {
                updatePage(metaData.page - 1); // Retrocede a la página anterior
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        if (!user || user.id == 0) return;
        dataDocumentByCreate()
    }, [user, metaData.page]);

    const [documentEstablishment, setDocumentEstablishment] = useState<IDocument[]>([]);
    const [metaData2, setMetaData2] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
    const dataDocumentByEstablishment = async () => {
        try {
            const data = await api_getDocumentsByEstablishment2(user.establishment.id, user.id, metaData2.page);
            setDocumentEstablishment(data.data.data);
            setMetaData2(data.data.meta.pagination);

            if (data.data.data.length === 0 && metaData.page > 1) {
                updatePage2(metaData.page - 1); // Retrocede a la página anterior
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        if (!user || user.id == 0) return;
        dataDocumentByEstablishment()
    }, [user, metaData2.page]);

    const [documentDestiny, setDocumentDestiny] = useState<IDocument[]>([]);
    const [metaData4, setMetaData4] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
    const dataDocumentByDestiny = async () => {
        try {
            const data = await api_getDocumentsByUserDestinity2(user.establishment.id, user.id, metaData2.page);
            setDocumentDestiny(data.data.data);
            setMetaData4(data.data.meta.pagination);


            if (data.data.data.length === 0 && metaData.page > 1) {
                updatePage4(metaData.page - 1); // Retrocede a la página anterior
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        if (!user || user.id == 0) return;
        dataDocumentByDestiny()
    }, [user, metaData4.page]);


    const [documents, setDocuments] = useState<IDocument[]>([])
    const [displayedDocuments, setDisplayedDocuments] = useState<IDocument[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const documentsPerPage = 5;

    const loadMoreDocuments = () => {
        const nextPage = currentPage + 1
        const startIndex = (nextPage - 1) * documentsPerPage
        const endIndex = startIndex + documentsPerPage
        const newDocuments = documents.slice(startIndex, endIndex)
        setDisplayedDocuments([...displayedDocuments, ...newDocuments])
        setCurrentPage(nextPage)
    }
    const [dataDocuments,setDataDocuments] = useState({})
    const fetchOneCourse = async () => {
        try {
            if (!dataUser) return;
            let dataE = await api_getOneCourse(dataUser.courses[0].id)
            const data = await api_getDocumentsAut(dataUser.establishment_authenticateds[0].id, dataUser.id,dataE.data.data.id );
            dataE.data.data.attributes.documents.data = data.data.data
            console.log(dataE.data.data.attributes);
            setDataDocuments(dataE.data.data);
        } catch (error) {
            console.error('Error al obtener documentos:', error)
        }
    }

    useEffect(() => {
        if (dataUser && GetRole() === "Authenticated" && (dataUser.tipo === 'alumno' || dataUser.tipo === 'apoderado')) {
            fetchOneCourse()
        }
    }, [dataUser])
    
    const getDestinatario = (doc: IDocument) => {
        return doc.attributes.user_destiny?.data
            ? `${doc.attributes.user_destiny.data.attributes.firstname} ${doc.attributes.user_destiny.data.attributes.first_lastname}`
            : doc.attributes.courseId?.data
                ? `${doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Grade} ${doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Letter}`
                : doc.attributes.establishmentId?.data
                    ? doc.attributes.establishmentId.data.attributes.name
                    : 'No especificado';
    };

    const DocumentSchema = z.object({
        descriptionDoc: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' })
            .min(1, { message: 'La descripción no puede estar vacía' }),
        userId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        establishmentId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        courseId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' }).optional(),
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
        user_destiny: z.number().optional()
    });

    const { register, watch, setValue, control, reset, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(DocumentSchema),
        defaultValues: {
            userId: user.id,
            establishmentId: user.establishment?.id || 0,
            descriptionDoc: '',
            courseId: undefined,
            user_destiny: undefined,
            document: undefined,
        },
    });

    useEffect(() => {
        if (!user || user.id == 0) return;
        setValue('userId', user.id);
        setValue('establishmentId', user.establishment?.id || 0);
    }, [user, setValue]);

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
                courseId: data.courseId,
                document: fileArray, // Enviar el array de archivos
                user_destiny: data.user_destiny,
            };

            // Crear el documento en Strapi
            const response = await api_postDocument(documentData);

            console.log(response);

            toast.success('Documentos subidos con éxito.');
            dataDocumentByCreate()
        } catch (error) {
            console.error('Error al subir los documentos:', error);
            toast.error('Ha ocurrido un error inesperado.')
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDocument = async (documentId: number) => {
        try {
            const response = await api_putDocument(documentId, true); // Establece 'Eliminado' en true
            // Aquí puedes manejar el estado de tu aplicación, como actualizar la lista de documentos
            toast.success('Documento eliminado exitosamente.')
            dataDocumentByCreate()
        } catch (error) {
            console.error('Error al eliminar el documento:', error);
        }
    };

    const updatePage = (number: number) => {
        metaData.page = number;
        metaData.pageCount = metaData.pageCount
        metaData.pageSize = metaData.pageSize
        metaData.total = metaData.total
        setMetaData(metaData);
        dataDocumentByCreate()
    }

    const updatePage2 = (number: number) => {
        metaData2.page = number;
        metaData2.pageCount = metaData.pageCount
        metaData2.pageSize = metaData.pageSize
        metaData2.total = metaData.total
        setMetaData2(metaData2);
        dataDocumentByEstablishment();
    }

    const updatePage4 = (number: number) => {
        metaData4.page = number;
        metaData4.pageCount = metaData.pageCount
        metaData4.pageSize = metaData.pageSize
        metaData4.total = metaData.total
        setMetaData4(metaData4);
        dataDocumentByDestiny()
    }

    // Estado para controlar la visibilidad de los selects
    const [isCourseSelected, setIsCourseSelected] = useState(false);
    const [isUserSelected, setIsUserSelected] = useState(false);

    // Función para manejar el cambio en el Select de cursos
    const handleCourseChange = (val: any) => {
        if (val) {
            setValue("courseId", Number(val?.id));
            setIsCourseSelected(true); // Curso seleccionado, ocultar usuario
            setIsUserSelected(false); // Reiniciar el estado de usuario
        } else {
            // Si se elimina la selección, restablecer ambos
            setValue("courseId", undefined);
            setIsCourseSelected(false);
        }
    };

    useEffect(() => {
        console.log(errors)
    }, [errors])
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

    const [courseByUser, setCourseByUser] = useState<ICourse[]>([]);
    const getCoursesByUser = async () => {
        try {
            const data = await api_getCoursesByUserSinPag(user.establishment.id, user.id)
            setCourseByUser(data.data.data);
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (!user || user.id == 0) return;
        getCoursesByUser()
    }, [user])

    if ((GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor") && dataUser?.canUploadDoc == true && courseByUser.length === 0) {
        return (
            <>
                <Head>
                    <title>Documentos</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                </Head>
                <div className="flex flex-col items-center">
                    <WarningAlert message={'Sin cursos asignados.'} />
                </div>
            </>
        );
    }

    if ((GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor") && dataUser?.canUploadDoc == true) {

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
                                    name="courseId"
                                    render={({ field: { onChange, value, name, ref } }) =>
                                    (
                                        <Select placeholder="Seleccione curso"
                                            getOptionValue={(option) => option.id.toString()}
                                            getOptionLabel={(option) => option.attributes.establishment_courses.data[0].attributes.Grade + " " + option.attributes.establishment_courses.data[0].attributes.Letter}
                                            value={courseByUser.find((e) => e.id === value)}
                                            options={courseByUser}
                                            onChange={handleCourseChange}
                                            menuPortalTarget={document.body}
                                            loadingMessage={() => "Cargando opciones..."}
                                            isLoading={courseByUser.length === 0}
                                            isClearable
                                        />
                                    )}
                                />
                                {errors.courseId?.message && (<p className="text-red-600 text-sm mt-1">{errors.courseId.message}</p>)}
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
                        <Button type="submit" disabled={isSubmitting} className="btn btn-primary btn-outline">
                            {isSubmitting ? 'Subiendo...' : 'Guardar'}
                        </Button>
                    </div>
                </form >

                <div className="border rounded-lg shadow-md p-4 items-center mb-4">
                    <div className="flex flex-col lg:flex-row">
                        <p className="font-bold text-2xl mb-2">Documentos Creados: </p>
                    </div>
                    {documentCreate.length > 0 ?
                        (<>
                            {documentCreate.map((doc, index) => (
                                <>
                                    <div key={index} className="grid lg:grid-cols-3 gap-4 border rounded-md border-gray-100 hover:border-2 hover:border-primary p-2 mb-1">
                                        <div className="flex flex-col text-left">
                                            <p><span className="font-semibold">Descripcion: </span>{doc.attributes.descriptionDoc}</p>
                                            {!doc.attributes.courseId.data && (
                                                <></>
                                            )}
                                            {doc.attributes.courseId.data && (
                                                <p><span className="font-semibold">Curso: </span>{doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Grade + " " + doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Letter}</p>
                                            )}
                                            {!doc.attributes.user_destiny.data && (
                                                <></>
                                            )}
                                            {doc.attributes.user_destiny.data && (
                                                <p><span className="font-semibold">Destinatario: </span>{doc.attributes.user_destiny.data.attributes.firstname + " " + doc.attributes.user_destiny.data.attributes.first_lastname}</p>
                                            )}
                                        </div>
                                        <div className="grid lg:grid-cols-3">
                                            {doc.attributes.document.data.map((archivo, index) => (<>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-primary mb-2 lg:mb-0 lg:mr-2"
                                                    onClick={() => {
                                                        saveAs(getFile(archivo.attributes.url), archivo.attributes.name);
                                                    }}
                                                >
                                                    <ArrowDownTrayIcon className="h-3 w-3" aria-hidden="true" />
                                                    Archivo {index + 1}
                                                </button>

                                            </>))}
                                        </div>
                                        <div className="flex flex-row justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDocument(doc.id)}
                                            >
                                                <TrashIcon className="h-4 w-4 text-red-500 mr-2" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ))}
                            <PaginatorCreator metadata={metaData} setMetaData={updatePage} />
                        </>)
                        :
                        (
                            <div className="flex flex-col items-center">
                                <WarningAlert message={'Sin documentos'} />
                            </div>
                        )}
                </div>

                <div className="border rounded-lg shadow-md p-4 items-center w-full mb-4">
                    <div className="flex flex-col lg:flex-row">
                        <p className="font-bold text-2xl mb-2">Documentos Recibidos: </p>
                    </div>

                    {documentDestiny.length > 0 ?
                        (<>
                            {documentDestiny.map((doc, index) => (
                                <>
                                    <div key={index} className="grid lg:grid-cols-3 gap-4 border border-gray-100 hover:border-2 hover:border-primary p-2 mb-1">
                                        <div className="flex flex-col text-left">
                                            <p><span className="font-semibold">Descripcion: </span>{doc.attributes.descriptionDoc}</p>
                                            {!doc.attributes.courseId.data && (
                                                <></>
                                            )}
                                            {doc.attributes.courseId.data && (
                                                <p><span className="font-semibold">Curso: </span>{doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Grade + " " + doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Letter}</p>
                                            )}
                                            {!doc.attributes.userId.data && (
                                                <></>
                                            )}
                                            {doc.attributes.userId.data && (
                                                <p><span className="font-semibold">creador: </span>{doc.attributes.userId.data.attributes.firstname + " " + doc.attributes.userId.data.attributes.first_lastname}</p>
                                            )}
                                        </div>
                                        <div className="grid lg:grid-cols-3">
                                            {doc.attributes.document.data.map((archivo, index) => (<>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-primary mb-2 lg:mb-0 lg:mr-2"
                                                    onClick={() => {
                                                        saveAs(getFile(archivo.attributes.url), archivo.attributes.name);
                                                    }}
                                                >
                                                    <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                    Archivo {index + 1}
                                                </button>

                                            </>))}
                                        </div>
                                    </div>
                                </>
                            ))}
                            <PaginatorDestiny metadata4={metaData4} setMetaData4={updatePage4} />
                        </>)
                        :
                        (
                            <div className="flex flex-col items-center">
                                <WarningAlert message={'Sin documentos'} />
                            </div>
                        )}
                </div>

                <div className="border rounded-lg shadow-md p-4 items-center w-full mb-4">
                    <div className="flex flex-col lg:flex-row">
                        <p className="font-bold text-2xl mb-2">Documentos Establecimiento: </p>
                    </div>

                    {documentEstablishment.length > 0 ?
                        (<>
                            {documentEstablishment.map((doc, index) => (
                                <>
                                    <div key={index} className="grid lg:grid-cols-3 gap-4 border border-gray-100 hover:border-2 hover:border-primary p-2 mb-1">
                                        <div className="flex flex-col text-left">
                                            <p><span className="font-semibold">Descripcion: </span>{doc.attributes.descriptionDoc}</p>
                                            {!doc.attributes.courseId.data && (
                                                <></>
                                            )}
                                            {doc.attributes.courseId.data && (
                                                <p><span className="font-semibold">Curso: </span>{doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Grade + " " + doc.attributes.courseId.data.attributes.establishment_courses.data[0]?.attributes.Letter}</p>
                                            )}
                                            {!doc.attributes.userId.data && (
                                                <></>
                                            )}
                                            {doc.attributes.userId.data && (
                                                <p><span className="font-semibold">Creador: </span>{doc.attributes.userId.data.attributes.firstname + " " + doc.attributes.userId.data.attributes.first_lastname}</p>
                                            )}

                                        </div>
                                        <div className="grid lg:grid-cols-3">
                                            {doc.attributes.document.data.map((archivo, index) => (<>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-primary mb-2 lg:mb-0 lg:mr-2"
                                                    onClick={() => {
                                                        saveAs(getFile(archivo.attributes.url), archivo.attributes.name);
                                                    }}
                                                >
                                                    <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                    Archivo {index + 1}
                                                </button>

                                            </>))}
                                        </div>
                                    </div>
                                </>
                            ))}
                            <PaginatorEstablishment metadata2={metaData2} setMetaData2={updatePage2} />
                        </>)
                        :
                        (
                            <div className="flex flex-col items-center">
                                <WarningAlert message={'Sin documentos'} />
                            </div>
                        )}
                </div>

            </>
        );
    }



    if ((GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor") && dataUser?.canUploadDoc == false) {

        return (
            <>
                <Head>
                    <title>Documentos</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                </Head>
                <div className="flex flex-col items-center">
                    <WarningAlert message={'Sin permisos, contacte con el administrador.'} />
                </div>
            </>
        )
    }

    if (GetRole() === "Authenticated" && (dataUser?.tipo === 'alumno' || dataUser?.tipo === 'apoderado')) {

        if (!documents || !dataUser) {
            return (
                <>
                    <Head>
                        <title>Documentos</title>
                        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    </Head>
                    <div className="flex flex-col items-center">
                        <WarningAlert message={'Cargando documentos del usuario...'} />
                    </div>
                </>
            )
        }
        if (dataUser.establishment_authenticateds.length === 0) {
            return (
                <>
                    <Head>
                        <title>Documentos</title>
                        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    </Head>
                    <div className="flex flex-col items-center">
                        <WarningAlert message={'No tienes un establecimiento asignado.'} />
                    </div>
                </>
            )
        }
        if (dataUser.courses.length === 0) {
            return (
                <>
                    <Head>
                        <title>Documentos</title>
                        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    </Head>
                    <div className="flex flex-col items-center">
                        <WarningAlert message={'Aun no tienes un curso asignado.'} />
                    </div>
                </>
            )
        }
        if (documents.length === 0 && documents == undefined) {
            return (
                <>
                    <Head>
                        <title>Documentos</title>
                        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    </Head>
                    <div className="flex flex-col items-center">
                        <WarningAlert message={'Aun no hay documentos para tu curso.'} />
                    </div>
                </>
            )
        }
        return (
            <>
                <Head>
                    <title>Documentos</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                </Head>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h2 className="text-3xl font-bold mb-6 text-center text-black">Mis Documentos Disponibles</h2>
                    <div className="overflow-x-auto shadow-xl rounded-lg">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="w-full border-collapse bg-white">
                                    <thead>
                                        <tr className="bg-green-700 text-white">
                                        
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Asunto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subido por</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Destinado para</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Archivo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-green-200 z-0">
                                        {displayedDocuments.map((doc, index) => (
                                            <tr key={index} className="hover:bg-green-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.attributes.descriptionDoc}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.attributes.userId.data.attributes.firstname + " " + doc.attributes.userId.data.attributes.first_lastname}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getDestinatario(doc)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(doc.attributes.document?.data[0].attributes.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {doc.attributes.document?.data.length === 1 ? (
                                                        <button
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                            onClick={() => {
                                                                saveAs(getFile(doc.attributes.document.data[0].attributes.url), doc.attributes.document.data[0].attributes.name);
                                                            }}
                                                        >
                                                            <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                            Descargar Archivo
                                                        </button>
                                                    ) : (
                                                        <Menu as="div" className="relative inline-block text-left">
                                                            <Menu.Button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                                                                <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                                Descargar Archivos
                                                                <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                                                            </Menu.Button>
                                                            <Menu.Items className="absolute z-50 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">                                                                <div className="px-1 py-1">
                                                                {doc.attributes.document?.data.map((archivo, index) => (
                                                                    <Menu.Item key={index}>
                                                                        {({ active }) => (
                                                                            <button
                                                                                className={`${active ? 'bg-green-500 text-white' : 'text-gray-900'
                                                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                                                onClick={() => {
                                                                                    saveAs(getFile(archivo.attributes.url), archivo.attributes.name);
                                                                                }}
                                                                            >
                                                                                <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                                                Archivo {index + 1}
                                                                            </button>
                                                                        )}
                                                                    </Menu.Item>
                                                                ))}
                                                            </div>
                                                            </Menu.Items>
                                                        </Menu>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {displayedDocuments.length < documents.length && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={loadMoreDocuments}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                            >
                                Cargar más documentos
                            </button>
                        </div>
                    )}
                </div >
            </>
        );

    }
}

function PaginatorCreator({ metadata, setMetaData }: { metadata: metaI, setMetaData: (numero: number) => void }) {
    const changePage = async (number: number) => {
        if (number > metadata.pageCount) return;
        if (number <= 0) return;
        setMetaData(number);
    }
    return (
        <>
            <Head>
                <title>Documentos</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <a
                        onClick={() => changePage(metadata.page - 1)}
                        className=" inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Pagina Anterior
                    </a>
                    <a
                        onClick={() => changePage(metadata.page + 1)}
                        className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Proxima Pagina
                    </a>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{Math.min(Number(metadata.pageSize) * metadata.page, metadata.total)}</span> de{" "}
                            <span className="font-medium">{metadata.total}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav
                            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                            aria-label="Pagination"
                        >
                            <a
                                onClick={() => changePage(metadata.page - 1)}
                                className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </a>
                            {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
                            {[...Array.from(Array(metadata.pageCount).keys())].map((num, i) => (
                                <a
                                    key={i}
                                    onClick={() => changePage(num + 1)}
                                    aria-current="page"
                                    className={` cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 md:inline-flex ${(num + 1) === metadata.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''}`}
                                >
                                    {num + 1}
                                </a>
                            ))}
                            <a
                                onClick={() => changePage(metadata.page + 1)}
                                className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}

function PaginatorEstablishment({ metadata2, setMetaData2 }: { metadata2: metaI, setMetaData2: (numero: number) => void }) {
    const changePage2 = async (number: number) => {
        if (number > metadata2.pageCount) return;
        if (number <= 0) return;
        setMetaData2(number);
    }
    return (
        <>
            <Head>
                <title>Documentos</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <a
                        onClick={() => changePage2(metadata2.page - 1)}
                        className=" inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Pagina Anterior
                    </a>
                    <a
                        onClick={() => changePage2(metadata2.page + 1)}
                        className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Proxima Pagina
                    </a>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{Math.min(Number(metadata2.pageSize) * metadata2.page, metadata2.total)}</span> de{" "}
                            <span className="font-medium">{metadata2.total}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav
                            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                            aria-label="Pagination"
                        >
                            <a
                                onClick={() => changePage2(metadata2.page - 1)}
                                className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </a>
                            {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
                            {[...Array.from(Array(metadata2.pageCount).keys())].map((num, i) => (
                                <a
                                    key={i}
                                    onClick={() => changePage2(num + 1)}
                                    aria-current="page"
                                    className={` cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 md:inline-flex ${(num + 1) === metadata2.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''}`}
                                >
                                    {num + 1}
                                </a>
                            ))}
                            <a
                                onClick={() => changePage2(metadata2.page + 1)}
                                className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}

function PaginatorDestiny({ metadata4, setMetaData4 }: { metadata4: metaI, setMetaData4: (numero: number) => void }) {
    const changePage4 = async (number: number) => {
        if (number > metadata4.pageCount) return;
        if (number <= 0) return;
        setMetaData4(number);
    }
    return (
        <>
            <Head>
                <title>Documentos</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <a
                        onClick={() => changePage4(metadata4.page - 1)}
                        className=" inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Pagina Anterior
                    </a>
                    <a
                        onClick={() => changePage4(metadata4.page + 1)}
                        className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Proxima Pagina
                    </a>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{Math.min(Number(metadata4.pageSize) * metadata4.page, metadata4.total)}</span> de{" "}
                            <span className="font-medium">{metadata4.total}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav
                            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                            aria-label="Pagination"
                        >
                            <a
                                onClick={() => changePage4(metadata4.page - 1)}
                                className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </a>
                            {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
                            {[...Array.from(Array(metadata4.pageCount).keys())].map((num, i) => (
                                <a
                                    key={i}
                                    onClick={() => changePage4(num + 1)}
                                    aria-current="page"
                                    className={` cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 md:inline-flex ${(num + 1) === metadata4.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''}`}
                                >
                                    {num + 1}
                                </a>
                            ))}
                            <a
                                onClick={() => changePage4(metadata4.page + 1)}
                                className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}