import WarningAlert from "@/components/alerts/warningAlert";
import { data } from "@/components/encargado/grafico1";
import { api_getAllDocumentbyEstablishment, api_getOneUser, api_postDocument, api_uploadFiles } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Button } from "react-daisyui";
import { useForm } from "react-hook-form";
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
        descriptionDoc: string;
        courseId: {
            data: {
                id: 3;
                attributes: {
                    grade: string;
                    letter: string;
                }
            }
        }
        userId: {
            data: {
                id: number;
            }
        }
        document: {
            data: {
                attributes: {
                    url: string;
                }
            }
        }
    }
}

interface FormValues {
    nameUser: string;
    lastNameUser: string;
    descriptionDoc: string;
    userId: number;
    establishmentId: number;
    courseId: number;
    document: FileList;
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
    }, [user.id]);

    const DocumentSchema = z.object({
        nameUser: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        lastNameUser: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        userId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        establishmentId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        courseId: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' }),
        descriptionDoc: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' })
            .min(1, { message: 'La descripción no puede estar vacía' }),
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
                    return files.length <= 5;
                }
                return true;
            }, "No se pueden subir más de 5 archivos"),
    });

    const { register, watch, setValue, control, reset, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(DocumentSchema),
    });

    useEffect(() => {
        setValue('nameUser', user.firstname);
        setValue('lastNameUser', user.first_lastname);
        setValue('userId', user.id);
        setValue('establishmentId', user.establishment.id);
    }, []);

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
                nameUser: data.nameUser,
                lastNameUser: data.lastNameUser,
                userId: data.userId,
                establishmentId: data.establishmentId,
                courseId: data.courseId,
                descriptionDoc: data.descriptionDoc,
                document: fileArray // Enviar el array de archivos
            };

            // Crear el documento en Strapi
            const response = await api_postDocument(documentData);

            toast.success('Documentos subidos con éxito.');
            reset();
        } catch (error) {
            console.error('Error al subir los documentos:', error);
            toast.error('Ha ocurrido un error inesperado.')
        } finally {
            setIsSubmitting(false);
        }
    };

    const [dataDocument, setDataDocument] = useState<IDocument[]>([]);

    useEffect(() => {
        const dataDocuments = async () => {
            try {
                const data = await api_getAllDocumentbyEstablishment(user.establishment.id);
                setDataDocument(data.data.data);
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        dataDocuments()
    }, []);

    const [filteredDocuments, setFilteredDocuments] = useState<IDocument[]>([]);
    useEffect(() => {
        if (dataDocument.length > 0 && dataUser) {
            const userDocuments = dataDocument.filter(doc => doc.attributes.userId.data.id === user.id);
            setFilteredDocuments(userDocuments);
        }
    }, [dataDocument, dataUser]);

    //const userCourseIdentifier = dataUser?.courses[0].grade + dataUser.courses[0].letter;

    // Filtra los documentos que coinciden con el curso del usuario
    const [matchingDocuments, setMatchingDocuments] = useState<IDocument[]>([]);

    useEffect(() => {
        console.log("data user curso id", dataUser?.courses[0].id)
        console.log("data user curso id", dataDocument.filter(doc => doc.attributes.courseId.data.id == dataUser?.courses[0].id))
        if (dataDocument.length > 0 && dataUser) {
            const userDocuments = dataDocument.filter(doc => doc.attributes.courseId.data.id === dataUser.courses[0].id);
            setMatchingDocuments(userDocuments);
        }
    }, [dataDocument, dataUser]);

    // const matchingDocuments = dataDocument.filter(doc => {
    //     const courseId = doc.attributes.courseId.data.attributes;
    //     const documentCourseIdentifier = courseId.grade + courseId.letter;
    //     //return documentCourseIdentifier === userCourseIdentifier;
    // });
    console.log("contenido de datadocument", dataDocument);
    console.log("contenido de matching", matchingDocuments);


    //select para mostrar la cantidad de curso que tienes y enviarle el id del course.
    //luego mostrarle a los alumnos al profe y encargado solo si tiene el nombre y letter del course
    if (GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor" && dataUser?.canUploadDoc == true && dataUser.courses.length == 0) {
        return (
            <div>
                <h1>Sin cursos asignados.</h1>
            </div>
        );
    }

    if (GetRole() === "admin" || GetRole() === "Encargado de Convivencia Escolar" || GetRole() === "Profesor" && dataUser?.canUploadDoc == true) {


        return (
            <>
                <div className="grid md:grid-cols-2 gap-2 mx-auto w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full border rounded-lg shadow-md p-4 items-center text-center">
                        <div>
                            <span className="text-2xl font-bold">Subir Documentos:</span>
                        </div>

                        <div className="flex flex-col items-center mb-4">
                            <label htmlFor="curso" className="font-semibold">Seleccion un curso: </label>
                            <select {...register('courseId', { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                                className="select select-primary">
                                <option value="" selected>Seleccione una opcion</option>
                                {dataUser?.courses.map((c, index) => (
                                    <option value={c.id} key={index}>{c.grade + " " + c.letter}</option>
                                ))}
                            </select>
                            {errors.courseId?.message && (<p className="text-red-600 text-sm mt-1">{errors.courseId.message}</p>)}
                        </div>

                        <div className="mb-4">
                            <input type="file" id="fileInput" multiple {...register("document", { setValueAs: (value) => value === "" ? undefined : value })}
                                className="file-input file-input-primary w-full lg:w-auto" />
                            {errors.document?.message && (<p className="text-red-600 text-sm mt-1">{errors.document.message}</p>)}
                        </div>

                        <div className="">
                            <label htmlFor="descripcion" className="font-semibold">Descripción del archivo:</label>
                            <textarea className="textarea textarea-primary w-full bg-white" {...register("descriptionDoc", { setValueAs: (value) => value === "" ? undefined : value })} />
                            {errors.descriptionDoc?.message && (<p className="text-red-600 text-sm mt-1">{errors.descriptionDoc.message}</p>)}
                        </div>

                        <div className="">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Subiendo...' : 'Guardar'}
                            </Button>
                        </div>
                    </form>

                    <div className="border rounded-lg shadow-md p-4 items-center">
                        {filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 border border-gray-100 hover:border-2 hover:border-primary p-2">
                                    <div className="col-span-4">
                                        <span className="font-semibold">{doc.attributes.descriptionDoc}</span>
                                    </div>
                                    <div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <h1>No hay documentos creados por este usuario.</h1>
                        )}
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

    if (GetRole() === "Authenticated" && dataUser?.tipo === 'alumno' && dataUser.courses.length > 0) {

        if (matchingDocuments.length == 0) {
            // Lógica a ejecutar si existen documentos correspondientes
            return (
                <div className="w-full max-w-4xl mx-auto p-4">
                    <h2 className="text-2xl font-bold mb-4 text-center text-black">Mis Documentos Disponibles</h2>
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="w-full border-collapse bg-white">
                            <thead>
                                <tr className="bg-green-700 text-white">
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Asunto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Creado por</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Archivo</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-green-200">
                                {matchingDocuments.map((doc) => (
                                    <tr className="hover:bg-green-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.attributes.descriptionDoc}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a
                                                href=""
                                                download
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                            >
                                                <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Descargar
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div >
            );
        } else {
            // Lógica a ejecutar si no existen documentos correspondientes
            return <div>No hay documentos para tu curso.</div>;
        }


    }
}