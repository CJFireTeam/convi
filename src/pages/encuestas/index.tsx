import { useRouter } from "next/router";
import { Button } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";
import ErrorAlert from "../../components/alerts/errorAlert";
import InfoAlert from "../../components/alerts/infoAlert";
import { useEffect, useState } from "react";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useUserStore } from "@/store/userStore";
import metaI from "@/interfaces/meta.interface";
import { api_surveys } from "@/services/axios.services";

export default function Index() {
  const { push } = useRouter();
  const redirect = () => {
    push("encuestas/creacion");
  };
  const { user, GetRole, role } = useUserStore();
  const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
  const [data, setData] = useState<surveyInterface[]>([]);
  const getData = async () => {
    let assigned: number | undefined = undefined;
    try {
      if (GetRole() !== "Authenticated") {
        assigned = user?.id
      }
      const response = await api_surveys({ createdBy: user?.id, userId: assigned, page: metaData.page });
      setData(response.data.data);
      setMetaData(response.data.meta.pagination);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user?.id === 0) return;
    getData();
  }, [user]);


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
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <Table data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Table({ data }: { data: surveyInterface[] }) {
  console.log(data)
  return (
    <>
      {data.length !== 0  ? (
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
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {survey.attributes.titulo}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {survey.attributes.fechaInicio}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {survey.attributes.fechaFin}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <button >
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
