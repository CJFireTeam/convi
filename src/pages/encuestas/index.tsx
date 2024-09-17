import router, { useRouter } from "next/router";
import { Button, Input, Modal, Textarea } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";
import ErrorAlert from "../../components/alerts/errorAlert";
import InfoAlert from "../../components/alerts/infoAlert";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/userStore";
import metaI from "@/interfaces/meta.interface";
import { api_getQuestions, api_getQuestionsByForm, api_postResponseForm, api_surveys } from "@/services/axios.services";
import { differenceInDays } from 'date-fns';
import { ArrowLeftIcon, EyeIcon, PaperAirplaneIcon, StarIcon } from "@heroicons/react/20/solid";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
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
        <div className="mt-8 flow-root">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {data.length != 0 ?(
            <>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <Table data={data} />
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
            ): <WarningAlert message="Aun no has creado una encuesta" />}
          </div>
        </div>
      </div>
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
        {!form && (<>
          <div className="w-4/5 mx-auto">
            {dataQuestionary.map((e, index) => (
              <>
                <div
                  onClick={() => {
                    setSelectedForm(e);
                    setForm(true);
                  }}
                  key={index}
                  className="bg-white shadow-md rounded-md p-4 my-2 hover:border-primary hover:border-2 hover:cursor-pointer"
                >
                  <div className="flex justify-between mb-2">
                    <h2 className="font-bold text-lg">
                      {e.attributes.formulario.data.attributes.Titulo}
                    </h2>

                    <div>
                      <span
                        className={`font-bold ${differenceInDays(new Date(e.attributes.formulario.data.attributes.FechaFin), new Date(e.attributes.formulario.data.attributes.FechaInicio)) > 5 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        Termina en {differenceInDays(new Date(e.attributes.formulario.data.attributes.FechaFin), new Date(e.attributes.formulario.data.attributes.FechaInicio))} días.
                      </span>

                    </div>
                  </div>
                  <p className="text-gray-600">
                    {e.attributes.formulario.data.attributes.Descripcion}
                  </p>
                </div>
              </>
            ))}
          </div>
          {ExtraPages()}
        </>)}
        {form && selectedForm && (
          <FomrularyResponse form={selectedForm} userId={user.id} />
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
  userId: number;
}

interface IResForm {
  userForm: number;
  validationResponse: IQuestion[];
}
interface IQuestion {
  pregunta: number;
  response: IRes[];
}
interface IRes {
  respuesta: string | string[];
}


function FomrularyResponse(props: props) {
  const formId = props.form.attributes.formulario.data.id

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

  const res = z.object({
    respuesta: z.union([
      z.string().min(1, "Este campo es obligatorio"),
      z.array(z.string()).min(1, "Debes seleccionar al menos una opción")
    ]),
  });

  const SchemaRespuesta = z.object({
    pregunta: z.number({ required_error: "Campo obligatorio", invalid_type_error: "Tipo Inválido" }),
    response: z.array(res),
  });

  const ValidationZod = z.object({
    userForm: z.number(),
    validationResponse: z.array(SchemaRespuesta),
  });

  const methods = useForm<IResForm>({
    resolver: zodResolver(ValidationZod),
    defaultValues: {
      userForm: props.userId,
      validationResponse: [],
    },
  });

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors }, reset } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "validationResponse"
  });

  useEffect(() => {
    // Inicializar los campos del formulario basados en dataPreguntas
    dataPreguntas.forEach((pregunta) => {
      append({
        pregunta: pregunta.id,
        response: [{ respuesta: pregunta.attributes.Tipo === "multipleChoice" ? [] : "" }]
      });
    });
  }, [dataPreguntas, append]);

  useEffect(() => {
    setValue('userForm', props.userId);
  }, [props.userId, setValue]);

  // const onSubmit = async (data: IResForm) => {
  //   console.log(data);
    /* try {
      const response = await api_postResponseForm(data);
      if (response) {
        toast.success('Encuesta enviada con éxito')
        router.reload();
      }
    } catch (errors) {
      toast.error('Error al enviar la encuesta');
    } */
  // };

  /* const onSubmit = async (data: IResForm) => {
    // Transformar datos según lo que espera el backend
    const transformedData = {
      userForm: data.userForm,
      validationResponse: data.validationResponse.map((item) => ({
        pregunta: item.pregunta,
        response: item.response[0].respuesta,  // Asumiendo que response es un único valor
      })),
    };
  
    console.log(transformedData);
  
    try {
      const response = await api_postResponseForm(transformedData);
      if (response) {
        toast.success('Encuesta enviada con éxito');
        router.reload();
      }
    } catch (errors) {
      toast.error('Error al enviar la encuesta');
    }
  }; */

    //inserta pero no relaciona
  // const onSubmit = async (data: IResForm) => {
  //   const transformedData = {
  //     pregunta: data.validationResponse.map((item) => ({
  //       id: item.pregunta,
  //     })),
  //     response: data.validationResponse.map((item) => ({
  //       respuesta: item.response[0].respuesta,
  //     })),
  //   };
  
  //   const userForm = {
  //     user: props.userId,
  //     pregunta: transformedData.pregunta,
  //     response: JSON.stringify(transformedData.response),
  //   };
  
  //   try {
  //     const response = await api_postResponseForm(userForm);
  //     if (response) {
  //       toast.success('Encuesta enviada con éxito');
  //       // router.reload();
  //     }
  //   } catch (errors) {
  //     toast.error('Error al enviar la encuesta');
  //   }
  // };

  const onSubmit = async (data: IResForm) => {
    const transformedData = {
      pregunta: data.validationResponse.map((item) => ({
        id: item.pregunta,
        formulario: props.form.id, // Agrega el id del formulario
      })),
      response: data.validationResponse.map((item) => ({
        respuesta: item.response[0].respuesta,
        pregunta: item.pregunta, // Agrega el id de la pregunta
      })),
    };
  
    const userForm = {
      formulario: props.form.id, // Agrega el id del formulario
      pregunta: transformedData.pregunta,
      response: JSON.stringify(transformedData.response),
    };
  
    try {
      console.log("este es el response enviado",userForm)
      const response = await api_postResponseForm(userForm);
      if (response) {
        toast.success('Encuesta enviada con éxito');
      }
    } catch (errors) {
      toast.error('Error al enviar la encuesta');
    }
  };

  return (
    <>
      <ArrowLeftIcon className="btn btn-outline btn-primary rounded-full" onClick={() => router.reload()} />
      <div className="w-full md:w-3/4 mx-auto mt-2">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid grid-col-1 md:grid-col-2 gap-4 border rounded-md shadow-lg p-4">
            <div className="grid grid-col-1 md:col-span-2 gap-4 text-center">
              <h1 className="font-bold text-3xl">
                {props.form.attributes.formulario.data.attributes.Titulo.charAt(0).toUpperCase() +
                  props.form.attributes.formulario.data.attributes.Titulo.slice(1)}
              </h1>
            </div>
            <div className="grid col-span-1 md:col-span-2 gap-4 text-center">
              <p className="font-semibold text-lg">
                {props.form.attributes.formulario.data.attributes.Descripcion.charAt(0).toUpperCase() +
                  props.form.attributes.formulario.data.attributes.Descripcion.slice(1)}
              </p>
            </div>
            {fields.map((field, index) => {
              const pregunta = dataPreguntas[index];
              return (
                <div key={field.id} className="flex flex-col items-center w-full">
                  <label className="label font-semibold mb-2 md:mb-0 md:mr-2 inline-block">
                    {pregunta.attributes.Titulo.charAt(0).toUpperCase() + pregunta.attributes.Titulo.slice(1)}
                  </label>
                  {pregunta.attributes.Tipo === "option" && (
                    <>
                      {pregunta.attributes.opciones.map((opcion, i) => (
                        <div key={i} className="flex items-center mb-2">
                          <input
                            type="radio"
                            {...register(`validationResponse.${index}.response.0.respuesta`)}
                            value={opcion}
                            className="mr-2"
                          />
                          <label>{opcion}</label>
                        </div>
                      ))}
                      {errors.validationResponse?.[index]?.response?.[0]?.respuesta && (
                        <p className="text-red-500 text-sm mt-1" role="alert">
                          Por favor, seleccione una opción.
                        </p>
                      )}
                    </>
                  )}
                  {pregunta.attributes.Tipo === "text" && (
                    <>
                      <Textarea
                        rows={3}
                        placeholder="Ingrese su respuesta..."
                        {...register(`validationResponse.${index}.response.0.respuesta`)}
                        className="textarea textarea-primary w-full"
                      />
                      {errors.validationResponse?.[index]?.response?.[0]?.respuesta && (
                        <p className="text-red-500 text-sm mt-1" role="alert">
                          Este campo es obligatorio.
                        </p>
                      )}
                    </>
                  )}
                  {pregunta.attributes.Tipo === "qualification" && (
                    <>
                      <StarRating
                        value={Number(watch(`validationResponse.${index}.response.0.respuesta`) || 0)}
                        onChange={(value) => setValue(`validationResponse.${index}.response.0.respuesta`, value.toString())}
                      />
                      {errors.validationResponse?.[index]?.response?.[0]?.respuesta && (
                        <p className="text-red-500 text-sm mt-1" role="alert">
                          Por favor, seleccione una calificación.
                        </p>
                      )}
                    </>
                  )}
                  {pregunta.attributes.Tipo === "multipleChoice" && (
                    <>
                      {pregunta.attributes.opciones.map((opcion, i) => (
                        <div key={i} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            {...register(`validationResponse.${index}.response.0.respuesta`)}
                            value={opcion}
                            className="mr-2"
                          />
                          <label>{opcion}</label>
                        </div>
                      ))}
                      {errors.validationResponse?.[index]?.response?.[0]?.respuesta && (
                        <p className="text-red-500 text-sm mt-1" role="alert">
                          Por favor, seleccione al menos una opción.
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            <div className="grid col-span-2 gap-2 w-2/5 mx-auto">
              <button type="submit" className="btn btn-outline btn-primary">
                Enviar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
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
    <div className="flex space-x-2">
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
                  <button>
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
