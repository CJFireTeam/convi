import WarningAlert from "@/components/alerts/warningAlert";
import { IDocuments } from "@/interfaces/documentos.interface";
import { api_getDocumentsByCourse, api_getDocumentsByEstablishment, api_getDocumentsByUserDestinity } from "@/services/axios.services";
import { getFile } from "@/services/images.service";
import { useUserStore } from "@/store/userStore";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Menu } from '@headlessui/react'
import { ArrowDownTrayIcon, ChevronDownIcon } from "@heroicons/react/20/solid";


export default function DocumentosAlumno() {
    const { user, GetRole } = useUserStore();

    const [documents, setDocuments] = useState<IDocuments[]>([])
    const [displayedDocuments, setDisplayedDocuments] = useState<IDocuments[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const documentsPerPage = 5;

    const fetchDocuments = async () => {
        try {
            const [establishmentDocs, userDocs] = await Promise.all([
                api_getDocumentsByEstablishment(user.establishment_authenticateds[0].id),
                api_getDocumentsByUserDestinity(user.establishment_authenticateds[0].id, user.id)
            ])
            let courseDocs: IDocuments[] = []
            if (user.establishment_courses.length > 0) {
                const coursesPromises = user.establishment_courses.map(course =>
                    api_getDocumentsByCourse(course.id, user.establishment_authenticateds[0].id)
                )
                const coursesResults = await Promise.all(coursesPromises)
                courseDocs = coursesResults.flatMap(result => result.data.data)
            }
            const allDocs = [
                ...establishmentDocs.data.data,
                ...courseDocs,
                ...userDocs.data.data
            ]
            setDocuments(allDocs)
            setDisplayedDocuments(allDocs.slice(0, documentsPerPage))
        } catch (error) {
            console.error('Error al obtener documentos:', error)
        }

    }

    useEffect(() => {
        if (!user || !user.establishment_authenticateds[0].id || !user.id) return;
        fetchDocuments()
    }, [user])

    const getDestinatario = (doc: IDocuments) => {
        return doc.attributes.user_destiny?.data
            ? `${doc.attributes.user_destiny.data.attributes.firstname} ${doc.attributes.user_destiny.data.attributes.first_lastname}`
            : doc.attributes.establishment_course.data
                ? `${doc.attributes.establishment_course.data.attributes.Grade} ${doc.attributes.establishment_course.data.attributes.Letter}`
                : doc.attributes.establishmentId?.data
                    ? doc.attributes.establishmentId.data.attributes.name
                    : 'No especificado';
    };

    const loadMoreDocuments = () => {
        const nextPage = currentPage + 1
        const startIndex = (nextPage - 1) * documentsPerPage
        const endIndex = startIndex + documentsPerPage
        const newDocuments = documents.slice(startIndex, endIndex)
        setDisplayedDocuments([...displayedDocuments, ...newDocuments])
        setCurrentPage(nextPage)
    }

    const [loading, setLoading] = useState(false);
    const handleDownload = async (url: string, name: string) => {
        try {
            setLoading(true);
            const response = await fetch(url, { method: "GET" });
            if (!response.ok) {
                setLoading(false);
                throw new Error(`Error al descargar el archivo: ${response.statusText}`);
            }
            const blob = await response.blob(); // Convierte el contenido en un Blob
            const blobUrl = window.URL.createObjectURL(blob); // Crea una URL temporal
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = name; // Nombre sugerido para el archivo
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl); // Limpia la URL temporal
        } catch (error) {
            console.error("Error descargando el archivo:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!documents || !user) {
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
    if (user.establishment_authenticateds.length === 0) {
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
    if (user.establishment_courses.length === 0) {
        return (
            <>
                <Head>
                    <title>Documentos</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                </Head>
                <div className="flex flex-col items-center">
                    <WarningAlert message={'Aún no tienes un curso asignado.'} />
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
                    <WarningAlert message={'Aún no hay documentos para tu curso.'} />
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
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Destinado para</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Archivo</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-green-200">
                                    {displayedDocuments.map((doc, index) => (
                                        <tr key={index} className="hover:bg-green-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.attributes.descriptionDoc}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.attributes.userId.data.attributes.firstname + " " + doc.attributes.userId.data.attributes.first_lastname}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(doc.attributes.createdAt).toLocaleString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            })}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getDestinatario(doc)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {doc.attributes.document?.data?.length === 1 ? (
                                                    <button
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                        onClick={() => {
                                                            handleDownload(getFile(doc.attributes.document.data[0].attributes.url), doc.attributes.document.data[0].attributes.name);
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
                                                        <Menu.Items className="mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">                                                                <div className="px-1 py-1">
                                                            {doc.attributes.document?.data?.map((archivo, i) => (
                                                                <Menu.Item key={i}>
                                                                    {({ active }) => (
                                                                        <button
                                                                            className={`${active ? 'bg-green-500 text-white' : 'text-gray-900'
                                                                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                                            onClick={() => {
                                                                                handleDownload(getFile(archivo.attributes.url), archivo.attributes.name);
                                                                            }}
                                                                        >
                                                                            <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                                            Archivo {i + 1}
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