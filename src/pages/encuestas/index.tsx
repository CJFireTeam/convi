import router, { useRouter } from "next/router";
import { Button, Modal } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";
import ErrorAlert from "../../components/alerts/errorAlert";
import InfoAlert from "../../components/alerts/infoAlert";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/userStore";
import metaI from "@/interfaces/meta.interface";
import { api_getQuestions, api_surveys } from "@/services/axios.services";
import { differenceInDays } from 'date-fns';
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/20/solid";
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
    console.log(questions.data.data);
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
      setData(response.data.data);
      setMetaData(response.data.meta.pagination);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user?.id === 0) return;
    if (GetRole() === "Profesor") getData();
  }, [user]);

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
              {metaData.page < metaData.pageCount && (
                <Button onClick={() => setMetaData({ ...metaData, page: metaData.page + 1 })} color="primary">
                  Cargar más encuestas
                </Button>
              )}
              {metaData.page >= metaData.pageCount && (
                <p>No hay más encuestas</p>
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

function FomrularyResponse(props: props) {
  useEffect(()=> {
    console.log(props.form.id)
    console.log(props.form.attributes.formulario.data.id)
  },[])

  return (
    <>
      <ArrowLeftIcon className="btn btn-outline btn-primary rounded-full" onClick={() => router.reload()} ></ArrowLeftIcon>
      <div className="w-4/5 mx-auto">
        <div className="grid grid-col-1 md:grid-col-2 gap-4">

          <div className="grid col-span-2 gap-4 text-center">
            <h1 className="font-bold text-3xl">{props.form.attributes.formulario.data.attributes.Titulo.charAt(0).toUpperCase() +
              props.form.attributes.formulario.data.attributes.Titulo.slice(1)}</h1>
          </div>
          <div className="grid col-span-2 gap-4 text-center">
            <p className="font-semibold text-lg">{props.form.attributes.formulario.data.attributes.Descripcion.charAt(0).toUpperCase() +
              props.form.attributes.formulario.data.attributes.Descripcion.slice(1)}</p>
          </div>

        </div>
      </div>
    </>
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
