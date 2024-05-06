import { useUserStore } from "@/store/userStore";
import { denunciationSchema } from "@/validations/denunciationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useEffect } from "react";


interface Inputs {
    first_case: number;
    derived: string;
    created: number;
    nameSchoolar: string;
    course: string;
    teacher: string;
    date: string;
    details: string;
    measures: string;
}

export default function Denuncia() {
  const methods = useForm<Inputs>({
        resolver: zodResolver(denunciationSchema),
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
  const { user } = useUserStore()

  useEffect(() => {
   setValue('created',user.id);
  }, [user]); 

  

  const onSubmit = async (data: any) => {

    try {
      const firstCaseId = sessionStorage.getItem("first_case");
      sessionStorage.clear
      data.first_case = firstCaseId ? firstCaseId : "";
      
      console.log(data.first_case)
      console.log(data)
        // const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}denuncias`, {data : data},
        //     { headers: { Authorization: "Bearer " + Cookies.get("bearer") } }
        // );
        toast.success('Se envio la denuncia correctamente');
        reset();
    } catch (error) {
        toast.error('Ocurrió un error al enviar la denuncia. Por favor, inténtalo de nuevo más tarde.');
    }
}
  return (
    <>
    <FormProvider {...methods}>
     <form onSubmit={methods.handleSubmit(onSubmit)}>
      <div className="space-y-10 divide-y divide-gray-900/10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3 bg-slate-50">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Origen de la denuncia</h2>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8 ">
            <div className="px-4 py-5 sm:p-6">
            <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">
                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Derivada
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                         {...register('derived', {setValueAs: (value) => value === "" ? undefined : value})}
                        type="text"
                        id="derived"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                    {errors.derived?.message && (<p className="text-red-600 text-sm mt-1">{errors.derived.message}</p>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3  bg-slate-50">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Antecedentes</h2>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">

                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Nombre del estudiante
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        {...register('nameSchoolar', {setValueAs: (value) => value === "" ? undefined : value})}
                        type="text"
                        id="nameSchoolar"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                    {errors.nameSchoolar?.message && (<p className="text-red-600 text-sm mt-1">{errors.nameSchoolar.message}</p>)}
                  </div>
                </div>

                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Curso del estudiante
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        {...register('course', {setValueAs: (value) => value === "" ? undefined : value})}
                        type="text"
                        id="course"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                    {errors.course?.message && (<p className="text-red-600 text-sm mt-1">{errors.course.message}</p>)}
                  </div>
                </div>

                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Profesor jefe
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        {...register('teacher', {setValueAs: (value) => value === "" ? undefined : value})}
                        type="text"
                        id="teacher"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                    {errors.teacher?.message && (<p className="text-red-600 text-sm mt-1">{errors.teacher.message}</p>)}
                  </div>
                </div>

                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Fecha
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        {...register('date', {setValueAs: (value) => value === "" ? undefined : value})}
                        type="datetime-local"
                        id="date"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                    {errors.date?.message && (<p className="text-red-600 text-sm mt-1">{errors.date.message}</p>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3 bg-slate-50">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Descripción de la situación</h2>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 ">
          <div className="px-4 py-6 sm:p-8">
            <div className="space-y-10">
              <div className="px-4 py-5 sm:p-6">
                <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">
                  <div className="px-4 py-5 sm:px-6 text-left">
                    <h6 className="font-bold md:text-base text-sm h-full">
                      Describe la situacion: Se solicita la mayor precisión y detalles posibles
                    </h6>
                    <br />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="mx-4 w-full mt-2">
                      <textarea
                        {...register('details', {setValueAs: (value) => value === "" ? undefined : value})}
                        id="details"
                        className="border rounded-lg bg-gray-100 focus:outline-none focus:ring-primary focus:border-primary  p-2 resize-y w-full h-full"
                        rows={5}
                      ></textarea>
                      <div className="mt-2">
                        {errors.details?.message && (<p className="text-red-600 text-sm mt-1">{errors.details.message}</p>)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden rounded-lg bg-white shadow animate-fadein">
                  <div className="px-4 py-5 sm:px-6 text-left">
                    <h6 className="font-bold md:text-base text-sm h-full">
                      ¿Se tomaron medidas inmediatas frente a los hechos ocurridos
                      para proteger la integridad de los involucrados? Relatar
                    </h6>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="mx-4 w-full mt-2">
                      <textarea
                        {...register('measures', {setValueAs: (value) => value === "" ? undefined : value})}
                        id="measures"
                        className="border rounded-lg bg-gray-100 focus:outline-none focus:ring-primary focus:border-primary  p-2 resize-y w-full h-full"
                        rows={5}
                      ></textarea>
                      <div className="mt-2">
                        {errors.measures?.message && (<p className="text-red-600 text-sm mt-1">{errors.measures.message}</p>)}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Enviar
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
