import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/layout/Layout";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="space-y-10 divide-y divide-gray-900/10">
      <form>
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
                    Primera Denuncia
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="firstcomplaint"
                        id="firstcomplaint"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Derivada
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="derivative"
                        id="derivative"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
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
                        type="text"
                        name="studentname"
                        id="studentname"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Curso del estudiante
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="course"
                        id="course"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Profesor jefe
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="teachername"
                        id="teachername"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4 mx-4 my-4">
                  <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                    Fecha
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="date"
                        name="date"
                        id="date"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
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
                        value=""
                        className="border rounded-lg bg-gray-100 focus:outline-none focus:ring-primary focus:border-primary  p-2 resize-y w-full h-full"
                        rows={5}
                      ></textarea>
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
                        value=""
                        className="border rounded-lg bg-gray-100 focus:outline-none focus:ring-primary focus:border-primary  p-2 resize-y w-full h-full"
                        rows={5}
                      ></textarea>
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
      </form>
    </div>
  );
}
