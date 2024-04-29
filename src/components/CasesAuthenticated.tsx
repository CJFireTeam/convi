import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios from "axios";
import { useEffect, useState, useRef,useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { capitalizeFirstLetter } from "../shared/functions";
import { useUserStore } from "../store/userStore";
import metaI from "../interfaces/meta.interface";
import { api_cases } from "../services/axios.services";
import { Button, Divider, Input, Modal } from "react-daisyui";
function Table({ data }: { data: caseInterface[] }) {

  const [selectedPerson, setSelectedPerson] = useState<caseInterface | null>(null);

  const creationRef = useRef<HTMLDialogElement>(null);

  const handleShowModal = useCallback((person: caseInterface) => {
      setSelectedPerson(person);
      creationRef.current?.showModal();
  }, [creationRef]);

  const handleCloseModal = useCallback(() => {
    creationRef.current?.close();
  }, [creationRef]);

  const paseDate = (date: string) => {
    const fecha = new Date(date);

    const dia = fecha.getDate();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
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
            Derivado a
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibod text-gray-900"
          >
            Cargo
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
              {capitalizeFirstLetter(
                person.attributes.directed.data.attributes.firstname
              )}{" "}
              {capitalizeFirstLetter(
                person.attributes.directed.data.attributes.first_lastname
              )}
            </td>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {
                person.attributes.directed.data.attributes.role.data.attributes
                  .name
              }
            </td>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {paseDate(person.attributes.createdAt)}
            </td>
            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6  space-x-2 items-center">
              <button onClick={() =>{handleShowModal(person)}}>
                <EyeIcon className="h-6 w-6" aria-hidden="true"/>
              </button>
            </td>
            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6  space-x-2 items-center">
              <PencilIcon className="h-6 w-6" aria-hidden="true" />
            </td>
          </tr>
        ))}
      </tbody>
      <Modal backdrop responsive ref={creationRef} className="bg-white">
        <Modal.Header className="font-bold">
          Informacion del caso:
        </Modal.Header>
        <Divider />
        <Modal.Body>
        <ul>
      </ul>
            <div className="my-2">
              <div className="flex flex-wrap">
                <div className="flex flex-col w-full">
                  <label className="label">
                    <span className="label-text">¿Quiénes participaron?</span>
                  </label>
                  <textarea value={selectedPerson ? selectedPerson.attributes.who.values.join(" , ") : ''} readOnly rows={1}></textarea>
                </div>
              </div> 
              <div className="flex flex-wrap">
                <div className="flex flex-col w-full">
                    <label className="label">
                      <span className="label-text">¿Dónde ocurrió?</span>
                    </label>
                    <textarea value={selectedPerson ? selectedPerson.attributes.where.values.join(" , ") : ''} readOnly rows={1}></textarea>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="flex flex-col w-full">
                <label className="label">
                      <span className="label-text">¿Cuándo ocurrió?</span>
                  </label>
                  <textarea value={selectedPerson ? selectedPerson.attributes.when.values.join(" , ") : ''} readOnly rows={1}></textarea>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="flex flex-col w-full">
                <label className="label">
                      <span className="label-text">Relato de los hechos</span>
                  </label>
                  <textarea value={selectedPerson ?selectedPerson.attributes.story : ''} readOnly rows={1}></textarea>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="flex flex-col w-full">
                <label className="label">
                      <span className="label-text">¿Se tomaron medidas?:</span>
                  </label>
                  <textarea value={selectedPerson ?selectedPerson.attributes.measures : ''} readOnly rows={1}></textarea>
                </div>
              </div>
            <div className="my-2">
            <div className="flex items-center justify-center">
              <Button color="neutral" onClick={() =>{handleCloseModal()}}>Cerrar</Button>
            </div>
          </div>
          </div>
        </Modal.Body>
      </Modal>
    </table>
  );
}
function Paginator() {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          href="#"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          href="#"
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> to{" "}
            <span className="font-medium">10</span> of{" "}
            <span className="font-medium">10</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <a
              href="#"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
            <a
              href="#"
              aria-current="page"
              className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              1
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              2
            </a>
            <a
              href="#"
              className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
            >
              3
            </a>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
              ...
            </span>
            <a
              href="#"
              className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
            >
              8
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              9
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              10
            </a>
            <a
              href="#"
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
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

export default function CasosAuthenticated() {
  const { user, GetRole } = useUserStore();
  const [metaData, setMetada] = useState<metaI>();
  const [data, setData] = useState<caseInterface[]>([]);
  const { push } = useRouter();
  useEffect(() => {
    const getData = async () => {
      let assigned : number | undefined= undefined;
      try {
        if (GetRole() !== "Authenticated") {
          assigned = user?.id
        }
        const data = await api_cases({createdBy:user?.id,userId:assigned});
        setData(data.data.data);
        setMetada(data.data.meta);
      } catch (error) {
        console.log(error);
      }
    };
    if (user?.id === 0) return;

    getData();
  }, [user]);
  const redirect = () => {
    push("/casos/crear");
  };
  
  return (
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
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
              <Paginator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
