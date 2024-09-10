import { ArrowLeftIcon, PencilIcon, PlusIcon, StarIcon } from "@heroicons/react/20/solid";
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FormularyI {
  Titulo: string;
  FechaInicio: Date;
  FechaFin: Date;
  Question: QuestionI[];
}

interface QuestionI {
  Titulo: string;
  Tipo: "text" | "option" | "multipleChoice" | "qualification";
  Opciones: string[];
}

const options = z.string({
  required_error: "Se requiere ingresar datos para la opción a mostrar",
}).min(1, 'Se requieren mínimo 1 caracteres');

const QuestionZod = z.object({
  Titulo: z.string({ required_error: "Se requiere título de la pregunta" }).min(1, "Se requiere título de la pregunta"),
  Tipo: z.enum(["text", "option", "multipleChoice", "qualification"], { required_error: "Seleccione una opción" }),
  Opciones: z.array(options),
});

const FormularyZod = z.object({
  Titulo: z.string({ required_error: "Se requiere título del formulario" }),
  FechaInicio: z.date({
    required_error: "Se requiere fecha de inicio del formulario",
  }),
  FechaFin: z.date({
    required_error: "Se requiere fecha de finalización del formulario",
  }),
  Question: z.array(QuestionZod),
});

export default function Creacion() {
  const methods = useForm<FormularyI>({
    resolver: zodResolver(FormularyZod),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const router = useRouter();
  const { fields, append } = useFieldArray({
    control,
    name: "Question",
  });

  const redirect = () => {
    router.back();
  };

  const onSubmit = async (data: any) => {
    console.log(data);
  };

  const newChildren = async (data: QuestionI) => {
    append(data);
  };

  const handleDateChange = (field: "FechaInicio" | "FechaFin") => (date: Date | null) => {
    if (date) {
      setValue(field, date);
    }
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
      <h1 className="text-center font-bold">Creación de encuesta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-10/12 mx-auto">
        {/* Formulario de creación */}
        <fieldset className="border shadow-md rounded-lg p-6 md:m-10 m-0">
          <legend className="text-center">Formulario</legend>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="md:mx-16 mx-0 flex flex-col items-center"
            >
              <TitleComponent />
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                <DatePicker
                  selected={watch("FechaInicio") || null}
                  onChange={handleDateChange("FechaInicio")}
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                />
                {errors.FechaInicio && <p className="text-red-500">{errors.FechaInicio.message}</p>}
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                <DatePicker
                  selected={watch("FechaFin") || null}
                  onChange={handleDateChange("FechaFin")}
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                />
                {errors.FechaFin && <p className="text-red-500">{errors.FechaFin.message}</p>}
              </div>

              {fields.map((field, index) => (
                <QuestionComponent key={field.id} index={index} />
              ))}
              <AddQuestionComponent append={append} />
              <div className="text-center my-2">
                <Button>Guardar</Button>
              </div>
            </form>
          </FormProvider>
        </fieldset>

        {/* Previsualización del formulario */}
        <fieldset className="border shadow-md rounded-lg p-6 md:m-10 m-0">
          <legend className="text-center">Previsualización de encuesta</legend>
          <FormProvider {...methods}>
            <div className="p-4 flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4">
                {watch("Titulo") || "Título del formulario"}
              </h2>
              {fields.map((field, index) => (
                <PreviewQuestionComponent key={field.id} index={index} />
              ))}
            </div>
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
  const { register, watch, setValue } = methods;
  const watchTitle = watch("Titulo");
  const handleClear = () => {
    setValue("Titulo", "");
  };
  const showText = () => {
    if (!isOpen && (!watchTitle || watchTitle.length === 0)) {
      return (
        <h1 className="text-xl font-semibold flex items-center space-x-2">
          Ingrese Título{" "}
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as HTMLElement)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
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
        </button>
      )}
      {isOpen && (
        <div className="mx-auto my-2 flex items-center max-w-xs border border-gray-300 rounded-lg p-2">
          <input
            type="text"
            {...register("Titulo")}
            placeholder="Escriba aquí el título..."
            className="flex-grow px-4 py-2 border-none focus:ring-0 outline-none"
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

function AddQuestionComponent({ append }: { append: (data: QuestionI) => void }) {
  const nuevaPregunta: QuestionI = {
    Titulo: "",
    Tipo: "text",
    Opciones: [],
  };

  const agregarPregunta = () => {
    append(nuevaPregunta);
  };

  return (
    <div className="text-center my-4">
      <Button onClick={agregarPregunta} color="primary">
        Agregar Pregunta
      </Button>
    </div>
  );
}

function QuestionComponent({ index }: { index: number }) {
  const { register, watch, setValue } = useFormContext<FormularyI>();
  const tipoPregunta = watch(`Question.${index}.Tipo`);

  const addOption = () => {
    const currentOptions = watch(`Question.${index}.Opciones`) || [];
    setValue(`Question.${index}.Opciones`, [...currentOptions, ""]);
  };

  return (
    <div className="my-4 p-4 border rounded-lg">
      <input
        {...register(`Question.${index}.Titulo`)}
        placeholder="Ingrese el título de la pregunta"
        className="w-full mb-2"
      />
      <select {...register(`Question.${index}.Tipo`)} className="w-full mb-2">
        <option value="text">Texto</option>
        <option value="option">Opción</option>
        <option value="multipleChoice">Múltiple elección</option>
        <option value="qualification">Calificación</option>
      </select>

      {tipoPregunta === "text" && (
        <input
          type="text"
          className="w-full mt-2"
          placeholder="Respuesta de texto"
          disabled
        />
      )}

      {tipoPregunta === "option" && (
        <>
          {(watch(`Question.${index}.Opciones`) || []).map((_, idx: number) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                {...register(`Question.${index}.Opciones.${idx}`)}
                className="w-full"
                placeholder="Ingrese una opción"
              />
            </div>
          ))}
          <button type="button" onClick={addOption} className="btn btn-primary">
            Añadir Opción
          </button>
        </>
      )}

      {tipoPregunta === "multipleChoice" && (
        <>
          {(watch(`Question.${index}.Opciones`) || []).map((_, idx: number) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                {...register(`Question.${index}.Opciones.${idx}`)}
                className="w-full"
                placeholder="Ingrese una opción"
              />
            </div>
          ))}
          <button type="button" onClick={addOption} className="btn btn-primary">
            Añadir Opción
          </button>
        </>
      )}

      {tipoPregunta === "qualification" && (
        <div className="flex space-x-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} className="text-yellow-500" />
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewQuestionComponent({ index }: { index: number }) {
  const { watch } = useFormContext<FormularyI>();
  const tipoPregunta = watch(`Question.${index}.Tipo`);
  const opciones = watch(`Question.${index}.Opciones`) || [];
  const titulo = watch(`Question.${index}.Titulo`);

  // Acceder a las fechas desde el formulario
  const fechaInicio = watch("FechaInicio");
  const fechaFin = watch("FechaFin");

  return (
    <div className="my-4 p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">{titulo}</h3>

      {/* Mostrar fechas en la previsualización */}
      <div className="mb-4">
        <p className="font-medium">Fecha de Inicio:</p>
        <p>{fechaInicio ? fechaInicio.toLocaleDateString() : "No definida"}</p>
      </div>
      <div className="mb-4">
        <p className="font-medium">Fecha de Fin:</p>
        <p>{fechaFin ? fechaFin.toLocaleDateString() : "No definida"}</p>
      </div>

      {tipoPregunta === "text" && <input type="text" className="w-full" disabled />}

      {tipoPregunta === "option" &&
        opciones.map((opcion, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input type="radio" disabled className="mr-2" />
            <label>{opcion}</label>
          </div>
        ))}

      {tipoPregunta === "multipleChoice" &&
        opciones.map((opcion, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input type="checkbox" disabled className="mr-2" />
            <label>{opcion}</label>
          </div>
        ))}

      {tipoPregunta === "qualification" && (
        <div className="flex space-x-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} className="text-yellow-500" />
          ))}
        </div>
      )}
    </div>
  );
}
