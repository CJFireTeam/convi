import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { api_getEstablishmentCourses, api_getUsersProfeEstablishment, api_putEliminadoEstablishmenCourses, api_putEstablishmenCourses } from "@/services/axios.services"
import { IUserEstablishment } from "@/interfaces/documentos.interface"

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
        LeadTeacher: {
            data: {
                attributes: {
                    firstname: string;
                    first_lastname: string;
                    second_lastname: string;
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
    const [metaData, setMetaData] = useState({ page: 1, pageCount: 0, pageSize: 0, total: 0 })
    const [teachers, setTeachers] = useState<IUserEstablishment[]>([])
    const [selectedTeacher, setSelectedTeacher] = useState<string>("")

    const getCoursesEstablishment = async () => {
        setLoading(true)
        try {
            const data = await api_getEstablishmentCourses(establishmentId, metaData.page)
            setCoursesEs(data.data.data)
            setMetaData(data.data.meta.pagination)

            if (data.data.data.length === 0 && metaData.page > 1) {
                updatePage(metaData.page - 1)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getTeachers = async () => {
        try {
            const data = await api_getUsersProfeEstablishment(establishmentId)
            setTeachers(data.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (establishmentId) {
            getCoursesEstablishment()
            getTeachers()
        }
    }, [establishmentId, metaData.page, refreshTrigger])

    const updatePage = (number: number) => {
        setMetaData(prev => ({ ...prev, page: number }))
    }

    const eliminarCurso = async (courseId: number) => {
        try {
            await api_putEliminadoEstablishmenCourses(courseId, true)
            toast.success('Curso eliminado exitosamente.')
            await getCoursesEstablishment()
        } catch (error) {
            console.error('Error al eliminar el curso', error)
            toast.error('Error al eliminar el curso')
        }
    }

    const actualizarProfesorJefe = async (courseId: number) => {
        if (!selectedTeacher) {
            toast.error('Por favor, selecciona un profesor.')
            return
        }
        try {
            await api_putEstablishmenCourses(courseId, parseInt(selectedTeacher))
            toast.success('Profesor jefe agregado exitosamente.')
            await getCoursesEstablishment()
        } catch (error) {
            console.error('Error al actualizar', error)
            toast.error('Error al actualizar el profesor jefe')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center my-auto">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!loading && coursesEs.length === 0) {
        return (
            <div className="flex flex-col items-center my-auto">
                <p className="text-yellow-600 font-semibold">Sin cursos creados</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-gray-500 text-sm font-semibold">Para editar presione en medio.</p>
            {coursesEs.map((course) => (
                <div key={course.id} className="grid grid-cols-6 items-center gap-4 p-4 border rounded-lg">
                    <div className="col-span-1 text-center">
                        <p className="text-xl font-semibold">{`${course.attributes.Grade} ${course.attributes.Letter}`}</p>
                    </div>
                    <div className="col-span-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                                >
                                    {course.attributes.LeadTeacher && course.attributes.LeadTeacher.data
                                        ? `Profesor jefe: ${course.attributes.LeadTeacher.data.attributes.firstname} ${course.attributes.LeadTeacher.data.attributes.first_lastname}`
                                        : 'Sin Profesor jefe'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Asignar Profesor Jefe</DialogTitle>
                                </DialogHeader>
                                <Select onValueChange={setSelectedTeacher}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un profesor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.length > 0 ? (
                                            teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {`${teacher.firstname} ${teacher.first_lastname}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <p>No hay profesores disponibles</p>
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button onClick={() => actualizarProfesorJefe(course.id)}>Asignar</Button>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="col-span-1 text-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-5 w-5 text-red-500" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Estás seguro que quieres borrar el curso?</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center space-x-2">
                                    <Button variant="destructive" onClick={() => eliminarCurso(course.id)}>Aceptar</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            ))}
            <Paginator metadata={metaData} setMetaData={updatePage} />
        </div>
    )
}

function Paginator({ metadata, setMetaData }: { metadata: { page: number, pageCount: number, pageSize: number, total: number }, setMetaData: (numero: number) => void }) {
    const changePage = (number: number) => {
        if (number > metadata.pageCount || number <= 0) return
        setMetaData(number)
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
                Mostrando {Math.min(metadata.pageSize * metadata.page, metadata.total)} de {metadata.total} resultados
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changePage(metadata.page - 1)}
                    disabled={metadata.page === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(metadata.pageCount)].map((_, i) => (
                    <Button
                        key={i}
                        variant={i + 1 === metadata.page ? "default" : "outline"}
                        size="icon"
                        onClick={() => changePage(i + 1)}
                    >
                        {i + 1}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changePage(metadata.page + 1)}
                    disabled={metadata.page === metadata.pageCount}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

