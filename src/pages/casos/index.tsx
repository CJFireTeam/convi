import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import { useCallback, useEffect, useRef, useState } from "react";
import metaI from "../../interfaces/meta.interface";
import { ChevronLeftIcon, ChevronRightIcon, EnvelopeIcon, EnvelopeOpenIcon, FolderIcon } from "@heroicons/react/20/solid";
import { capitalizeFirstLetter } from "../../shared/functions";
import { useUserStore } from "../../store/userStore";
import { api_cases } from "../../services/axios.services";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useMenuStore } from "../../store/menus.store";
import { Button, Divider, Modal } from "react-daisyui";
enum UserTypes {
  "apoderado" = "Apoderado",
  "alumno" = "Alumno",
  "otro" = "No configurado",
}
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
  const { user, GetRole, role } = useUserStore();
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
  const handleDerivedEdit = (id: number, derived: boolean ) => {
    localStorage.setItem("case", id.toString());
    localStorage.setItem("derivado", derived.toString());
    router.push("/casos/categorizar");
  };

  const handleClickGestionar = (id: number, derived: boolean )=>{
    localStorage.setItem("complaint", id.toString())
    localStorage.setItem("case", id.toString());
    localStorage.setItem("derivado", derived.toString());
    router.push("/casos/gestionar")
  }

  const colorsBG = (colors: number) => {
    console.log(colors)
    switch (colors) {
      case 1:
          return "bg-white"
        break;
        case 2:
          return "bg-emerald-100"
        break;
        case 3:
          return "bg-emerald-200"
        break;
        case 4:
          return "bg-emerald-300"
        break;    
      default:
        return "bg-white"
        break;
    }
    ;
  }
  return (
    <>
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
            Creado por
          </th>
          {/* <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Nombre
          </th> */}
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Fecha de creacion
          </th>
          {role.name !== "Encargado de Convivencia Escolar" && ( 
          <> 
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
          </>
          )}
          {role.name === "Encargado de Convivencia Escolar" && (  
          <>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Gestionar
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Ver
          </th>
          </>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {data.map((person, index) => (
          <tr key={index} className={`${colorsBG(person.attributes.fase)}`}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {index + 1}
            </td>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {capitalizeFirstLetter(
                person.attributes.created.data.attributes.firstname
              )}{" "}
              {capitalizeFirstLetter(
                person.attributes.created.data.attributes.first_lastname
              )}
              <br />
              {
               person.attributes.created.data.attributes.role.data.attributes.name === "Authenticated" && 
               person.attributes.created.data.attributes.tipo
              }
              {
               person.attributes.created.data.attributes.role.data.attributes.name !== "Authenticated" && person.attributes.created.data.attributes.role.data.attributes.name 
              }
              {/* {person.attributes.created.data.attributes.role.data.attributes.name} */}
            </td>
            {/* <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {capitalizeFirstLetter(
                person.attributes.directed.data.attributes.firstname
              )}{" "}
              {capitalizeFirstLetter(
                person.attributes.directed.data.attributes.first_lastname
              )}
              <br />
              {person.attributes.directed.data.attributes.role.data.attributes.name}
            </td> */}
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {paseDate(person.attributes.createdAt)}
            </td>
            {role.name !== "Encargado de Convivencia Escolar" && (  
            <>
            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:text-primary space-x-2 items-center">
              <button onClick={() => { handleShowModal(person) }}>
                  <EyeIcon className="h-6 w-6" aria-hidden="true" />
                </button>
            </td>
            { person.attributes.directed.data.id === user.id &&(
              <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:text-primary space-x-2 items-center">
              <button onClick={() => handleEdit(person.id)}>
                <PencilIcon className="h-6 w-6" aria-hidden="true"  />
              </button>
            </td>
             )}
            
            </>
            )}
            {role.name === "Encargado de Convivencia Escolar" && (   
              <>
              <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:text-primary space-x-2 items-center">
                {person.attributes.derived !== true &&(
                  <button onClick={() => handleEdit(person.id)}>
                    <h1>{person.attributes.derived}</h1>
                    <PencilIcon className="h-6 w-6" aria-hidden="true"  />
                  </button>
                 )}
                {person.attributes.derived === true && person.attributes.fase === 1 &&(
                  <button onClick={() => handleDerivedEdit(person.id,person.attributes.derived)}>
                    <FolderIcon className="h-6 w-6" aria-hidden="true"  />
                  </button>
                )}
                {person.attributes.derived === true && person.attributes.fase === 2 &&(
                  <button onClick={() =>handleClickGestionar(person.id,person.attributes.derived)}>
                    <EnvelopeIcon className="h-6 w-6" aria-hidden="true"  />
                  </button>
                )}
              </td>
              <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:text-primary space-x-2 items-center">
                <button onClick={() => { handleShowModal(person) }}>
                    <EyeIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
              </td>
              </>
            )}

          </tr>
        ))}
      </tbody>
    </table>
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
                <textarea value={selectedPerson ? selectedPerson.attributes.story : ''} readOnly rows={1}></textarea>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="flex flex-col w-full">
                <label className="label">
                  <span className="label-text">¿Se tomaron medidas?:</span>
                </label>
                <textarea value={selectedPerson ? selectedPerson.attributes.measures : ''} readOnly rows={1}></textarea>
              </div>
            </div>
            <div className="my-2">
              <div className="flex items-center justify-center">
                <Button color="neutral" onClick={() => { handleCloseModal() }}>Cerrar</Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      </>
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
          className=" inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Pagina Anterior
        </a>
        <a
          onClick={() => changePage(metadata.page +1)}
          className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Proxima Pagina
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
              className="cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
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
