import router, { useRouter } from "next/router";
import { Button, Input, Modal, Textarea } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";
import ErrorAlert from "../../components/alerts/errorAlert";
import InfoAlert from "../../components/alerts/infoAlert";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/userStore";
import metaI from "@/interfaces/meta.interface";
import { api_getQuestions, api_getQuestionsByForm, api_surveys } from "@/services/axios.services";
import { differenceInDays } from 'date-fns';
import { ArrowLeftIcon, EyeIcon, StarIcon } from "@heroicons/react/20/solid";
import { z } from "zod";
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
    if (user?.id !== 0 && GetRole() === "Profesor") {
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
    console.log(GetRole());
    if (GetRole() === "Authenticated") getQuestionary();
  }, [user]);


  const [form, setForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState<questionaryI | null>(null);

  if (GetRole() === "Profesor") {
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
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"></div>
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
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
          <FomrularyResponse form={selectedForm} />
        )}
      </>
    );
  }
  return null;
}

interface props {
  form: questionaryI;

}

interface IPreguntas {
  id: number;
  attributes: {
    Tipo: string;
    Titulo: string;
    opciones: [];
  }
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
    respuesta:z.string(),
  });

  const SchemaRespuesta = z.object({
    pregunta: z.number(),
    response: z.array(res),
  });

  const Validation = z.object({
    userform: z.number(),
    validationResponse:z.array(SchemaRespuesta),
  }) 

  return (
    <>
      <ArrowLeftIcon className="btn btn-outline btn-primary rounded-full" onClick={() => router.reload()} ></ArrowLeftIcon>
      <div className="w-full md:w-3/4 mx-auto mt-2">
        <div className="grid grid-col-1 md:grid-col-2 gap-4 border rounded-md shadow-lg p-4">
          <div className="grid grid-col-1 md:col-span-2 gap-4 text-center">
            <h1 className="font-bold text-3xl">{props.form.attributes.formulario.data.attributes.Titulo.charAt(0).toUpperCase() +
              props.form.attributes.formulario.data.attributes.Titulo.slice(1)}</h1>
          </div>
          <div className="grid col-span-1 md:col-span-2 gap-4 text-center">
            <p className="font-semibold text-lg">{props.form.attributes.formulario.data.attributes.Descripcion.charAt(0).toUpperCase() +
              props.form.attributes.formulario.data.attributes.Descripcion.slice(1)}</p>
          </div>
          {dataPreguntas.map((e, index) => (
            <>
              <div className="flex flex-col items-center" key={index}>
                {e.attributes.Tipo === "option" && (
                  <>
                    <label className="label font-semibold mb-2 md:mb-0 md:mr-2 inline-block">{e.attributes.Titulo.charAt(0).toUpperCase() +
                      e.attributes.Titulo.slice(1)}</label>
                    {e.attributes.opciones.map((opciones, i) => (<>
                      {opciones && (<>
                        <div key={i} className="flex items-center mb-2">
                          <input type="radio" name={e.attributes.Tipo} className="mr-2" />
                          <label>{opciones}</label>
                        </div>
                      </>)}
                    </>))}
                  </>
                )}

                {e.attributes.Tipo === "text" && (
                  <>
                    <label className="label font-semibold mb-2 md:mb-0 md:mr-2 inline-block">{e.attributes.Titulo.charAt(0).toUpperCase() +
                      e.attributes.Titulo.slice(1)}</label>
                    {e.attributes.opciones.map((opciones, i) => (<>
                      {opciones === "input" && (<>
                        <Textarea rows={3} placeholder="Ingrese su respuesta..." key={i} className="textarea textarea-primary w-3/4" />
                      </>)}
                    </>))}
                  </>
                )}

                {e.attributes.Tipo === "qualification" && (
                  <>
                    <label className="label font-semibold mb-2 md:mb-0 md:mr-2 inline-block">
                      {e.attributes.Titulo.charAt(0).toUpperCase() + e.attributes.Titulo.slice(1)}
                    </label>

                    {/* Renderizamos solo un conjunto de estrellas */}
                    <StarRating />
                  </>
                )}

                {e.attributes.Tipo === "multipleChoice" && (
                  <>
                    <label className="label font-semibold mb-2 md:mb-0 md:mr-2 inline-block">{e.attributes.Titulo.charAt(0).toUpperCase() +
                      e.attributes.Titulo.slice(1)}</label>
                    {e.attributes.opciones.map((opciones, i) => (<>
                      {opciones && (<>
                        <div key={i} className="flex items-center mb-2">
                          <input type="checkbox" name={e.attributes.Tipo} className="mr-2" />
                          <label>{opciones}</label>
                        </div>
                      </>)}
                    </>))}
                  </>
                )}
              </div>
            </>
          ))}

        </div>
      </div>
    </>
  );
}

function StarRating() {
  const [rating, setRating] = useState<number>(0);

  const handleClick = (value: number) => {
    setRating(value);
  };

  return (
    <div className="flex space-x-2">
      {/* Un único conjunto de estrellas */}
      {[1, 2, 3, 4, 5].map((index) => (
        <svg
          key={index}
          onClick={() => handleClick(index)}
          className={`h-6 w-6 cursor-pointer ${index <= rating ? "text-yellow-500" : "text-gray-400"
            }`}
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
  console.log("data llegada ala tabla de peticiones profesor:", data);
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
