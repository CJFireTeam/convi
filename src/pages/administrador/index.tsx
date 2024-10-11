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

export default function Index() {
  const { push } = useRouter();
  const redirect = () => {
    push("administrador/crearusuario");
  };
  const { user, GetRole, role } = useUserStore();
  const [metaData, setMetaData] = useState<metaI>({
    page: 1,
    pageCount: 0,
    pageSize: 0,
    total: 0,
  });

  const [data, setData] = useState<surveyInterface[]>([]);
  const getData = async () => {
    
    try {
    //   const response = await api_surveys({
    //     createdBy: user?.id,
    //     page: metaData.page,
    //   });
      //setData((prevData) => [...prevData, ...response.data.data]);
      //setMetaData(response.data.meta.pagination);
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


  if (GetRole() === "admin") {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between ">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Lista de usuarios
            </h1>
            <p className="mt-2 text-sm text-gray-700"></p>
          </div>
          <div className=" sm:ml-16 sm:mt-0 sm:flex-none">
            <Button onClick={redirect} color="primary">
              Crear nuevo usuario
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
                <p className="text-center text-gray-500">Mostrando todos los usuarios.</p>
              )}
            </div>
          </>
        ) : <WarningAlert message="No se han encontrado usuarios" />}

      </div>
    );
  }




}

interface IPreguntas {
  id: number;
  attributes: {
    Tipo: string;
    Titulo: string;
    opciones: [];
  }
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
        <WarningAlert message="No se han encontrado usuarios." />
      )}
    </>
  );
}
