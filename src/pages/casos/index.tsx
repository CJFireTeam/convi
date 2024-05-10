import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import { useEffect, useState } from "react";
import metaI from "../../interfaces/meta.interface";
import { ChevronLeftIcon, ChevronRightIcon, FolderIcon } from "@heroicons/react/20/solid";
import { capitalizeFirstLetter } from "../../shared/functions";
import { useUserStore } from "../../store/userStore";
import { api_cases } from "../../services/axios.services";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useMenuStore } from "../../store/menus.store";

function Table({ data }: { data: caseInterface[] }) {
  const paseDate = (date: string) => {
    const fecha = new Date(date);

    const dia = fecha.getDate();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  };

  const router = useRouter();

  const handleEdit = (id: number) => {
    sessionStorage.setItem("first_case", id.toString());
    router.push("/casos/denuncia");
  };

  return (
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
            Cargo
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Nombre
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Fecha de creacion
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Ver
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Derivar
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {data.map((person, index) => (
          <tr key={index}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {index + 1}
            </td>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {
                person.attributes.directed.data.attributes.role.data.attributes
                  .name
              }
            </td>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {capitalizeFirstLetter(
                person.attributes.directed.data.attributes.firstname
              )}{" "}
              {capitalizeFirstLetter(
                person.attributes.directed.data.attributes.first_lastname
              )}
            </td>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {paseDate(person.attributes.createdAt)}
            </td>
            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:text-primary space-x-2 items-center">
              <EyeIcon className="h-6 w-6" aria-hidden="true" />
            </td>
            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:text-primary space-x-2 items-center">
              <button onClick={() => handleEdit(person.id)}>
              <PencilIcon className="h-6 w-6" aria-hidden="true"  />
              </button>
            </td>
            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:text-primary space-x-2 items-center">
              <FolderIcon className="h-6 w-6" aria-hidden="true"  />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Paginator({metadata,setMetaData}:{metadata:metaI,setMetaData: (numero:number) => void }) {
  const changePage = async (number:number) => {
    if (number  > metadata.pageCount) return;
    if (number <= 0) return;
    setMetaData(number);
  }
    return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          onClick={() => changePage(metadata.page -1)}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          onClick={() => changePage(metadata.page +1)}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{Math.min(Number(metadata.pageSize) * metadata.page, metadata.total)}</span> de{" "}
          <span className="font-medium">{metadata.total}</span> resultados
        </p>
        </div>
        <div>
        <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <a
              onClick={() => changePage(metadata.page -1)}
              className="cursor-pointer  relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
            {[...Array.from(Array(metadata.pageCount).keys())].map((num, i) => (
              <a
              key={i}
              onClick={() => changePage(num + 1)}
              aria-current="page"
              className={` cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 md:inline-flex ${(num +1) === metadata.page ? 'hover:brightness-90 bg-primary text-white shadow' : ''}`}
              >
              {num + 1}
            </a>
            ))}
            <a
              onClick={() => changePage(metadata.page +1)}
              className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function Casos() {
  const { user, GetRole, role } = useUserStore();
  const [metaData, setMetaData] = useState<metaI>({page:1,pageCount:0,pageSize:0,total:0});
  const [data, setData] = useState<caseInterface[]>([]);
  const { push } = useRouter();
  const getData = async () => {
    let assigned: number | undefined = undefined;
    try {
      if (GetRole() !== "Authenticated") {
        assigned = user?.id
      }
      const data = await api_cases({ createdBy: user?.id, userId: assigned,page:metaData.page });
      setData(data.data.data);
      setMetaData(data.data.meta.pagination);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (user?.id === 0) return;
    getData();
  }, [user]);

  const redirect = () => {
    push("/casos/crear");
  };

  const updatePage = (number:number) => {
    metaData.page = number;
    metaData.pageCount = metaData.pageCount
    metaData.pageSize = metaData.pageSize
    metaData.total = metaData.total
    setMetaData(metaData);
    getData()
  }
  return (
    <>
      {role.name !== "Authenticated" && (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between ">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                Mis Casos
              </h1>
              <p className="mt-2 text-sm text-gray-700"></p>
            </div>
            <div className=" sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white hover:brightness-90"
                onClick={redirect}
              >
                Crear nuevo caso
              </button>
            </div>
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <Table data={data} />
                  <Paginator metadata={metaData} setMetaData={updatePage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
