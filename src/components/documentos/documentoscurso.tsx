import { useEffect, useState } from "react";
import WarningAlert from "../alerts/warningAlert";
import { api_getDocumentsByCourse2 } from "@/services/axios.services";
import { getFile } from "@/services/images.service";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import { ICourse, IDocuments } from "@/interfaces/documentos.interface";

interface props {
    establishmentId: number;
    userId: number;
    userCourses: ICourse[];
}

export default function DocumentosCurso(props: props) {
    const [documentCourse, setDocumentCourse] = useState<IDocuments[]>([]);
    const [metaData, setMetaData] = useState({ page: 1, pageSize: 3, total: 0 }); // Cambia pageSize a 3

    const dataDocumentByCourse = async () => {
        try {
            const allDocuments = await Promise.all(
                props.userCourses.map(course =>
                    api_getDocumentsByCourse2(props.establishmentId, course.id, props.userId)
                )
            );

            const combinedDocuments = allDocuments.flatMap(response => response.data.data);
            setDocumentCourse(combinedDocuments);
            setMetaData(prevMeta => ({
                ...prevMeta,
                total: combinedDocuments.length,
                page: 1 // Reinicia a la primera página cuando se obtienen nuevos documentos
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (!props.userId || !props.establishmentId || props.userCourses.length === 0) return;
        dataDocumentByCourse();
    }, [props.userId, props.establishmentId, props.userCourses]);

    const nextPage = () => {
        if (metaData.page < Math.ceil(metaData.total / metaData.pageSize)) {
            setMetaData(prevMeta => ({ ...prevMeta, page: prevMeta.page + 1 }));
        }
    };

    const prevPage = () => {
        if (metaData.page > 1) {
            setMetaData(prevMeta => ({ ...prevMeta, page: prevMeta.page - 1 }));
        }
    };

    // Calcular el rango de documentos a mostrar
    const startIndex = (metaData.page - 1) * metaData.pageSize;
    const endIndex = startIndex + metaData.pageSize;
    const currentDocuments = documentCourse.slice(startIndex, endIndex); // Obtener los documentos actuales para la página

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
    return (
        <>
            <div className="border rounded-lg shadow-md p-4 items-center w-full mb-4">
                <div className="flex flex-col lg:flex-row">
                    <p className="font-bold text-2xl mb-2">Documentos Cursos: </p>
                </div>

                {documentCourse.length > 0 ? (
                    <div>
                        {currentDocuments.map((currentDocument, index) => (
                            <div key={index} className="grid lg:grid-cols-3 gap-4 border border-gray-100 p-2 mb-1">
                                <div className="flex flex-col text-left">
                                    <p><span className="font-semibold">Descripción: </span>{currentDocument.attributes.descriptionDoc}</p>
                                    {currentDocument.attributes.establishment_course.data && (
                                        <p><span className="font-semibold">Curso: </span>{currentDocument.attributes.establishment_course.data.attributes.Grade + " " + currentDocument.attributes.establishment_course.data.attributes.Letter}</p>
                                    )}
                                    {currentDocument.attributes.userId.data && (
                                        <p><span className="font-semibold">Creador: </span>{currentDocument.attributes.userId.data.attributes.firstname + " " + currentDocument.attributes.userId.data.attributes.first_lastname}</p>
                                    )}
                                    {currentDocument.attributes.createdAt && (
                                        <p><span className="font-semibold">Fecha: </span>{new Date(currentDocument.attributes.createdAt).toLocaleString()}</p>
                                    )}
                                </div>
                                <div className="grid lg:grid-cols-3">
                                    {currentDocument.attributes.document.data.map((archivo, i) => (
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
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between mt-4">
                            <button onClick={prevPage} disabled={metaData.page === 1} className="btn btn-outline btn-primary">
                                Página Anterior
                            </button>
                            <button onClick={nextPage} disabled={metaData.page >= Math.ceil(metaData.total / metaData.pageSize)} className="btn btn-outline btn-primary">
                                Siguiente Página
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <WarningAlert message={'Sin documentos'} />
                    </div>
                )}
            </div>
        </>
    );
}