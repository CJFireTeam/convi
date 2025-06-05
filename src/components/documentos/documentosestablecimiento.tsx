import { IDocuments } from "@/interfaces/documentos.interface";
import metaI from "@/interfaces/meta.interface";
import { api_getDocumentsByEstablishment2 } from "@/services/axios.services";
import { getFile } from "@/services/images.service";
import { ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import { useEffect, useState } from "react";
import WarningAlert from "../alerts/warningAlert";

interface props {
    establishmentId: number;
    userId: number;
}

export default function DocumentosEstablecimiento(props: props) {

    const [documentEstablishment, setDocumentEstablishment] = useState<IDocuments[]>([]);
    const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
    const dataDocumentByEstablishment = async () => {
        try {
            const data = await api_getDocumentsByEstablishment2(props.establishmentId, props.userId, metaData.page);
            setDocumentEstablishment(data.data.data);
            setMetaData(data.data.meta.pagination);

            if (data.data.data.length === 0 && metaData.page > 1) {
                updatePage(metaData.page - 1); // Retrocede a la página anterior
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        if (!props.userId || !props.establishmentId) return;
        dataDocumentByEstablishment()
    }, [props.userId, props.establishmentId, metaData.page]);

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

    const updatePage = (number: number) => {
        if (number > metaData.pageCount || number <= 0) return; // Asegúrate de que el número de página sea válido
        // Crea un nuevo objeto para evitar la mutación directa
        const newMetaData = {
            ...metaData,
            page: number,
        };
        setMetaData(newMetaData);
    };

    return (
        <>
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
                                        <p><span className="font-semibold">Descripción: </span>{doc.attributes.descriptionDoc}</p>
                                        {!doc.attributes.establishment_course.data && (
                                            <></>
                                        )}
                                        {doc.attributes.establishment_course.data && (
                                            <p><span className="font-semibold">Curso: </span>{doc.attributes.establishment_course.data.attributes.Grade + " " + doc.attributes.establishment_course.data.attributes.Letter}</p>
                                        )}
                                        {!doc.attributes.userId.data && (
                                            <></>
                                        )}
                                        {doc.attributes.userId.data && (
                                            <p><span className="font-semibold">Creador: </span>{doc.attributes.userId.data.attributes.firstname + " " + doc.attributes.userId.data.attributes.first_lastname}</p>
                                        )}
                                        {doc.attributes.createdAt && (
                                            <p><span className="font-semibold">Fecha: </span>{new Date(doc.attributes.createdAt).toLocaleString()}</p>
                                        )}
                                    </div>
                                    <div className="grid lg:grid-cols-3">
                                        {doc.attributes.document.data.map((archivo, i) => (<>
                                            <button
                                                key={i}
                                                type="button"
                                                className="btn btn-outline btn-primary mb-2 lg:mb-0 lg:mr-2"
                                                onClick={() => {
                                                    handleDownload(getFile(archivo.attributes.url), archivo.attributes.name);
                                                }}
                                                disabled={loading}
                                            >
                                                {loading ? 'Descargando...' : <><ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                    Archivo {i + 1}</>}

                                            </button>

                                        </>))}
                                    </div>
                                </div>
                            </>
                        ))}
                        <Paginator metadata={metaData} setMetaData={updatePage} />
                    </>)
                    :
                    (
                        <div className="flex flex-col items-center">
                            <WarningAlert message={'Sin documentos'} />
                        </div>
                    )}
            </div>

        </>
    )
}


function Paginator({ metadata, setMetaData }: { metadata: metaI, setMetaData: (numero: number) => void }) {
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