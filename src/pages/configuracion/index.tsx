import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, Pagination, Table } from "react-daisyui";
import { useUserStore } from "../../store/userStore";
import { api_getPositions, api_getProfessionals, api_postPositions, api_postProfessionals, api_putPositions } from "../../services/axios.services";
import metaI from "../../interfaces/meta.interface";
import { PlusIcon, LockClosedIcon, LockOpenIcon, ArrowLongRightIcon, ArrowLongLeftIcon, ArrowPathIcon, ArrowUpCircleIcon } from '@heroicons/react/20/solid';
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
interface professional {
  name: string;
  surname: string;
  position: string;
  establishment: number;
  status: boolean;
}

function Cargos() {
  interface TableCargosI {
    id: number;
    attributes: CargosI
  }
  interface CargosI {
    name: string;
    establishment: number;
    status: boolean
  };
  const Schema = z.object({
    name: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    establishment: z.number(),
    status: z.boolean().default(true)
  });
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CargosI>({
    resolver: zodResolver(Schema),
  });
  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore()
  const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
  const [data, setData] = useState<TableCargosI[]>([])
  const [professional, setProfessional] = useState<professional[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);
  const handleShow = useCallback(() => {
    ref.current?.showModal();
  }, [ref]);
  const hadleClose = useCallback(() => {
    ref.current?.close();
  }, [ref]);


  const getPositions = async (stablishment: number) => {
    try {
      const dataPos = await api_getPositions({ Stablishment: stablishment, page: metaData.page });
      setData(dataPos.data.data);
      setMetaData(dataPos.data.meta.pagination);

    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getPositions(GetStablishment().id)
  }, [])


  const updatePage = (number: number) => {
    if (number < 1) return;
    if (number > metaData.pageCount) return;
    metaData.page = number;
    metaData.pageCount = metaData.pageCount
    metaData.pageSize = metaData.pageSize
    metaData.total = metaData.total
    setMetaData(metaData);
    getPositions(GetStablishment().id)
  }
  const changeStatus = async (id: number, status: boolean) => {
    try {
      await api_putPositions(id, { status: status });
      getPositions(GetStablishment().id);
      setIsLoading(false);
      // hadleClose()
      toast.success('Se actualizo correctamente');
    } catch (error) {
      console.log(error);
      toast.error('ha ocurrido un error')
    }
  };
  const Submit = async (dataZod: CargosI) => {
    setIsLoading(true)
    try {
      await api_postPositions(dataZod);
      getPositions(GetStablishment().id);
      setIsLoading(false);
      hadleClose()
      reset();
      setValue("establishment", GetStablishment().id)
      toast.success('Se Agrego la categoria correctamente');
    } catch (error) {
      console.log(error);
      setIsLoading(false)
      toast.error('ha ocurrido un error')
    }
  };
  const onSubmit: SubmitHandler<CargosI> = (data) => Submit(data)

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  
  return (<>
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-900 lg:mx-0 lg:max-w-none">
          <h2>Cargos</h2>
          <button onClick={handleShow} className="m-2 ">
            <PlusIcon className="h-6 w-6 text-primary" />
          </button>
        </div>
      </div>
      <div className="mt-6 overflow-hidden border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <table className="w-full text-left">
              <thead className="sr-only">
                <tr>
                  <th>Amount</th>
                  <th className="hidden sm:table-cell">Client</th>
                  <th>More details</th>
                </tr>
              </thead>
              <tbody>
                {data.map((element, index) => (
                  <Fragment key={index}>
                    <Profesional id={element.id} name={element.attributes.name} />

                    {/* {day.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="relative py-5 pr-6">
                            <div className="flex gap-x-6">
                              <transaction.icon
                                className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
                                aria-hidden="true"
                              />
                              <div className="flex-auto">
                                <div className="flex items-start gap-x-3">
                                  <div className="text-sm font-medium leading-6 text-gray-900">{transaction.amount}</div>
                                  <div
                                    className={classNames(
                                      'rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset'
                                    )}
                                  >
                                    {transaction.status}
                                  </div>
                                </div>
                                {transaction.tax ? (
                                  <div className="mt-1 text-xs leading-5 text-gray-500">{transaction.tax} tax</div>
                                ) : null}
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                            <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                          </td>
                          <td className="hidden py-5 pr-6 sm:table-cell">
                            <div className="text-sm leading-6 text-gray-900">{transaction.client}</div>
                            <div className="mt-1 text-xs leading-5 text-gray-500">{transaction.description}</div>
                          </td>
                          <td className="py-5 text-right">
                            <div className="flex justify-end">
                              <a
                                href={transaction.href}
                                className="text-sm font-medium leading-6 text-indigo-600 hover:text-indigo-500"
                              >
                                View<span className="hidden sm:inline"> transaction</span>
                                <span className="sr-only">
                                  , invoice #{transaction.invoiceNumber}, {transaction.client}
                                </span>
                              </a>
                            </div>
                            <div className="mt-1 text-xs leading-5 text-gray-500">
                              Invoice <span className="text-gray-900">#{transaction.invoiceNumber}</span>
                            </div>
                          </td>
                        </tr>
                      ))} */}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <Modal ref={ref}>
      <Modal.Header className="font-bold">Creacion de cargo
        <Button onClick={hadleClose} size="sm" color="ghost" shape="circle" className="absolute right-2 top-2">
          x
        </Button>
      </Modal.Header>
      <Modal.Body>
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-2 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3  sm:text-sm">
              Nombre
            </span>
            <input
              type="text"
              {...register("name")}
              className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-primary placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <Button color="primary" animation className="m-2" disabled={isLoading} type="submit" loading={isLoading} >Guardar</Button>
        </form>
      </Modal.Body>
    </Modal>

    <Modal ref={refProfesional}>
        <Modal.Header className="font-bold">Creacion de profesional
          <Button onClick={hadleClose} size="sm" color="ghost" shape="circle" className="absolute right-2 top-2">
            x
          </Button>
        </Modal.Header>
        <Modal.Body>
          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-2 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3  sm:text-sm">
                Nombre
              </span>
              <input
                type="text"
                {...register("name")}
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-primary placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3  sm:text-sm">
                Apellido
              </span>
              <input
                type="text"
                {...register("surname")}
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-primary placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
            <Button color="primary" animation className="m-2" disabled={isLoading} type="submit" loading={isLoading} >Guardar</Button>
          </form>
        </Modal.Body>
      </Modal>
  </>
  )
}
function Profesional({ id, name }: { id: number, name: string }) {
  

  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore()
  const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
  const [data, setData] = useState<professional[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);
  const handleShow = useCallback(() => {
    ref.current?.showModal();
  }, [ref]);
  const hadleClose = useCallback(() => {
    ref.current?.close();
  }, [ref]);

  const getProfessionals = async (stablishment: number) => {
    try {
      const dataPos = await api_getProfessionals({ position: id, Stablishment: stablishment, page: metaData.page });
      setData(dataPos.data.data);
      setMetaData(dataPos.data.meta.pagination);

    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getProfessionals(GetStablishment().id)
  }, [])

  const Submit = async (dataZod: professional) => {
    setIsLoading(true)
    try {
      await api_postProfessionals(dataZod);
      getProfessionals(GetStablishment().id,);
      setIsLoading(false);
      hadleClose()
      reset();
      setValue("establishment", GetStablishment().id);
      setValue("position", id.toString());
      toast.success('Se Agrego el profesional correctamente');
    } catch (error) {
      console.log(error);
      setIsLoading(false)
      toast.error('ha ocurrido un error')
    }
  };

  const onSubmit: SubmitHandler<professional> = (data) => Submit(data)


  return (
    <>
      <tr className="border-gray-200 bg-gray-50 text-sm border-b  leading-6 text-gray-900">
        <th className="flex flex-row justify-between">
          <span>{name}</span>
          <button className="m-2 mr-5">
            <PlusIcon onClick={handleShow} className="h-6 w-6 text-primary " />
          </button>
        </th>
      </tr>
      
    </>
  );
}
export default function Configuracion() {
  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore()

  return (
    <>
      {GetStablishment().id !== 0 && (
        <>
          <Cargos />
          <br />
        </>)}
    </>
  );

}
