import { useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import WarningAlert from "../alerts/warningAlert"
import { api_getEstablishmentCourses, api_putEliminadoEstablishmenCourses } from "@/services/axios.services"
import metaI from "@/interfaces/meta.interface"
import { toast } from "react-toastify"

interface Props {
    establishmentId: number
    refreshTrigger: boolean
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

export default function ViewEstablishmentCourses({ establishmentId, refreshTrigger }: Props) {
    const [loading, setLoading] = useState(true)
    const [coursesEs, setCoursesEs] = useState<ICoursesEstablishment[]>([])
    const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 })

    const getCoursesEstablishment = async () => {
        setLoading(true)
        try {
            const data = await api_getEstablishmentCourses(establishmentId, metaData.page)
            setCoursesEs(data.data.data)
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
        if (establishmentId) {
            getCoursesEstablishment()
        }
    }, [establishmentId, metaData.page, refreshTrigger])

    const updatePage = (number: number) => {
        setMetaData(prev => ({ ...prev, page: number }))
    }

    const eliminarclick = async (CourseEsId: number) => {
        try {
            const response = await api_putEliminadoEstablishmenCourses(CourseEsId, true); // Establece 'Eliminado' en true
            // Aquí puedes manejar el estado de tu aplicación, como actualizar la lista de documentos
            toast.success('Curso eliminado exitosamente.')
            await getCoursesEstablishment()
        } catch (error) {
            console.error('Error al eliminar el curso', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center my-auto">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    if (!loading && coursesEs.length === 0) {
        return (
            <div className="flex flex-col items-center my-auto">
                <WarningAlert message={'Sin cursos creados'} />
            </div>
        )
    }

    return (
        <>
            {coursesEs.map((c, index) => (<>
                <div className="grid lg:grid-cols-6 border-b-2 border-primary m-2" key={index}>
                    <div className="col-start-0 col-end-3 flex flex-row justify-center">
                        <p className="text-xl font-semibold">{c.attributes.Grade + " " + c.attributes.Letter}</p>
                    </div>
                    <div className="col-start-6 col-end-7 flex flex-row justify-center my-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer text-error"
                            onClick={() => {
                                const modal = document.getElementById(`my_modal_${c.id}`) as HTMLDialogElement; // Usando ID único
                                modal?.showModal();
                            }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </div>
                </div>
                {/* Open the modal using document.getElementById('ID').showModal() method */}
                <dialog id={`my_modal_${c.id}`} className="modal">
                    <div className="modal-box bg-white flex flex-col items-center">
                        <h3 className="font-bold text-lg text-center">¿Estas seguro que quieres borrar el curso?</h3>
                        <div className="modal-action">
                            <form method="dialog">
                                <button className="btn mr-4">Cancelar</button>
                                <button type="button" className="btn btn-outline btn-error" onClick={() => eliminarclick(c.id)}>
                                    Aceptar
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>
            </>))
            }
            <Paginator metadata={metaData} setMetaData={updatePage} />


        </>
    )
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