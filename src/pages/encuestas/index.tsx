import { useRouter } from "next/router";
import { Button } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";
import ErrorAlert from "../../components/alerts/errorAlert";
import InfoAlert from "../../components/alerts/infoAlert";
import { useState } from "react";
export default function Index() {
  const { push } = useRouter();
  const redirect = () => {
    push("encuestas/creacion");
  };
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
              <Table />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Table() {
    const [encuestas, setEncuestas] = useState("");
  return (
    <>
    {encuestas &&(

    )}
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
              Fecha inicio
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
        <tbody className="divide-y divide-gray-200 bg-white"></tbody>
      </table>
    </>
  );
}
