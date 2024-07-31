import { ArrowLeftIcon, PencilIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Router, useRouter } from "next/router";
import { Button, Input } from "react-daisyui";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { error } from "console";

interface QuestionI {
  Titulo: string;
  Tipo: "text" | "option";
  Opciones: [];
}

const options = z.string({
  required_error: "Se requiere titulo del formulario",
});

const QuestionZod = z.object({
  Titulo: z.string({ required_error: "Se requiere titulo del formulario" }),
  Tipo: z.enum(["text", "option"], { required_error: "Seleccione una opción" }),
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
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className=" md:mx-16 mx-0"
        >
          <div className=" border border-dashed border-neutral cursor-pointer text-center select-none">
            <TitleComponent />
          </div>
          <div className="border border-dashed border-neutral my-2">
            {fields.map((field, index) => (
              <QuestionComponent />
            ))}
          </div>
        </form>
        <CreateQuestion />

        <div className="text-center my-2">
          <Button>Guardar</Button>
        </div>
      </FormProvider>
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
          Titulo{" "}
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
            if (event.detail == 2) setIsOpen(!isOpen);
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
            placeholder="Escribe algo..."
            className="flex-grow px-4 py-2  border-none   focus:ring-0 outline-none"
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

function QuestionComponent() {
  return "Hola";
}

function CreateQuestion() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newOption, setNewOption] = useState('');

  type QuestionZodType = z.infer<typeof QuestionZod>;

  const methods = useForm<QuestionZodType>({
    resolver: zodResolver(QuestionZod),
    defaultValues: { Opciones: [""] },
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

  const { fields, append, remove } = useFieldArray({
    name: "Opciones",
  });
  useEffect(() => {
    // Función para manejar los clics en el documento
    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as HTMLElement)
      ) {
        // setIsOpen(false);
      }
    };

    // Añadir el listener de clic al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const tipo = watch("Tipo");
  const onSubmit = async (data: any) => {
    console.log(data);
  };
  return (
    <div
      ref={componentRef}
      className={`border border-dashed border-neutral mx-8 ${
        !isOpen && "text-right"
      }`}
    >
      <div
        className="tooltip"
        data-tip="Doble click para crear nuevo campo de formulario"
      >
        {!isOpen && (
          <Button
            className="mx-3 my-2"
            onClick={(event) => {
              if (event.detail == 2) setIsOpen(!isOpen);
            }}
          >
            Agregar nuevo campo
          </Button>
        )}
      </div>
      {isOpen && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Titulo"
              {...register("Titulo")}
              className="input input-bordered w-full max-w-xs"
            />
            {errors.Titulo && <span>{errors.Titulo.message}</span>}
          </div>
          <div className="flex justify-center my-2">
            <Controller
              name="Tipo"
              control={control}
              defaultValue="text" // Establece un valor predeterminado adecuado
              render={({ field }) => (
                <fieldset className="border border-dashed p-2">
                  <legend>Tipo</legend>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Texto</span>
                      <input
                        type="radio"
                        {...field}
                        value="text"
                        checked={field.value === "text"}
                        className="radio unchecked:bg-secondary checked:bg-primary"
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Opciones</span>
                      <input
                        type="radio"
                        {...field}
                        value="option"
                        checked={field.value === "option"}
                        className="radio unchecked:bg-secondary checked:bg-primary ml-2"
                      />
                    </label>
                  </div>
                </fieldset>
              )}
            />
            {errors.Tipo && <span>{errors.Tipo.message}</span>}
            {tipo === "option" && (
              <>
                Lista de Opciones
                {fields.map((field, index) => (
                  <h1>asd</h1>
                ))}
                <fieldset className="border border-dashed p-2">
                  <legend>Opcion</legend>
                  <div className="join">
                    <input
                      className="input input-bordered join-item"
                      placeholder="Email"
                    />
                    <button onClick={() => {

                    }} className="btn join-item rounded-r-full">
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </fieldset>
              </>
            )}
          </div>
          <div className="flex justify-center my-2">
            <Button type="submit">Agregar</Button>
          </div>
        </form>
      )}
    </div>
  );
}
