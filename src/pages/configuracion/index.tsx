import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, Pagination, Table } from "react-daisyui";
import { useUserStore } from "../../store/userStore";
import { api_getPositions, api_getProfessionals, api_postPositions, api_postProfessionals, api_putPositions, api_putProfessionals } from "../../services/axios.services";
import metaI from "../../interfaces/meta.interface";
import { PlusIcon, LockClosedIcon, LockOpenIcon, ArrowLongRightIcon, ArrowLongLeftIcon, ArrowPathIcon, ArrowUpCircleIcon } from '@heroicons/react/20/solid';
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import router from "next/router";
interface ProfessionalI {
  names: string;
  surnames: string;
  position: number;
  establishment: number;
  status: boolean;
  email: string;
}

interface tableProfessionalI {
  id: number;
  attributes: ProfessionalI
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
    name: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(1),
    establishment: z.number(),
    status: z.boolean().default(true)
  });
  const SchemaProfessional = z.object({
    names: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    surnames: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
    establishment: z.number(),
    status: z.boolean().default(true),
    position: z.number(),
    email: z.string(),
  })
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CargosI>({
    resolver: zodResolver(Schema),
  });
  const { register: registerProfessional, handleSubmit: handleSubmitProfessional, setValue: setValueProfessional, reset: resetProfessional, formState: { errors: errorsProfessional } } = useForm<ProfessionalI>({
    resolver: zodResolver(SchemaProfessional),
  });
  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore()
  const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
  const [data, setData] = useState<TableCargosI[]>([])
  const [professional, setProfessional] = useState<ProfessionalI[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);
  const handleShow = useCallback(() => {
    ref.current?.showModal();
    setValue('establishment', GetStablishment().id);
  }, [ref]);
  const hadleClose = useCallback(() => {
    ref.current?.close();
  }, [ref]);


  const getPositions = async (stablishment: string) => {
    try {
      const dataPos = await api_getPositions({ Stablishment: stablishment, page: metaData.page });
      setData(dataPos.data.data);
      setMetaData(dataPos.data.meta.pagination);

    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getPositions(GetStablishment().name)
  }, [])

  const SubmitProfessional = async (dataZod: ProfessionalI) => {
    try {
      await api_postProfessionals(dataZod);
      hadleCloseProfesional()
      resetProfessional();
      toast.success('Se agrego al profesional correctamente');
      router.reload()
    } catch (error) {
      console.log(error);
      setIsLoading(false)
      toast.error('ha ocurrido un error')
    }
  };

  const onSubmitProfessional: SubmitHandler<ProfessionalI> = (data) => SubmitProfessional(data)

  const updatePage = (number: number) => {
    if (number < 1) return;
    if (number > metaData.pageCount) return;
    metaData.page = number;
    metaData.pageCount = metaData.pageCount
    metaData.pageSize = metaData.pageSize
    metaData.total = metaData.total
    setMetaData(metaData);
    getPositions(GetStablishment().name)
  }
  const changeStatus = async (id: number, status: boolean) => {
    try {
      await api_putPositions(id, { status: status });
      getPositions(GetStablishment().name);
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
      getPositions(GetStablishment().name);
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

  const refProfesional = useRef<HTMLDialogElement>(null);
  const handleShowProfesional = useCallback((id: number) => {
    setValueProfessional("establishment", GetStablishment().id);
    setValueProfessional("position", id);
    refProfesional.current?.showModal();
  }, [refProfesional]);

  const hadleCloseProfesional = useCallback(() => {
    refProfesional.current?.close();
  }, [refProfesional]);

  useEffect(() => {
    console.log(errors);
  }, [errors])


  return (
    <>
      <Head>
        <title>Configuración</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="container-md flex justify-center p-4 md:mx-20 lg:mx-18">
        <div className="p-5 flex-col container">
          <div className="px-4 sm:px-6 lg:px-8 border rounded-lg shadow mb-4">
            <div className="flex flex-row justify-between max-w-2xl text-base font-semibold leading-6 text-gray-900 lg:mx-0 lg:max-w-none">
              <h2 className="m-3 order-1">Cargos</h2>
              <button onClick={handleShow} className="m-3 order-2">
                <PlusIcon className="h-6 w-6 text-primary" />
              </button>
            </div>
          </div>

          <div className=" overflow-hidden">
            <div className="max-w-2xl text-base font-semibold leading-6 text-gray-900 lg:mx-0 lg:max-w-none">
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
                        <Profesional handleShow={handleShowProfesional} id={element.id} name={element.attributes.name} />

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
          <Modal.Header>
            <span className="font-bold flex justify-center text-primary mt-4">Creación de cargo</span>
            <Button onClick={hadleClose} size="sm" color="ghost" shape="circle" className="text-base font-semibold absolute right-2 top-2">
              X
            </Button>
          </Modal.Header>
          <Modal.Body>
            <form className="flex flex-col p-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex-col rounded-md shadow-sm">
                <span className="text-base font-semibold leading-6 text-gray-900 order-1 ">
                  Nombre del cargo:
                </span>
                <input
                  type="text"
                  {...register("name")}
                  className="order-2 mt-1 w-full rounded-md text-base font-semibold leading-6 text-gray-900 ring-1 ring-primary focus:ring-2 focus:ring-primary "
                />
              </div>
              <Button color="primary" animation className="order-3 mt-4 md:mx-20 lg:mx-20" disabled={isLoading} type="submit" loading={isLoading} >Guardar</Button>
            </form>
          </Modal.Body>
        </Modal>

        <Modal ref={refProfesional}>
          <Modal.Header>
            <span className="font-bold flex justify-center text-primary mt-4">Creación de profesional</span>
            <Button onClick={hadleCloseProfesional} size="sm" color="ghost" shape="circle" className="text-base font-semibold absolute right-2 top-2">
              X
            </Button>
          </Modal.Header>
          <Modal.Body>
            <form className="flex flex-col p-4" onSubmit={handleSubmitProfessional(onSubmitProfessional)}>
              <div className="flex-col rounded-md shadow-sm">
                <span className="text-base font-semibold leading-6 text-gray-900 order-1">
                  Nombres:
                </span>
                <input
                  type="text"
                  {...registerProfessional("names")}
                  className="order-2 mt-1 mb-1 w-full rounded-md text-base font-semibold leading-6 text-gray-900 ring-1 ring-primary focus:ring-2 focus:ring-primary "
                />
                <span className="text-base font-semibold leading-6 text-gray-900 order-3">
                  Apellidos:
                </span>
                <input
                  type="text"
                  {...registerProfessional("surnames")}
                  className="order-4 mt-1 w-full rounded-md text-base font-semibold leading-6 text-gray-900 ring-1 ring-primary focus:ring-2 focus:ring-primary "
                />
                <span className="text-base font-semibold leading-6 text-gray-900 order-3">
                  Correo Electronico:
                </span>
                <input
                  type="text"
                  {...registerProfessional("email")}
                  className="order-4 mt-1 w-full rounded-md text-base font-semibold leading-6 text-gray-900 ring-1 ring-primary focus:ring-2 focus:ring-primary "
                />
              </div>
              <Button color="primary" animation className="order-3 mt-4 md:mx-20 lg:mx-20" disabled={isLoading} type="submit" loading={isLoading} >Guardar</Button>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  )
}

function Profesional({ id, name, handleShow }: { id: number, name: string, handleShow: (id: number) => void; }) {
  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore()

  const [metaData, setMetaData] = useState<metaI>({ page: 1, pageCount: 0, pageSize: 0, total: 0 });
  const [data, setData] = useState<tableProfessionalI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getProfessionals = async (stablishment: string) => {
    try {
      const dataPos = await api_getProfessionals({ position: name, Stablishment: stablishment, page: metaData.page });
      setData(dataPos.data.data);
      setMetaData(dataPos.data.meta.pagination);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getProfessionals(GetStablishment().name);
  }, []);

  const toggleStatus = async (professionalId: number, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      const newStatus = !currentStatus;

      // Enviar la actualización al servidor
      await api_putProfessionals(professionalId, { data: { status: newStatus } });

      // Actualizar el estado del profesional localmente después de recibir la respuesta del servidor
      const updatedData = data.map(professional => {
        if (professional.id === professionalId) {
          return {
            ...professional,
            attributes: {
              ...professional.attributes,
              status: newStatus
            }
          };
        }
        return professional;
      });
      setData(updatedData);

      setIsLoading(false);
      toast.success('Se actualizó el estado correctamente');
    } catch (error) {
      console.log(error);
      toast.error('No se pudo actualizar el estado');
      setIsLoading(false);
    }
  };


  return (
    <>
    <Head>
        <title>Configuración</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <tr className="bg-gray-50 text-sm leading-6 text-gray-900">
        <th className="flex flex-row justify-between border rounded-lg p-2">
          <span className="ml-3">{name}</span>
          <button className="mr-3" onClick={() => handleShow(id)}>
            <PlusIcon className="h-6 w-6 text-primary " />
          </button>
        </th>
      </tr>
      {data.map((profesional, index) => (
        <tr key={index}>
          <td className="p-3 flex flex-col md:flex-row lg:flex-row justify-between text-left border rounded-md">
            <span className="order-1 flex-1"> Nombre: {profesional.attributes.names} {profesional.attributes.surnames}</span>
            <span className="order-2 flex-1"> Correo electronico: {profesional.attributes.email}</span>
            <button className="order-3 flex-none" onClick={() => toggleStatus(profesional.id, profesional.attributes.status)}>
              {profesional.attributes.status ? <LockOpenIcon className=" w-7 h-7" /> : <LockClosedIcon className=" w-7 h-7" />}
            </button>
          </td>
        </tr>
      ))}
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
