import router, { useRouter } from "next/router";
import { Button, Input, Modal, Textarea } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";
import ErrorAlert from "../../components/alerts/errorAlert";
import InfoAlert from "../../components/alerts/infoAlert";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/userStore";
import metaI from "@/interfaces/meta.interface";
import { api_getQuestions, api_getQuestionsByForm, api_postResponseForm, api_surveys, api_updateUserForm } from "@/services/axios.services";
import { differenceInDays } from 'date-fns';
import { ArrowLeftIcon, EyeIcon, PaperAirplaneIcon, StarIcon } from "@heroicons/react/20/solid";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Head from "next/head";
interface questionaryI {
  id: number;
  attributes: {
    formulario: {
      data: {
        id: number;
        attributes: {
          Descripcion: string;
          Titulo: string;
          FechaInicio: string;
          FechaFin: string;
          status: boolean;
        };
      };
    };
    isCompleted: boolean;
  };
}
export default function Index() {
  const { push } = useRouter();
  const redirect = () => {
    push("encuestas/creacion");
  };
  const { user, GetRole, role } = useUserStore();
  const [metaData, setMetaData] = useState<metaI>({
    page: 1,
    pageCount: 0,
    pageSize: 0,
    total: 0,
  });
  const [data, setData] = useState<surveyInterface[]>([]);
  const [dataQuestionary, setdataQuestionary] = useState<questionaryI[]>([]);

  const getQuestionary = async () => {
    const questions = await api_getQuestions(user.username, true);

    setMetaData(questions.data.meta.pagination);
    setdataQuestionary(questions.data.data);

  };
  const getData = async () => {
    let assigned: number | undefined = undefined;
    try {
      assigned = user?.id;
      const response = await api_surveys({
        createdBy: user?.id,
        userId: assigned,
        page: metaData.page,
      });
      setData((prevData) => [...prevData, ...response.data.data]);
      setMetaData(response.data.meta.pagination);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user?.id !== 0 && GetRole() === "Profesor" || GetRole() === "Encargado de Convivencia Escolar") {
      getData();
    }
  }, [user, metaData.page]);

  const handleLoadMore = () => {
    setMetaData((prevMeta) => ({
      ...prevMeta,
      page: prevMeta.page + 1,
    }));
  };

  useEffect(() => {
    if (user?.id === 0) return;
    if (GetRole() === "Authenticated") getQuestionary();
  }, [user]);


  const [form, setForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState<questionaryI | null>(null);

  if (GetRole() === "Profesor" || GetRole() === "Encargado de Convivencia Escolar") {
    return (
      <>
        <Head>
          <title>Encuestas</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between ">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                Mis Encuestas
              </h1>
              <p className="mt-2 text-sm text-gray-700"></p>
            </div>
            <div className=" sm:ml-16 sm:mt-0 sm:flex-none">
              <Button onClick={redirect} color="primary">
                Crear encuesta
              </Button>
            </div>
          </div>
          {data.length != 0 ? (
            <>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <Table data={data} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4">

                {metaData.page < metaData.pageCount ? (
                  <Button onClick={handleLoadMore} color="primary">
                    Cargar más encuestas
                  </Button>
                ) : (
                  <p className="text-center text-gray-500">Mostrando todas las encuestas.</p>
                )}
              </div>
            </>
          ) : <WarningAlert message="Aun no has creado una encuesta" />}

        </div>
      </>
    );
  }



  if (GetRole() === "Authenticated") {
    const ExtraPages = () => {
      if (metaData.pageCount > 1)
        return <Button color="primary">Ver mas</Button>;
      return null;
    };

    return (
      <>
        <Head>
          <title>Encuestas</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        {!form && dataQuestionary.length > 0 && (
          <>
            <div className="w-4/5 mx-auto">
              {dataQuestionary.map((e, index) => {
                const daysRemaining = differenceInDays(new Date(e.attributes.formulario.data.attributes.FechaFin), new Date());
                const isExpired = daysRemaining < 0;
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!isExpired) {
                        setSelectedForm(e);
                        setForm(true);
                      }
                    }}
                    className={`bg-white shadow-md rounded-md p-4 my-2 ${isExpired
                      ? 'cursor-not-allowed border-red-600'
                      : 'hover:border-primary hover:border-2 hover:cursor-pointer'
                      }`}
                  >
                    <div className="flex justify-between mb-2">
                      <h2 className="font-bold text-lg">
                        {e.attributes.formulario.data.attributes.Titulo}
                      </h2>
                      <div>
                        <span
                          className={`font-bold ${isExpired ? 'text-red-600' : daysRemaining >= 5 ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          {isExpired ? 'Encuesta no respondida' : `Termina en ${daysRemaining} días.`}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between ">
                      <p className="text-gray-600 ">
                        {e.attributes.formulario.data.attributes.Descripcion}
                      </p>
                      {/* Agregar las fechas de inicio y fin */}
                      <div className="flex flex-col md:flex-row">
                        <p className="text-gray-500 mr-4">
                          Fecha de Inicio: {new Date(e.attributes.formulario.data.attributes.FechaInicio).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500">
                          Fecha de Fin: {new Date(e.attributes.formulario.data.attributes.FechaFin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
            {ExtraPages()}
          </>
        )}
        {form && selectedForm && (
          <FomrularyResponse form={selectedForm} />
        )}
        {!form && dataQuestionary.length === 0 && (
          <>
            <WarningAlert message={'Sin encuestas disponibles.'} />
          </>
        )}
      </>
    );


  }
  return null;
}

interface IPreguntas {
  id: number;
  attributes: {
    Tipo: string;
    Titulo: string;
    opciones: [];
  }
}

interface props {
  form: questionaryI;
}

interface IResForm {
  respuestas: {
    userform: number; // ID del usuario
    pregunta: number; // ID de la pregunta
    response: any; // Respuesta, puede ser un string o JSON
  }[];
}


function FomrularyResponse(props: props) {
  const formId = props.form.attributes.formulario.data.id;
  const userFormId = props.form.id;

  const [dataPreguntas, setDataPreguntas] = useState<IPreguntas[]>([])
  const getQuestionsByForm = async () => {
    try {
      const response = await api_getQuestionsByForm({ formId });
      setDataPreguntas(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getQuestionsByForm();
  }, [formId])

  const resZod = z.object({
    userform: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo Invalido" }),
    pregunta: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo Invalido" }),
    response: z.union([
      z.string({ required_error: "Campo Requerido", invalid_type_error: "Tipo Invalido" }).min(1, { message: "La respuesta no puede estar vacía" }),
      z.array(z.string({ required_error: "Campo Requerido", invalid_type_error: "Tipo Invalido" })),
    ]), // acepta string o JSON
  });

  const validationSchema = z.object({
    respuestas: z.array(resZod)
  });

  const methods = useForm<IResForm>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      respuestas: [],
    },
  });

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors }, reset } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "respuestas",
  });

  useEffect(() => {
    if (dataPreguntas.length > 0) {
      // Limpiar el campo de respuestas
      setValue("respuestas", dataPreguntas.map(pregunta => ({
        userform: userFormId, // ID del userForm
        pregunta: pregunta.id, // ID de la pregunta
        response: '', // Inicializamos la respuesta como vacío
      })));
    }
  }, [dataPreguntas, props.form, setValue]);



  const onSubmit = async (data: IResForm) => {
    try {
      //foreach para recorrer el array de da.respuestas y 
      //hacer la peticion dependiendo del largo de este 
      for (const respuesta of data.respuestas) {
        const { userform, pregunta, response } = respuesta;
        // Envía cada respuesta de forma individual
        await api_postResponseForm({ userform, pregunta, response });
      }
      // Cambio el isCompleted a true
      await api_updateUserForm(userFormId, { isCompleted: true });
      toast.success('Respuestas enviadas con éxito');
      // Espera antes de recargar la página
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error) {
      toast.error('Error al enviar las respuestas');
    }
  };

  return (
    <>
      <div className="w-full md:w-3/4 mx-auto mt-2">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-4 border rounded-md shadow-lg p-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-primary cursor-pointer" onClick={() => router.reload()}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div className="grid col-span-2 gap-4 text-center">
              <h1 className="font-bold text-3xl">
                {props.form.attributes.formulario.data.attributes.Titulo}
              </h1>
            </div>
            <div className="grid col-span-2 gap-4 text-center">
              <p className="font-semibold text-lg">
                {props.form.attributes.formulario.data.attributes.Descripcion}
              </p>
            </div>
            {fields.map((field, index) => {
              const pregunta = dataPreguntas[index];
              return (
                <div key={field.id} className="grid col-span-2 md:col-span-1 w-full">
                  <label className="label font-semibold mb-2 mx-auto ">
                    {pregunta.attributes.Titulo}
                  </label>
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
                            {...register(`respuestas.${index}.response`)} // Asegúrate de manejar la lógica para respuestas múltiples
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
              );
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
  );
}

interface StarRatingProps {
  onChange: (value: number) => void;
  value: number;
}

function StarRating({ onChange, value }: StarRatingProps) {
  const handleClick = (newValue: number) => {
    onChange(newValue);
  };

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
  );
}

function Table({ data }: { data: surveyInterface[] }) {
  const handleRouter = (id: number) => {
    sessionStorage.setItem("id_survey", id.toString());
    router.push("/encuestas/visualizar");
  };
  return (
    <>
      {data.length !== 0 ? (
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                #
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Nombre Encuesta
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Fecha Inicio
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Fecha Termino
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Ver
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((survey, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {survey.attributes.Titulo}{survey.attributes.descripcion}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {survey.attributes.FechaInicio}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {survey.attributes.FechaFin}
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
  );
}
