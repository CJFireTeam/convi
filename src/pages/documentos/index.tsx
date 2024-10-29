import WarningAlert from "@/components/alerts/warningAlert";
import { data } from "@/components/encargado/grafico1";
import { api_getAllUserByEstablishment, api_getDocumentsByCourse, api_getDocumentsByEstablishment, api_getDocumentsByUserDestinity, api_getDocumentUserCreated, api_getOneUser, api_postDocument, api_putDocument, api_uploadFiles } from "@/services/axios.services";
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
                    grade: string;
                    letter: string;
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

export default function Index() {
    const { user, GetRole } = useUserStore();
    const [dataUser, setDataUser] = useState<IUser>();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await api_getOneUser(user.id)
                setDataUser(userData.data[0])
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [user]);


    const [userEstablishment, setUserEstablishment] = useState<IUser[]>([]);
    const getAllUserByEstablishment = async () => {
        try {
            const data = await api_getAllUserByEstablishment(user.establishment.id);
            setUserEstablishment(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllUserByEstablishment();
    }, [user]);

    const [documentCreate, setDocumentCreate] = useState<IDocument[]>([]);
    const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
    const dataDocumentByCreate = async () => {
        try {
            const data = await api_getDocumentUserCreated(user.establishment.id, user.id, metaData.page);
            setDocumentCreate(data.data.data);
            setMetaData(data.data.meta.pagination);
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        dataDocumentByCreate()
    }, [user]);

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

    useEffect(() => {
        const fetchDocuments = async () => {
            if (dataUser) {
                try {
                    const [establishmentDocs, courseDocs, userDocs] = await Promise.all([
                        api_getDocumentsByEstablishment(user.establishment.id),
                        dataUser.courses.length > 0
                            ? api_getDocumentsByCourse(user.establishment.id, dataUser.courses[0].grade, dataUser.courses[0].letter)
                            : Promise.resolve({ data: { data: [] } }),
                        api_getDocumentsByUserDestinity(user.establishment.id, user.id)
                    ])

                    const allDocs = [
                        ...establishmentDocs.data.data,
                        ...courseDocs.data.data,
                        ...userDocs.data.data
                    ]

                    setDocuments(allDocs)
                    setDisplayedDocuments(allDocs.slice(0, documentsPerPage))
                } catch (error) {
                    console.error('Error al obtener documentos:', error)
                }
            }
        }

        if (dataUser) {
            fetchDocuments()
        }
    }, [user, dataUser])

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
    });

    useEffect(() => {
        setValue('userId', user.id);
        setValue('establishmentId', user.establishment.id || 0);
    }, [user, setValue]);

    const customReset = () => {
        reset({
            descriptionDoc: '',
            courseId: undefined,
            user_destiny: undefined,
            document: undefined,
        }, {
            keepValues: true,
            keepDirtyValues: false,
        });
    };


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
            customReset();
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

    if (GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor" && dataUser?.canUploadDoc == true && dataUser.courses.length == 0) {
        return (
            <div className="flex flex-col items-center">
                <WarningAlert message={'Sin cursos asignados.'} />
            </div>
        );
    }

    if (GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor" && dataUser?.canUploadDoc == true) {

        return (
            <>
                <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-1 gap-2 mx-auto mb-4 w-full border rounded-lg shadow-md p-4 items-center text-center">
                    <div>
                        <span className="text-2xl font-bold">Subir Documentos:</span>
                    </div>

                    <div className="flex flex-col items-center mb-4">
                        <label htmlFor="curso" className="font-semibold">Seleccione un curso: </label>
                        < Controller
                            control={control}
                            name="courseId"
                            render={({ field: { onChange, value, name, ref } }) => (
                                <Select
                                    placeholder="Seleccione curso (opcional)"
                                    getOptionValue={(option) => option.id.toString()}
                                    getOptionLabel={(option) => option.grade + " " + option.letter}
                                    value={dataUser?.courses.find((e) => e.id === value) || null}
                                    options={dataUser?.courses}
                                    onChange={(val) =>
                                        setValue("courseId", Number(val?.id))
                                    }
                                    menuPortalTarget={document.body}
                                    loadingMessage={() => "Cargando opciones..."}
                                    isLoading={dataUser?.courses.length === 0}
                                    isClearable
                                />
                            )}
                        />
                        {errors.courseId?.message && (<p className="text-red-600 text-sm mt-1">{errors.courseId.message}</p>)}
                    </div>

                    <div className="flex flex-col items-center mb-4">
                        <label htmlFor="curso" className="font-semibold">Seleccione un usuario: </label>
                        < Controller
                            control={control}
                            name="user_destiny"
                            render={({ field: { onChange, value, name, ref } }) => (
                                <Select
                                    placeholder="Seleccione usuario (opcional)"
                                    getOptionValue={(option) => option.id.toString()}
                                    getOptionLabel={(option) => option.firstname + " " + option.first_lastname}
                                    value={userEstablishment.find((e) => e.id === value)}
                                    options={userEstablishment}
                                    onChange={(val) =>
                                        setValue("user_destiny", Number(val?.id))
                                    }
                                    menuPortalTarget={document.body}
                                    loadingMessage={() => "Cargando opciones..."}
                                    isLoading={userEstablishment.length === 0}
                                    isClearable
                                />
                            )}
                        />
                        {errors.user_destiny?.message && (<p className="text-red-600 text-sm mt-1">{errors.user_destiny.message}</p>)}
                    </div>

                    <div className="mb-4">
                        <input type="file" id="fileInput" multiple {...register("document", { setValueAs: (value) => value === "" ? undefined : value })}
                            className="file-input file-input-primary w-full lg:w-auto" />
                        {errors.document?.message && (<p className="text-red-600 text-sm mt-1">{errors.document.message}</p>)}
                    </div>

                    <div className="">
                        <label htmlFor="descripcion" className="font-semibold">Descripción del archivo:</label>
                        <textarea className="textarea textarea-primary w-full bg-white" placeholder="ingrese una breve descripcion.." {...register("descriptionDoc", { setValueAs: (value) => value === "" ? undefined : value })} />
                        {errors.descriptionDoc?.message && (<p className="text-red-600 text-sm mt-1">{errors.descriptionDoc.message}</p>)}
                    </div>

                    <div className="">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Subiendo...' : 'Guardar'}
                        </Button>
                    </div>
                </form>

                <div className="border rounded-lg shadow-md p-4 items-center">
                    <div className="flex flex-col md:flex-row">
                        <p className="font-bold text-2xl mb-2">Documentos Creados: </p>
                    </div>
                    {documentCreate.length > 0 ?
                        (<>
                            {documentCreate.map((doc, index) => (
                                <>
                                    <div key={index} className="grid md:grid-cols-3 gap-4 border border-gray-100 hover:border-2 hover:border-primary p-2 mb-1">
                                        <div className="flex flex-col items-center">
                                            <p><span className="font-semibold">Descripcion: </span>{doc.attributes.descriptionDoc}</p>
                                            {doc.attributes.courseId.data && (
                                                <p><span className="font-semibold">Curso: </span>{doc.attributes.courseId.data?.attributes.grade + " " + doc.attributes.courseId.data?.attributes.letter}</p>
                                            )}
                                            {doc.attributes.user_destiny.data && (
                                                <p><span className="font-semibold">Destinatario: </span>{doc.attributes.user_destiny.data.attributes.firstname + " " + doc.attributes.user_destiny.data.attributes.first_lastname}</p>
                                            )}
                                            {!doc.attributes.courseId.data && (
                                                <></>
                                            )}
                                            {!doc.attributes.user_destiny.data && (
                                                <></>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center lg:flex-row">
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
                <div className="border rounded-lg shadow-md p-4 items-center">
                    {}
                    <div className="flex flex-col md:flex-row">
                        <p className="font-bold text-2xl mb-2">Documentos Recibidos: </p>
                    </div>
                </div>
            </>
        );
    }



    if (GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor" && dataUser?.canUploadDoc == false) {

        return (
            <>
                <div className="grid grid-cols-3 gap-4 mx-auto">
                    <div className="col-start-2 col-end-3">
                        <WarningAlert message={'No tienes permisos para editar porfavor contacta con el administrador'} />
                    </div>
                </div>
            </>
        );
    }

    if (GetRole() === "Authenticated" && dataUser?.tipo === 'alumno') {

        if (documents.length != 0) {
            // Lógica a ejecutar si existen documentos correspondientes
            return (
                <div className="w-full max-w-4xl mx-auto p-4">
                    <h2 className="text-2xl font-bold mb-4 text-center text-black">Mis Documentos Disponibles</h2>
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="w-full border-collapse bg-white">
                            <thead>
                                <tr className="bg-green-700 text-white">
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Asunto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subido por</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Archivo</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-green-200">
                                {displayedDocuments.map((doc) => (
                                    <tr className="hover:bg-green-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.attributes.descriptionDoc}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.attributes.userId.data.attributes.firstname + " " + doc.attributes.userId.data.attributes.first_lastname}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(doc.attributes.document.data[0].attributes.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {doc.attributes.document.data.length === 1 ? (
                                                <button
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                    onClick={() => {
                                                        saveAs(process.env.NEXT_PUBLIC_BACKEND_ACCES + doc.attributes.document.data[0].attributes.url, doc.attributes.document.data[0].attributes.name);
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
                                                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <div className="px-1 py-1">
                                                            {doc.attributes.document.data.map((archivo, index) => (
                                                                <Menu.Item key={index}>
                                                                    {({ active }) => (
                                                                        <button
                                                                            className={`${active ? 'bg-green-500 text-white' : 'text-gray-900'
                                                                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                                            onClick={() => {
                                                                                saveAs(process.env.NEXT_PUBLIC_BACKEND_ACCES + archivo.attributes.url, archivo.attributes.name);
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
            );
        } else {
            // Lógica a ejecutar si no existen documentos correspondientes
            return <div className="flex flex-col items-center">
                <WarningAlert message={'No hay documentos para tu curso.'} />
            </div>

        }


    }
}

function PaginatorCreator({ metadata, setMetaData }: { metadata: metaI, setMetaData: (numero: number) => void }) {
    const changePage = async (number: number) => {
        if (number > metadata.pageCount) return;
        if (number <= 0) return;
        setMetaData(number);
    }
    return (
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
    );
}