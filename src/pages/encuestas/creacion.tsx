import { ArrowLeftIcon, PencilIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Router, useRouter } from "next/router";
import { Button, Input, Modal } from "react-daisyui";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import { error } from "console";

interface QuestionI {
  Titulo: string;
  Tipo: "text" | "option" | "multipleChoice" | "qualification";
  Opciones: [];
}

interface CreateQuestionProps {
  newChildren: (data: QuestionI) => Promise<void>;
}

const options = z.string({
  required_error: "Se requiere ingresar datos para la opcion a mostrar",
}).min(1, 'Se requiren minimo 1 caracteres');

const QuestionZod = z.object({
  Titulo: z.string({ required_error: "Se requiere titulo del formulario" }).min(1, "Se requiere titulo del formulario"),
  Tipo: z.enum(["text", "option", "multipleChoice", "qualification"], { required_error: "Seleccione una opción" }),
  Opciones: z.array(options),
});

interface FormularyI {
  Titulo: string;
  FechaInicio: Date;
  FechaFin: Date;
  Question: QuestionI[];
}

const FormularyZod = z.object({
  Titulo: z.string({ required_error: "Se requiere titulo del formulario" }),
  FechaInicio: z.date({
    required_error: "Se require fecha de inicio del formulario",
  }),
  FechaFin: z.date({
    required_error: "Se require fecha de finalizacion del formulario",
  }),
  Question: z.array(QuestionZod),
});

export default function Creacion() {
  const methods = useForm<FormularyI>({
    resolver: zodResolver(FormularyZod),
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

  const router = useRouter();

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormProvider)
      name: "Question", // unique name for your Field Array
    }
  );

  const redirect = () => {
    router.back();
  };

  const onSubmit = async (data: any) => {
    console.log(data);
  };

  const newChildren = async (data: QuestionI) => {
    append(data)
  }


  return (
    <>
      <Button
        className="mx-4 my-2"
        onClick={redirect}
        color="primary"
        variant="outline"
      >
        <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
      </Button>
      <h1 className="text-center font-bold">Creación de encuesta</h1>
      <div className="grid grid-cols-1 gap-4 w-10/12 mx-auto">
        <fieldset className="border shadow-md rounded-lg p-6 md:m-10 m-0">
          <legend className="text-center">Previsualización de encuesta</legend>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className=" md:mx-16 mx-0 flex flex-col items-center"
            >
              <TitleComponent/>

              

              <div className="text-center my-2">
                <Button>Guardar</Button>
              </div>
            </form>
          </FormProvider>
        </fieldset>


      </div>

    </>
  );
}

function TitleComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const methods = useFormContext<FormularyI>();
  const { register, watch, setValue, getValues } = methods;
  const watchTitle = watch("Titulo");
  const handleClear = () => {
    setValue("Titulo", "");
  };
  const showText = () => {
    if (!isOpen && (!watchTitle || watchTitle.length === 0)) {
      return (
        <h1 className="text-xl font-semibold flex items-center space-x-2">
          Ingrese Titulo{" "}
          <PencilIcon className="h-5 w-5 text-error ml-2" aria-hidden="true" />
        </h1>
      );
    }
    return (
      <h1 className="text-xl font-semibold flex items-center space-x-2">
        {watchTitle}
        <PencilIcon className="h-5 w-5 text-error ml-1" aria-hidden="true" />
      </h1>
    );
  };
  useEffect(() => {
    // Función para manejar los clics en el documento
    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as HTMLElement)
      ) {
        setIsOpen(false);
      }
    };

    // Añadir el listener de clic al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={componentRef}>
      {!isOpen && (
        <button
          onClick={(event) => {
            if (event.detail == 1) setIsOpen(!isOpen);
          }}
        >
          {showText()}
          {/* {isOpen && ShowText()} */}
        </button>
      )}
      {isOpen && (
        <div className="mx-auto my-2 flex items-center max-w-xs border border-gray-300 rounded-lg p-2">
          <input
            type="text"
            {...register("Titulo")}
            placeholder="Escriba aqui el titulo..."
            className="flex-grow px-4 py-2  border-none focus:ring-0 outline-none"
          />
          {watchTitle && (
            <button
              onClick={handleClear}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Limpiar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DateStartEnd(){
  return(
    <>
    
    </>
  );
}