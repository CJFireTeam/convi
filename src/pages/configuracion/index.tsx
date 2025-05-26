"use client";

import type React from "react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-daisyui";
import { useUserStore } from "../../store/userStore";
import {
  api_getPositions,
  api_getProfessionals,
  api_postPositions,
  api_postProfessionals,
  api_putPositions,
  api_putProfessionals,
} from "../../services/axios.services";
import type metaI from "../../interfaces/meta.interface";
import {
  PlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
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
  attributes: ProfessionalI;
}

function Cargos() {
  interface TableCargosI {
    id: number;
    attributes: CargosI;
  }
  interface CargosI {
    name: string;
    establishment: number;
    status: boolean;
  }

  const Schema = z.object({
    name: z
      .string({
        required_error: "Campo Requerido",
        invalid_type_error: "Campo Requerido",
      })
      .min(1),
    establishment: z.number(),
    status: z.boolean().default(true),
  });

  const SchemaProfessional = z.object({
    names: z.string({
      required_error: "Campo Requerido",
      invalid_type_error: "Campo Requerido",
    }),
    surnames: z.string({
      required_error: "Campo Requerido",
      invalid_type_error: "Campo Requerido",
    }),
    establishment: z.number(),
    status: z.boolean().default(true),
    position: z.number(),
    email: z.string(),
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

  const {
    register: registerProfessional,
    handleSubmit: handleSubmitProfessional,
    setValue: setValueProfessional,
    reset: resetProfessional,
    formState: { errors: errorsProfessional },
  } = useForm<ProfessionalI>({
    resolver: zodResolver(SchemaProfessional),
  });

  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore();
  const [metaData, setMetaData] = useState<metaI>({
    page: 1,
    pageCount: 0,
    pageSize: 5,
    total: 0,
  });
  const [data, setData] = useState<TableCargosI[]>([]);
  const [professional, setProfessional] = useState<ProfessionalI[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ref = useRef<HTMLDialogElement>(null);
  const handleShow = useCallback(() => {
    ref.current?.showModal();
    setValue("establishment", GetStablishment().id);
  }, [ref]);

  const hadleClose = useCallback(() => {
    ref.current?.close();
  }, [ref]);

  const getPositions = async (stablishment: string, page = 1, search = "") => {
    try {
      const dataPos = await api_getPositions({
        Stablishment: stablishment,
        page: page,
        search: search,
        pageSize: metaData.pageSize,
      });
      setData(dataPos.data.data);
      setMetaData(dataPos.data.meta.pagination);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPositions(GetStablishment().name, 1, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    getPositions(GetStablishment().name, metaData.page, searchTerm);
  }, []);

  const SubmitProfessional = async (dataZod: ProfessionalI) => {
    try {
      setIsLoading(true);
      await api_postProfessionals(dataZod);
      hadleCloseProfesional();
      resetProfessional();
      toast.success("Se agrego al profesional correctamente");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("ha ocurrido un error");
    } finally {
      setIsLoading(false);
      router.reload();
    }
  };

  const onSubmitProfessional: SubmitHandler<ProfessionalI> = (data) =>
    SubmitProfessional(data);

  const updatePage = (number: number) => {
    if (number < 1) return;
    if (number > metaData.pageCount) return;

    const newMetaData = {
      ...metaData,
      page: number,
    };
    setMetaData(newMetaData);
    getPositions(GetStablishment().name, number, searchTerm);
  };

  const changeStatus = async (id: number, status: boolean) => {
    try {
      await api_putPositions(id, { status: status });
      getPositions(GetStablishment().name, metaData.page, searchTerm);
      setIsLoading(false);
      toast.success("Se actualizo correctamente");
    } catch (error) {
      console.log(error);
      toast.error("ha ocurrido un error");
    }
  };

  const Submit = async (dataZod: CargosI) => {
    try {
      setIsLoading(true);
      await api_postPositions(dataZod);
      getPositions(GetStablishment().name, metaData.page, searchTerm);
      hadleClose();
      reset();
      setValue("establishment", GetStablishment().id);
      toast.success("Se Agrego la categoria correctamente");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("ha ocurrido un error");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CargosI> = (data) => Submit(data);

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const refProfesional = useRef<HTMLDialogElement>(null);
  const handleShowProfesional = useCallback(
    (id: number) => {
      setValueProfessional("establishment", GetStablishment().id);
      setValueProfessional("position", id);
      refProfesional.current?.showModal();
    },
    [refProfesional]
  );

  const hadleCloseProfesional = useCallback(() => {
    refProfesional.current?.close();
  }, [refProfesional]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setMetaData((prev) => ({ ...prev, page: 1 })); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm("");
    setMetaData((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

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

          {/* Buscador */}
          <div className="mb-4 px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar cargos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600 text-sm">
                    ✕
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden">
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
                    {data.length === 0 ? (
                      <tr>
                        <td className="p-4 text-center text-gray-500">
                          {searchTerm
                            ? `No se encontraron cargos que coincidan con "${searchTerm}"`
                            : "No hay cargos disponibles"}
                        </td>
                      </tr>
                    ) : (
                      data.map((element, index) => (
                        <Fragment key={index}>
                          <Profesional
                            handleShow={handleShowProfesional}
                            id={element.id}
                            name={element.attributes.name}
                            searchTerm={searchTerm}
                          />
                        </Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Paginación */}
          {metaData.pageCount > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => updatePage(metaData.page - 1)}
                  disabled={metaData.page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => updatePage(metaData.page + 1)}
                  disabled={metaData.page === metaData.pageCount}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(metaData.page - 1) * metaData.pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(
                        metaData.page * metaData.pageSize,
                        metaData.total
                      )}
                    </span>{" "}
                    de <span className="font-medium">{metaData.total}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => updatePage(metaData.page - 1)}
                      disabled={metaData.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLongLeftIcon className="h-5 w-5" />
                    </button>

                    {/* Números de página */}
                    {Array.from(
                      { length: Math.min(5, metaData.pageCount) },
                      (_, i) => {
                        let pageNumber;
                        if (metaData.pageCount <= 5) {
                          pageNumber = i + 1;
                        } else if (metaData.page <= 3) {
                          pageNumber = i + 1;
                        } else if (metaData.page >= metaData.pageCount - 2) {
                          pageNumber = metaData.pageCount - 4 + i;
                        } else {
                          pageNumber = metaData.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => updatePage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              pageNumber === metaData.page
                                ? "z-10 bg-primary text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}

                    <button
                      onClick={() => updatePage(metaData.page + 1)}
                      disabled={metaData.page === metaData.pageCount}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLongRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        <Modal ref={ref}>
          <Modal.Header>
            <span className="font-bold flex justify-center text-primary mt-4">
              Creación de cargo
            </span>
            <Button
              onClick={hadleClose}
              size="sm"
              color="ghost"
              shape="circle"
              className="text-base font-semibold absolute right-2 top-2"
            >
              X
            </Button>
          </Modal.Header>
          <Modal.Body>
            <form
              className="flex flex-col p-4"
              onSubmit={handleSubmit(onSubmit)}
            >
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
              <Button
                color="primary"
                animation
                className="order-3 mt-4 md:mx-20 lg:mx-20"
                disabled={isLoading}
                type="submit"
                loading={isLoading}
              >
                Guardar
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        <Modal ref={refProfesional}>
          <Modal.Header>
            <span className="font-bold flex justify-center text-primary mt-4">
              Creación de profesional
            </span>
            <Button
              onClick={hadleCloseProfesional}
              size="sm"
              color="ghost"
              shape="circle"
              className="text-base font-semibold absolute right-2 top-2"
            >
              X
            </Button>
          </Modal.Header>
          <Modal.Body>
            <form
              className="flex flex-col p-4"
              onSubmit={handleSubmitProfessional(onSubmitProfessional)}
            >
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
              <Button
                color="primary"
                animation
                className="order-3 mt-4 md:mx-20 lg:mx-20"
                disabled={isLoading}
                type="submit"
                loading={isLoading}
              >
                Guardar
              </Button>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

function Profesional({
  id,
  name,
  handleShow,
  searchTerm,
}: {
  id: number;
  name: string;
  handleShow: (id: number) => void;
  searchTerm: string;
}) {
  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore();

  const [metaData, setMetaData] = useState<metaI>({
    page: 1,
    pageCount: 0,
    pageSize: 5,
    total: 0,
  });
  const [data, setData] = useState<tableProfessionalI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [professionalSearchTerm, setProfessionalSearchTerm] =
    useState<string>("");

  const getProfessionals = async (
    stablishment: string,
    page = 1,
    search = ""
  ) => {
    try {
      const dataPos = await api_getProfessionals({
        position: name,
        Stablishment: stablishment,
        page: page,
        search: search,
        pageSize: metaData.pageSize,
      });

      // Verificar que la respuesta tenga la estructura esperada
      if (dataPos.data && dataPos.data.data) {
        setData(dataPos.data.data);
        setMetaData(dataPos.data.meta.pagination);
      } else {
        // Si no hay datos, establecer arrays vacíos
        setData([]);
        setMetaData({
          page: 1,
          pageCount: 0,
          pageSize: metaData.pageSize,
          total: 0,
        });
      }
    } catch (error) {
      console.log(error);
      // En caso de error, limpiar los datos
      setData([]);
      setMetaData({
        page: 1,
        pageCount: 0,
        pageSize: metaData.pageSize,
        total: 0,
      });
    }
  };

  useEffect(() => {
    // Reset page to 1 when search term changes
    if (professionalSearchTerm !== "") {
      setMetaData((prev) => ({ ...prev, page: 1 }));
    }
    getProfessionals(GetStablishment().name, 1, professionalSearchTerm);
  }, [professionalSearchTerm, name]); // Agregar 'name' como dependencia

  useEffect(() => {
    // Initial load and when position name changes
    getProfessionals(GetStablishment().name, 1, "");
  }, [name]); // Solo cuando cambia el nombre de la posición

  const toggleStatus = async (
    professionalId: number,
    currentStatus: boolean
  ) => {
    try {
      setIsLoading(true);
      const newStatus = !currentStatus;

      await api_putProfessionals(professionalId, {
        data: { status: newStatus },
      });

      const updatedData = data.map((professional) => {
        if (professional.id === professionalId) {
          return {
            ...professional,
            attributes: {
              ...professional.attributes,
              status: newStatus,
            },
          };
        }
        return professional;
      });
      setData(updatedData);

      setIsLoading(false);
      toast.success("Se actualizó el estado correctamente");
    } catch (error) {
      console.log(error);
      toast.error("No se pudo actualizar el estado");
      setIsLoading(false);
    }
  };

  const updateProfessionalPage = (number: number) => {
    if (number < 1) return;
    if (number > metaData.pageCount) return;

    const newMetaData = {
      ...metaData,
      page: number,
    };
    setMetaData(newMetaData);
    getProfessionals(GetStablishment().name, number, professionalSearchTerm);
  };

  const handleProfessionalSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfessionalSearchTerm(e.target.value);
    setMetaData((prev) => ({ ...prev, page: 1 }));
  };

  const clearProfessionalSearch = () => {
    setProfessionalSearchTerm("");
    setMetaData((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <>
      <tr className="bg-gray-50 text-sm leading-6 text-gray-900">
        <th className="flex flex-row justify-between border rounded-lg p-2">
          <span className="ml-3">{name}</span>
          <button className="mr-3" onClick={() => handleShow(id)}>
            <PlusIcon className="h-6 w-6 text-primary " />
          </button>
        </th>
      </tr>

      {/* Buscador de profesionales */}
      <tr>
        <td className="p-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar profesionales..."
              value={professionalSearchTerm}
              onChange={handleProfessionalSearchChange}
              className="block w-full pl-10 pr-12 py-1 text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {professionalSearchTerm && (
              <button
                onClick={clearProfessionalSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600 text-sm">
                  ✕
                </span>
              </button>
            )}
          </div>
        </td>
      </tr>

      {data.length === 0 ? (
        <tr>
          <td className="p-3 text-center text-gray-500 border rounded-md">
            {professionalSearchTerm
              ? `No se encontraron profesionales que coincidan con "${professionalSearchTerm}"`
              : "No hay profesionales asignados a este cargo"}
          </td>
        </tr>
      ) : (
        data.map((profesional, index) => (
          <tr key={index}>
            <td className="p-3 flex flex-col md:flex-row lg:flex-row justify-between text-left border rounded-md">
              <span className="order-1 flex-1">
                {" "}
                Nombre: {profesional.attributes.names}{" "}
                {profesional.attributes.surnames}
              </span>
              <span className="order-2 flex-1">
                {" "}
                Correo electronico: {profesional.attributes.email}
              </span>
              <button
                className="order-3 flex-none"
                onClick={() =>
                  toggleStatus(profesional.id, profesional.attributes.status)
                }
              >
                {profesional.attributes.status ? (
                  <LockOpenIcon className=" w-7 h-7" />
                ) : (
                  <LockClosedIcon className=" w-7 h-7" />
                )}
              </button>
            </td>
          </tr>
        ))
      )}

      {/* Paginación de profesionales */}
      {metaData.pageCount > 1 && (
        <tr>
          <td className="p-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Página {metaData.page} de {metaData.pageCount} ({metaData.total}{" "}
                profesionales)
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => updateProfessionalPage(metaData.page - 1)}
                  disabled={metaData.page === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ←
                </button>
                <span className="px-2 py-1 text-xs">{metaData.page}</span>
                <button
                  onClick={() => updateProfessionalPage(metaData.page + 1)}
                  disabled={metaData.page === metaData.pageCount}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Configuracion() {
  const { bearer, setRole, GetRole, user, GetStablishment } = useUserStore();

  return (
    <>
      <Head>
        <title>Configuración</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {GetStablishment().id !== 0 && (
        <>
          <Cargos />
          <br />
        </>
      )}
    </>
  );
}
