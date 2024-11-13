import WarningAlert from "@/components/alerts/warningAlert";
import { data } from "@/components/encargado/grafico1";
import { api_getAllUserByEstablishment, api_getDocumentsByCourse, api_getDocumentsByEstablishment, api_getDocumentsByEstablishment2, api_getDocumentsByUserDestinity, api_getDocumentsByUserDestinity2, api_getDocumentUserCreated, api_getOneUser, api_postDocument, api_putDocument, api_uploadFiles } from "@/services/axios.services";
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
 return <FileUploader/>
}
// function PaginatorCreator({ metadata, setMetaData }: { metadata: metaI, setMetaData: (numero: number) => void }) {
//     const changePage = async (number: number) => {
//         if (number > metadata.pageCount) return;
//         if (number <= 0) return;
//         setMetaData(number);
//     }
//     return (
//         <>
//             <Head>
//                 <title>Documentos</title>
//                 <meta name="viewport" content="initial-scale=1.0, width=device-width" />
//             </Head>
//             <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
//                 <div className="flex flex-1 justify-between sm:hidden">
//                     <a
//                         onClick={() => changePage(metadata.page - 1)}
//                         className=" inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                         Pagina Anterior
//                     </a>
//                     <a
//                         onClick={() => changePage(metadata.page + 1)}
//                         className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                         Proxima Pagina
//                     </a>
//                 </div>
//                 <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//                     <div>
//                         <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{Math.min(Number(metadata.pageSize) * metadata.page, metadata.total)}</span> de{" "}
//                             <span className="font-medium">{metadata.total}</span> resultados
//                         </p>
//                     </div>
//                     <div>
//                         <nav
//                             className="isolate inline-flex -space-x-px rounded-md shadow-sm"
//                             aria-label="Pagination"
//                         >
//                             <a
//                                 onClick={() => changePage(metadata.page - 1)}
//                                 className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
//                             >
//                                 <span className="sr-only">Previous</span>
//                                 <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
//                             </a>
//                             {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
//                             {[...Array.from(Array(metadata.pageCount).keys())].map((num, i) => (
//                                 <a
//                                     key={i}
//                                     onClick={() => changePage(num + 1)}
//                                     aria-current="page"
//                                     className={` cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 md:inline-flex ${(num + 1) === metadata.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''}`}
//                                 >
//                                     {num + 1}
//                                 </a>
//                             ))}
//                             <a
//                                 onClick={() => changePage(metadata.page + 1)}
//                                 className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
//                             >
//                                 <span className="sr-only">Next</span>
//                                 <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
//                             </a>
//                         </nav>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

// function PaginatorEstablishment({ metadata2, setMetaData2 }: { metadata2: metaI, setMetaData2: (numero: number) => void }) {
//     const changePage2 = async (number: number) => {
//         if (number > metadata2.pageCount) return;
//         if (number <= 0) return;
//         setMetaData2(number);
//     }
//     return (
//         <>
//             <Head>
//                 <title>Documentos</title>
//                 <meta name="viewport" content="initial-scale=1.0, width=device-width" />
//             </Head>
//             <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
//                 <div className="flex flex-1 justify-between sm:hidden">
//                     <a
//                         onClick={() => changePage2(metadata2.page - 1)}
//                         className=" inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                         Pagina Anterior
//                     </a>
//                     <a
//                         onClick={() => changePage2(metadata2.page + 1)}
//                         className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                         Proxima Pagina
//                     </a>
//                 </div>
//                 <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//                     <div>
//                         <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{Math.min(Number(metadata2.pageSize) * metadata2.page, metadata2.total)}</span> de{" "}
//                             <span className="font-medium">{metadata2.total}</span> resultados
//                         </p>
//                     </div>
//                     <div>
//                         <nav
//                             className="isolate inline-flex -space-x-px rounded-md shadow-sm"
//                             aria-label="Pagination"
//                         >
//                             <a
//                                 onClick={() => changePage2(metadata2.page - 1)}
//                                 className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
//                             >
//                                 <span className="sr-only">Previous</span>
//                                 <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
//                             </a>
//                             {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
//                             {[...Array.from(Array(metadata2.pageCount).keys())].map((num, i) => (
//                                 <a
//                                     key={i}
//                                     onClick={() => changePage2(num + 1)}
//                                     aria-current="page"
//                                     className={` cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 md:inline-flex ${(num + 1) === metadata2.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''}`}
//                                 >
//                                     {num + 1}
//                                 </a>
//                             ))}
//                             <a
//                                 onClick={() => changePage2(metadata2.page + 1)}
//                                 className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
//                             >
//                                 <span className="sr-only">Next</span>
//                                 <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
//                             </a>
//                         </nav>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

// function PaginatorDestiny({ metadata4, setMetaData4 }: { metadata4: metaI, setMetaData4: (numero: number) => void }) {
//     const changePage4 = async (number: number) => {
//         if (number > metadata4.pageCount) return;
//         if (number <= 0) return;
//         setMetaData4(number);
//     }
//     return (
//         <>
//             <Head>
//                 <title>Documentos</title>
//                 <meta name="viewport" content="initial-scale=1.0, width=device-width" />
//             </Head>
//             <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
//                 <div className="flex flex-1 justify-between sm:hidden">
//                     <a
//                         onClick={() => changePage4(metadata4.page - 1)}
//                         className=" inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                         Pagina Anterior
//                     </a>
//                     <a
//                         onClick={() => changePage4(metadata4.page + 1)}
//                         className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                         Proxima Pagina
//                     </a>
//                 </div>
//                 <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//                     <div>
//                         <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{Math.min(Number(metadata4.pageSize) * metadata4.page, metadata4.total)}</span> de{" "}
//                             <span className="font-medium">{metadata4.total}</span> resultados
//                         </p>
//                     </div>
//                     <div>
//                         <nav
//                             className="isolate inline-flex -space-x-px rounded-md shadow-sm"
//                             aria-label="Pagination"
//                         >
//                             <a
//                                 onClick={() => changePage4(metadata4.page - 1)}
//                                 className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
//                             >
//                                 <span className="sr-only">Previous</span>
//                                 <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
//                             </a>
//                             {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
//                             {[...Array.from(Array(metadata4.pageCount).keys())].map((num, i) => (
//                                 <a
//                                     key={i}
//                                     onClick={() => changePage4(num + 1)}
//                                     aria-current="page"
//                                     className={` cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 md:inline-flex ${(num + 1) === metadata4.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''}`}
//                                 >
//                                     {num + 1}
//                                 </a>
//                             ))}
//                             <a
//                                 onClick={() => changePage4(metadata4.page + 1)}
//                                 className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
//                             >
//                                 <span className="sr-only">Next</span>
//                                 <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
//                             </a>
//                         </nav>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }


const FileUploader = () => {
    const { user, GetRole } = useUserStore();

    const onSubmit = async (data: FormValues) => {
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
            reset();
        } catch (error) {
            console.error('Error al subir los documentos:', error);
            toast.error('Ha ocurrido un error inesperado.')
        } finally {
        }
    };
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
                {/* <div className="col-span-2 md:col-span-1 items-center mb-4">
                    {!isUserSelected && (
                        <>
                            <label htmlFor="curso" className="font-semibold">Seleccione un curso: </label>
                            <Controller
                                control={control}
                                name="courseId"
                                render={({ field: { onChange, value, name, ref } }) => (
                                    <Select
                                        placeholder="Seleccione curso (opcional)"
                                        getOptionValue={(option) => option.id.toString()}
                                        getOptionLabel={(option) => option.grade + " " + option.letter}
                                        value={dataUser?.courses.find((e) => e.id === value) || null}
                                        options={dataUser?.courses}
                                        onChange={handleCourseChange} // Usar la nueva función
                                        menuPortalTarget={document.body}
                                        loadingMessage={() => "Cargando opciones..."}
                                        isLoading={dataUser?.courses.length === 0}
                                        isClearable
                                    />
                                )}
                            />
                            {errors.courseId?.message && (<p className="text-red-600 text-sm mt-1">{errors.courseId.message}</p>)}
                        </>
                    )}
                </div> */}

                {/* Select de usuario */}
                <div className="col-span-2 md:col-span-1 items-center mb-4">
                    {/* {!isCourseSelected && (
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
                    )} */}
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
                    {/* <Button type="submit" disabled={isSubmitting} className="btn btn-primary btn-outline">
                        {isSubmitting ? 'Subiendo...' : 'Guardar'}
                    </Button> */}
                </div>
            </form >


        </>
    );
}