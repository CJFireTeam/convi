"use client"

import router, { useRouter } from "next/router"
import { Button, Input } from "react-daisyui"
import WarningAlert from "@/components/alerts/warningAlert"
import { useEffect, useState } from "react"
import { useUserStore } from "@/store/userStore"
import type metaI from "@/interfaces/meta.interface"
import {
  api_getQuestions,
  api_getQuestionsByForm,
  api_postResponseForm,
  api_surveys,
  api_updateUserForm,
} from "@/services/axios.services"
import { differenceInDays } from "date-fns"
import { EyeIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import { z } from "zod"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"
import Head from "next/head"

interface questionaryI {
  id: number
  attributes: {
    formulario: {
      data: {
        id: number
        attributes: {
          Descripcion: string
          Titulo: string
          FechaInicio: string
          FechaFin: string
          status: boolean
        }
      }
    }
    isCompleted: boolean
  }
}

interface surveyInterface {
  id: number
  attributes: {
    Titulo: string
    Descripcion: string
    FechaInicio: string
    FechaFin: string
  }
}

export default function Index() {
  const { push } = useRouter()
  const redirect = () => {
    push("encuestas/creacion")
  }
  const { user, GetRole, role } = useUserStore()

  // Estados originales (sin cambios en las peticiones)
  const [metaData, setMetaData] = useState<metaI>({
    page: 1,
    pageCount: 0,
    pageSize: 0,
    total: 0,
  })
  const [data, setData] = useState<surveyInterface[]>([])
  const [dataQuestionary, setdataQuestionary] = useState<questionaryI[]>([])

  // Estados para funcionalidad frontend
  const [searchTerm, setSearchTerm] = useState("")
  const [searchTermQuestionary, setSearchTermQuestionary] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageQuestionary, setCurrentPageQuestionary] = useState(1)
  const [itemsPerPage] = useState(10) // Elementos por página
  const [itemsPerPageQuestionary] = useState(10) // Elementos por página para cuestionarios

  // Funciones originales (sin cambios)
  const [isLoading,setIsLoading]=useState(false);//componente loading 
  const [isLoading2,setIsLoading2]=useState(false);//componente loading 
  const getQuestionary = async () => {
    try {
      setIsLoading(true);
      const questions = await api_getQuestions(user.username, true)
      setMetaData(questions.data.meta.pagination)
      setdataQuestionary(questions.data.data)
    } catch (error) {
      console.log(error)
      setIsLoading(false);
    } finally{
      setIsLoading(false);
    }
  }

  const getData = async () => {
    let assigned: number | undefined = undefined
    try {
     setIsLoading2(true);
      assigned = user?.id
      const response = await api_surveys({
        createdBy: user?.id,
        userId: assigned,
        page: metaData.page,
      })
      setData((prevData) => [...prevData, ...response.data.data])
      setMetaData(response.data.meta.pagination)
    } catch (error) {
      console.log(error)
      setIsLoading2(false);
    } finally{
      setIsLoading2(false);
    }
  }

  // Lógica de filtrado y paginación FRONTEND
  const getFilteredData = () => {
    if (searchTerm === "") {
      return data
    }
    return data.filter(
      (survey) =>
        survey.attributes.Titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.attributes.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const getFilteredQuestionary = () => {
    if (searchTermQuestionary === "") {
      return dataQuestionary
    }
    return dataQuestionary.filter(
      (questionary) =>
        questionary.attributes.formulario.data.attributes.Titulo.toLowerCase().includes(
          searchTermQuestionary.toLowerCase(),
        ) ||
        questionary.attributes.formulario.data.attributes.Descripcion.toLowerCase().includes(
          searchTermQuestionary.toLowerCase(),
        ),
    )
  }

  const getPaginatedData = () => {
    const filteredData = getFilteredData()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return {
      data: filteredData.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredData.length / itemsPerPage),
      totalItems: filteredData.length,
    }
  }

  const getPaginatedQuestionary = () => {
    const filteredData = getFilteredQuestionary()
    const startIndex = (currentPageQuestionary - 1) * itemsPerPageQuestionary
    const endIndex = startIndex + itemsPerPageQuestionary
    return {
      data: filteredData.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredData.length / itemsPerPageQuestionary),
      totalItems: filteredData.length,
    }
  }

  // useEffects originales (sin cambios)
  useEffect(() => {
    if (user?.id !== 0 && (GetRole() === "Profesor" || GetRole() === "Encargado de Convivencia Escolar")) {
      getData()
    }
  }, [user, metaData.page])

  const handleLoadMore = () => {
    setMetaData((prevMeta) => ({
      ...prevMeta,
      page: prevMeta.page + 1,
    }))
  }

  useEffect(() => {
    if (user?.id === 0) return
    if (GetRole() === "Authenticated") getQuestionary()
  }, [user])

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPageQuestionary(1)
  }, [searchTermQuestionary])

  const [form, setForm] = useState(false)
  const [selectedForm, setSelectedForm] = useState<questionaryI | null>(null)

  // Componente de paginación frontend
  const FrontendPagination = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => {
    if (totalPages <= 1) return null

    const getVisiblePages = () => {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i)
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...")
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages)
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }

      return rangeWithDots
    }

    if (isLoading) {
    return  <div className="flex flex-col items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>;
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex space-x-1">
          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              size="sm"
              variant={page === currentPage ? "link" : "outline"}
              color={page === currentPage ? "primary" : "ghost"}
              disabled={page === "..."}
              onClick={() => typeof page === "number" && onPageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center"
        >
          Siguiente
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (GetRole() === "Profesor" || GetRole() === "Encargado de Convivencia Escolar") {
    const paginatedResult = getPaginatedData()

    if (isLoading) {
    return <p className="text-center mt-4">Cargando encuestas...</p>;
  }

    return (
      <>
        <Head>
          <title>Encuestas</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-gray-900">Mis Encuestas</h1>
            </div>
            <div className="sm:ml-16 sm:mt-0 sm:flex-none">
              <Button onClick={redirect} color="primary">
                Crear encuesta
              </Button>
            </div>
          </div>

          {/* Buscador */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar encuestas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {paginatedResult.data.length > 0 ? (
            <>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <Table data={paginatedResult.data} isLoading={isLoading} />
                    </div>
                  </div>
                </div>
              </div>

              <FrontendPagination
                currentPage={currentPage}
                totalPages={paginatedResult.totalPages}
                onPageChange={setCurrentPage}
              />

              {/* Botón original "Cargar más" si hay más páginas en el backend */}
              {metaData.page < metaData.pageCount && (
                <div className="flex justify-center mt-4">
                  <Button onClick={handleLoadMore} color="secondary" variant="outline">
                    Cargar más encuestas
                  </Button>
                </div>
              )}
            </>
          ) : (
            <WarningAlert
              message={
                searchTerm
                  ? "No se encontraron encuestas que coincidan con tu búsqueda"
                  : "Aún no has creado una encuesta"
              }
            />
          )}
        </div>
      </>
    )
  }

  if (GetRole() === "Authenticated") {
    const paginatedQuestionaryResult = getPaginatedQuestionary()

    if (isLoading) {
    return <p className="text-center mt-4">Cargando encuestas...</p>;
    }

    return (
      <>
        <Head>
          <title>Encuestas</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        {!form && (
          <>
            <div className="w-4/5 mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Encuestas Disponibles</h1>
                
                {/* Buscador para usuarios autenticados */}
                <div className="max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Buscar encuestas..."
                      value={searchTermQuestionary}
                      onChange={(e) => setSearchTermQuestionary(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
              </div>

              {paginatedQuestionaryResult.data.length > 0 ? (
                <>
                  {paginatedQuestionaryResult.data.map((e, index) => {
                    const daysRemaining = differenceInDays(
                      new Date(e.attributes.formulario.data.attributes.FechaFin + "T00:00:00"),
                      new Date(),
                    )
                    const isExpired = daysRemaining < 0
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (!isExpired) {
                            setSelectedForm(e)
                            setForm(true)
                          }
                        }}
                        className={`bg-white shadow-md rounded-md p-4 my-2 ${
                          isExpired
                            ? "cursor-not-allowed border-red-600"
                            : "hover:border-primary hover:border-2 hover:cursor-pointer"
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <h2 className="font-bold text-lg">{e.attributes.formulario.data.attributes.Titulo}</h2>
                          <div>
                            <span
                              className={`font-bold ${
                                isExpired ? "text-red-600" : daysRemaining >= 5 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isExpired
                                ? "Encuesta no respondida"
                                : daysRemaining === 0
                                  ? "Termina hoy"
                                  : `Termina en ${daysRemaining} días.`}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-gray-600">{e.attributes.formulario.data.attributes.Descripcion}</p>
                          <div className="flex flex-col md:flex-row">
                            <p className="text-gray-500 mr-4">
                              Fecha de Inicio:{" "}
                              {new Date(
                                e.attributes.formulario.data.attributes.FechaInicio + "T00:00:00",
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500">
                              Fecha de Fin:{" "}
                              {new Date(
                                e.attributes.formulario.data.attributes.FechaFin + "T00:00:00",
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <FrontendPagination
                    currentPage={currentPageQuestionary}
                    totalPages={paginatedQuestionaryResult.totalPages}
                    onPageChange={setCurrentPageQuestionary}
                  />
                </>
              ) : (
                <WarningAlert
                  message={
                    searchTermQuestionary
                      ? "No se encontraron encuestas que coincidan con tu búsqueda"
                      : "Sin encuestas disponibles."
                  }
                />
              )}
            </div>
          </>
        )}
        {form && selectedForm && <FomrularyResponse form={selectedForm}/>}
      </>
    )
  }
  return null
}

// Resto de componentes sin cambios...
interface IPreguntas {
  id: number
  attributes: {
    Tipo: string
    Titulo: string
    opciones: []
  }
}

interface props {
  form: questionaryI
}

interface IResForm {
  respuestas: {
    userform: number
    pregunta: number
    response: any
  }[]
}

function FomrularyResponse(props: props) {
  const formId = props.form.attributes.formulario.data.id
  const userFormId = props.form.id

  const [dataPreguntas, setDataPreguntas] = useState<IPreguntas[]>([])
  const getQuestionsByForm = async () => {
    try {
      const response = await api_getQuestionsByForm({ formId })
      setDataPreguntas(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getQuestionsByForm()
  }, [formId])

  const resZod = z.object({
    userform: z.number({
      required_error: "Campo Requerido",
      invalid_type_error: "Tipo Invalido",
    }),
    pregunta: z.number({
      required_error: "Campo Requerido",
      invalid_type_error: "Tipo Invalido",
    }),
    response: z.union([
      z
        .string({
          required_error: "Campo Requerido",
          invalid_type_error: "Tipo Invalido",
        })
        .min(1, { message: "La respuesta no puede estar vacía" }),
      z.array(
        z.string({
          required_error: "Campo Requerido",
          invalid_type_error: "Tipo Invalido",
        }),
      ),
    ]),
  })

  const validationSchema = z.object({
    respuestas: z.array(resZod),
  })

  const methods = useForm<IResForm>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      respuestas: [],
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = methods

  const { fields, append, remove } = useFieldArray({
    control,
    name: "respuestas",
  })

  useEffect(() => {
    if (dataPreguntas.length > 0) {
      setValue(
        "respuestas",
        dataPreguntas.map((pregunta) => ({
          userform: userFormId,
          pregunta: pregunta.id,
          response: "",
        })),
      )
    }
  }, [dataPreguntas, props.form, setValue])

  const onSubmit = async (data: IResForm) => {
    try {
      for (const respuesta of data.respuestas) {
        const { userform, pregunta, response } = respuesta
        await api_postResponseForm({ userform, pregunta, response })
      }
      await api_updateUserForm(userFormId, { isCompleted: true })
      toast.success("Respuestas enviadas con éxito")
      setTimeout(() => {
        router.reload()
      }, 1500)
    } catch (error) {
      toast.error("Error al enviar las respuestas")
    }
  }

  return (
    <>
      <div className="w-full md:w-3/4 mx-auto mt-2">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-4 border rounded-md shadow-lg p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10 text-primary cursor-pointer"
              onClick={() => router.reload()}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <div className="grid col-span-2 gap-4 text-center">
              <h1 className="font-bold text-3xl">{props.form.attributes.formulario.data.attributes.Titulo}</h1>
            </div>
            <div className="grid col-span-2 gap-4 text-center">
              <p className="font-semibold text-lg">{props.form.attributes.formulario.data.attributes.Descripcion}</p>
            </div>
            {fields.map((field, index) => {
              const pregunta = dataPreguntas[index]
              return (
                <div key={field.id} className="grid col-span-2 md:col-span-1 w-full">
                  <label className="label font-semibold mb-2 mx-auto">{pregunta.attributes.Titulo}</label>
                  {pregunta.attributes.Tipo === "text" && (
                    <>
                      <div className="flex flex-col items-center">
                        <textarea
                          rows={3}
                          placeholder="Ingrese su respuesta..."
                          {...register(`respuestas.${index}.response`)}
                          className="textarea textarea-primary w-full"
                        />
                        {errors.respuestas?.[index]?.response && (
                          <p className="text-red-500 text-sm mt-1 text-center" role="alert">
                            {errors.respuestas[index]?.response?.message as string}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {pregunta.attributes.Tipo === "option" && (
                    <>
                      {pregunta.attributes.opciones.map((opcion, i) => (
                        <div key={i} className="flex flex-row justify-center ml-4 mb-2">
                          <input
                            type="radio"
                            {...register(`respuestas.${index}.response`)}
                            value={opcion}
                            className="mr-2 radio radio-primary"
                          />
                          <label>{opcion}</label>
                        </div>
                      ))}
                      {errors.respuestas?.[index]?.response && (
                        <p className="text-red-500 text-sm mt-1 text-center" role="alert">
                          {errors.respuestas[index]?.response?.message as string}
                        </p>
                      )}
                    </>
                  )}

                  {pregunta.attributes.Tipo === "qualification" && (
                    <>
                      <div className="flex flex-row justify-center">
                        <StarRating
                          value={Number(watch(`respuestas.${index}.response`) || 0)}
                          onChange={(value) => setValue(`respuestas.${index}.response`, value.toString())}
                        />
                        {errors.respuestas?.[index]?.response && (
                          <p className="text-red-500 text-sm mt-1 ml-6 md:ml-9" role="alert">
                            {errors.respuestas[index]?.response?.message as string}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {pregunta.attributes.Tipo === "multipleChoice" && (
                    <>
                      {pregunta.attributes.opciones.map((opcion, i) => (
                        <div key={i} className="flex flex-row justify-center mb-2">
                          <input
                            type="checkbox"
                            value={opcion}
                            {...register(`respuestas.${index}.response`)}
                            className="mr-2 checkbox checkbox-primary"
                          />
                          <label>{opcion}</label>
                        </div>
                      ))}
                      {errors.respuestas?.[index]?.response && (
                        <p className="text-red-500 text-sm mt-1 text-center" role="alert">
                          {errors.respuestas[index]?.response?.message as string}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )
            })}
            <div className="grid col-span-2 gap-2 w-2/5 mx-auto">
              <button type="submit" className="btn btn-outline btn-primary">
                Enviar
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

interface StarRatingProps {
  onChange: (value: number) => void
  value: number
}

function StarRating({ onChange, value }: StarRatingProps) {
  const handleClick = (newValue: number) => {
    onChange(newValue)
  }

  return (
    <div className="flex space-x-2 ml-4">
      {[1, 2, 3, 4, 5].map((index) => (
        <svg
          key={index}
          onClick={() => handleClick(index)}
          className={`h-6 w-6 cursor-pointer ${index <= value ? "text-yellow-500" : "text-gray-400"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  )
}

function Table({ data,isLoading }: { data: surveyInterface[],isLoading:boolean }) {
  const handleRouter = (id: number) => {
    sessionStorage.setItem("id_survey", id.toString())
    router.push("/encuestas/visualizar")
  }

  if (isLoading) {
    return <p className="text-center mt-4">Cargando encuestas...</p>;
  }

  return (
    <>
      {data.length !== 0 ? (
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50 text-center">
            <tr>
              <th scope="col" className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Nombre Encuesta
              </th>
              <th scope="col" className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Descripción
              </th>
              <th scope="col" className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Fecha Inicio
              </th>
              <th scope="col" className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Fecha Terminó
              </th>
              <th scope="col" className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Ver
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-center">
            {data.map((survey, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {survey.attributes.Titulo}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {survey.attributes.Descripcion}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {new Date(survey.attributes.FechaInicio).toLocaleString()}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                 {new Date(survey.attributes.FechaFin).toLocaleString()}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <button onClick={() => handleRouter(survey.id)}>
                    <EyeIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <WarningAlert message="No se han encontrado encuestas." />
      )}
    </>
  )
}
