import { useUserStore } from "@/store/userStore";
import { denunciationSchema } from "@/validations/denunciationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import UserInterface from "@/interfaces/user.interface";
import {
  api_CasesOnes,
  api_postCase,
  api_usersByRole,
} from "../../services/axios.services";
import { useRouter } from "next/router";
import Head from "next/head";

interface Inputs {
  first_case: number | undefined;
  derived: number | undefined;
  created: number | undefined;
  nameSchoolar: string;
  course: string;
  Teacher: string;
  date: string;
  details: string;
  measures: string;
}

interface ICase {
  id: number;
  attributes: {
    createdAt: string;
    created: {
      data: {
        id: number;
        attributes: {
          firstname: string;
          first_lastname: string;
          secondname: string;
          second_lastname: string;
          establishment_courses: {
            data: {
              id: number;
              attributes: {
                Letter: string;
                Grade: string;
                LeadTeacher: {
                  data: {
                    id: number;
                    attributes: {
                      firstname: string;
                      first_lastname: string;
                      secod_lastname: string;
                    };
                  };
                };
              };
            }[];
          };
          tipo: string;
        };
      };
    };
  };
}

export default function Denuncia() {
  const { push,back } = useRouter();
  const methods = useForm<Inputs>({
    resolver: zodResolver(denunciationSchema),
    defaultValues: {
      // Valores iniciales explícitos (opcional)
      nameSchoolar: "",
      course: "",
      Teacher: "",
      date: "",
    },
  });
  const {
    register,
    getValues,
    setValue,
    handleSubmit,
    trigger,
    watch,
    reset,
    control,
    formState: { errors },
  } = methods;
  const { user } = useUserStore();

  useEffect(() => {
    user && user.id
      ? setValue("created", user.id)
      : setValue("created", undefined);
  }, [user]);

  const [userCase, setUserCase] = useState<ICase[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Para controlar la carga

  // Cargar datos de userCase
  const FetchCase = async () => {
    const firstCaseId = Number(sessionStorage.getItem("first_case"));
    try {
      const data = await api_CasesOnes(firstCaseId);
      setUserCase(data.data.data);
      // Actualizar campos del formulario cuando los datos estén listos
      if (data.data.data.length > 0) {
        const caseData = data.data.data[0];
        const tipo = caseData.attributes.created.data.attributes.tipo;

        if (tipo === "alumno") {
          const estudiante = caseData.attributes.created.data.attributes;
          const curso = estudiante.establishment_courses.data[0]?.attributes;

          methods.setValue(
            "nameSchoolar",
            `${estudiante.firstname} ${estudiante.secondname} ${estudiante.first_lastname} ${estudiante.second_lastname}`
          );
          methods.setValue("course", `${curso.Grade} ${curso.Letter}`);
          methods.setValue(
            "Teacher",
            `${curso.LeadTeacher.data.attributes.firstname} ${curso.LeadTeacher.data.attributes.first_lastname}`
          );
          methods.setValue("date", formatDate(caseData.attributes.createdAt));
        }
      }
    } catch (error) {
      console.error("Error al cargar userCase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FetchCase();
  }, []);

  const nameEstudent =
    userCase[0]?.attributes.created.data.attributes.tipo === "alumno"
      ? userCase[0]?.attributes.created.data.attributes.firstname +
        " " +
        userCase[0]?.attributes.created.data.attributes.secondname +
        " " +
        userCase[0]?.attributes.created.data.attributes.first_lastname +
        " " +
        userCase[0]?.attributes.created.data.attributes.second_lastname
      : "";

  const courseEstudent =
    userCase[0]?.attributes.created.data.attributes.tipo === "alumno"
      ? userCase[0]?.attributes.created.data.attributes.establishment_courses
          .data[0]?.attributes.Grade +
        " " +
        userCase[0]?.attributes.created.data.attributes.establishment_courses
          .data[0]?.attributes.Letter
      : "";

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    ); // Ajustar a la zona horaria local
    return localDate.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
  };

  const fechaEstudent =
    userCase[0]?.attributes.created.data.attributes.tipo === "alumno"
      ? formatDate(userCase[0]?.attributes.createdAt)
      : "";

  const nameLeadTeacher =
    userCase[0]?.attributes.created.data.attributes.tipo === "alumno"
      ? userCase[0]?.attributes.created.data.attributes.establishment_courses
          .data[0]?.attributes.LeadTeacher.data.attributes.firstname +
        " " +
        userCase[0]?.attributes.created.data.attributes.establishment_courses
          .data[0]?.attributes.LeadTeacher.data.attributes.first_lastname
      : "";

  const isNameReadOnly = !!nameEstudent; // Solo lectura si hay un nombre
  const isCourseReadOnly = !!courseEstudent; // Solo lectura si hay un curso
  const isDateReadOnly = !!fechaEstudent; // Solo lectura si hay una fecha

  const isNameLeadTeacherReadOnly = !!nameLeadTeacher;

  const [userList, setUserList] = useState<UserInterface[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api_usersByRole(5, user.establishment.id);
        const userListData = data.data.data.attributes.users.data;
        setUserList(userListData);

        // Si hay un solo encargado, seleccionarlo automáticamente
        if (userListData.length === 1) {
          setValue("derived", userListData[0].id);
        }
      } catch (error) {
        console.error("Error al obtener la lista de usuarios:", error);
      }
    };

    if (user.establishment.id === 0) return;
    fetchUsers();
  }, [user]);

  const measuresText = watch("measures");
  const storyText = watch("details");
  const directedId = watch("derived");

  const onSubmit = async (data: Inputs) => {
    if (isLoading) {
      toast.error("Espera a que se carguen todos los datos antes de enviar.");
      return;
    }
    try {
      const firstCaseId = sessionStorage.getItem("first_case");
      const selectedUserId = methods.getValues("derived");

      data.first_case = firstCaseId ? parseInt(firstCaseId) : undefined;

      // Si no hay first_case, se crea uno nuevo
      if (!data.first_case) {
        const caseResponse = await api_postCase({
          directed: directedId,
          establishment: user.establishment.id,
          created: user.id,
          fase: 2,
          derived: true,
          story: storyText,
          measures: measuresText,
        });
        // se asume que api_postCase devuelve el objeto del caso creado con su id
        data.first_case = caseResponse.data.data.id;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}complaints`,
        { data: data },
        { headers: { Authorization: "Bearer " + Cookies.get("bearer") } }
      );

      if (response.status === 200) {
        // Si había un firstCaseId original, actualizamos ese caso
        if (firstCaseId) {
          await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}cases/${firstCaseId}`,
            {
              data: {
                directed: selectedUserId,
                derived: true,
              },
            },
            {
              headers: {
                Authorization: "Bearer " + Cookies.get("bearer"),
              },
            }
          );
        }
      }

      toast.success("Se envió la denuncia correctamente");
      reset();
      push("/casos");
    } catch (error) {
      console.error("Error al enviar la denuncia:", error);
      toast.error(
        "Ocurrió un error al enviar la denuncia. Por favor, inténtalo de nuevo más tarde."
      );
    }
  };

  return (
    <>
      <Head>
        <title>Denuncia</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="space-y-4 divide-y divide-gray-900/10">
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 pb-10 pr-10 pl-10 md:grid-cols-3 bg-slate-50">
              <div className="px-4 sm:px-0">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Origen de la denuncia
                </h2>
              </div>

              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8 ">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">
                      <div className="sm:col-span-4 mx-4 my-4">
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Derivar
                        </label>
                        <div className="mt-2">
                          <select
                            {...methods.register("derived", {
                              setValueAs: (value) =>
                                value === "" ? undefined : Number(value),
                              required: true, // Asegura que siempre haya un valor
                            })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                            disabled={userList.length === 1} // Deshabilitado si hay un solo encargado
                          >
                            {/* Mostrar placeholder solo si hay múltiples opciones */}
                            {userList.length > 1 && (
                              <option value="" disabled>
                                Seleccione una opción
                              </option>
                            )}

                            {/* Mapear usuarios */}
                            {userList.map((user: UserInterface) => (
                              <option value={user.id} key={user.id}>
                                Derivar a {user.attributes.firstname}{" "}
                                {user.attributes.first_lastname}
                              </option>
                            ))}
                          </select>
                          {errors.derived?.message && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.derived.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 pb-10 pr-10 pl-10 md:grid-cols-3 bg-slate-50">
              <div className="px-4 sm:px-0">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Antecedentes
                </h2>
              </div>

              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">
                      <div className="sm:col-span-4 mx-4 my-4">
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Nombre del estudiante
                        </label>
                        <div className="mt-2">
                          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <input
                              {...register("nameSchoolar", {
                                setValueAs: (value) =>
                                  value === "" ? undefined : value,
                              })}
                              readOnly={isNameReadOnly}
                              type="text"
                              id="nameSchoolar"
                              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            />
                          </div>
                          {errors.nameSchoolar?.message && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.nameSchoolar.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-4 mx-4 my-4">
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Curso del estudiante
                        </label>
                        <div className="mt-2">
                          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <input
                              {...register("course", {
                                setValueAs: (value) =>
                                  value === "" ? undefined : value,
                              })}
                              readOnly={isCourseReadOnly}
                              type="text"
                              id="course"
                              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            />
                          </div>
                          {errors.course?.message && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.course.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-4 mx-4 my-4">
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Profesor jefe
                        </label>
                        <div className="mt-2">
                          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <input
                              {...register("Teacher", {
                                setValueAs: (value) =>
                                  value === "" ? undefined : value,
                              })}
                              type="text"
                              readOnly={isNameLeadTeacherReadOnly}
                              id="Teacher"
                              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            />
                          </div>
                          {errors.Teacher?.message && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.Teacher.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-4 mx-4 my-4">
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Fecha
                        </label>
                        <div className="mt-2">
                          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <input
                              {...register("date", {
                                setValueAs: (value) =>
                                  value === "" ? undefined : value,
                              })}
                              type="datetime-local"
                              readOnly={isDateReadOnly}
                              id="date"
                              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            />
                          </div>
                          {errors.date?.message && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.date.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 pb-10 pr-10 pl-10 md:grid-cols-3 bg-slate-50">
              <div className="px-4 sm:px-0">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Descripción de la situación
                </h2>
              </div>

              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 ">
                <div className="px-4 py-6 sm:p-8">
                  <div className="space-y-10">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">
                        <div className="px-4 py-5 sm:px-6 text-left">
                          <h6 className="font-bold md:text-base text-sm h-full">
                            Describe la situacion: Se solicita la mayor
                            precisión y detalles posibles
                          </h6>
                          <br />
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="mx-4 w-full mt-2">
                            <textarea
                              {...register("details", {
                                setValueAs: (value) =>
                                  value === "" ? undefined : value,
                              })}
                              id="details"
                              className="border rounded-lg bg-gray-100 focus:outline-none focus:ring-primary focus:border-primary  p-2 resize-y w-full h-full"
                              rows={5}
                            ></textarea>
                            <div className="mt-2">
                              {errors.details?.message && (
                                <p className="text-red-600 text-sm mt-1">
                                  {errors.details.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">
                        <div className="px-4 py-5 sm:px-6 text-left">
                          <h6 className="font-bold md:text-base text-sm h-full">
                            ¿Se tomaron medidas inmediatas frente a los hechos
                            ocurridos para proteger la integridad de los
                            involucrados? Relatar
                          </h6>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="mx-4 w-full mt-2">
                            <textarea
                              {...register("measures", {
                                setValueAs: (value) =>
                                  value === "" ? undefined : value,
                              })}
                              id="measures"
                              className="border rounded-lg bg-gray-100 focus:outline-none focus:ring-primary focus:border-primary  p-2 resize-y w-full h-full"
                              rows={5}
                            ></textarea>
                            <div className="mt-2">
                              {errors.measures?.message && (
                                <p className="text-red-600 text-sm mt-1">
                                  {errors.measures.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                  <button
                    type="button"
                    className="text-sm font-semibold leading-6 text-gray-900"
                    onClick={()=>{back()}}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading} // Deshabilitar mientras se cargan datos
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {isLoading ? "Cargando..." : "Enviar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
}
