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
              <QuestionComponent key={index} question={field} />
            ))}
          </div>
        </form>
        <CreateQuestion newChildren={newChildren} />

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

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function QuestionComponent(props: { question: QuestionI }) {
  const methods = useForm();
  const [rating, setRating] = useState(0);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };



  return (
    <>
      <div className="flex flex-col items-center my-2">

        {props.question.Tipo === "option" && (
          <>
            <div className="mt-2 flex flex-row">
              <fieldset className="border border-dashed border-gray-950 p-2">
                <legend className="text-center">{capitalizeFirstLetter(props.question.Titulo)}</legend>
                <div className="flex flex-wrap justify-between">
                  {props.question.Opciones.map((opcion, index) => (
                    <div key={index} className="w-1/3 mb-2 ">
                      <input
                        type="radio"
                        className="radio unchecked:bg-secondary checked:bg-primary"
                        name={props.question.Titulo}
                        value={opcion}
                        id={opcion}
                      />
                      <label htmlFor={opcion} className="ml-2">{opcion}</label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </>
        )}
        {props.question.Tipo === "text" && (
          <>
            <label htmlFor="">{capitalizeFirstLetter(props.question.Titulo)}</label>
            <div className="mt-2">
              <input
                type="text"
                className="input input-bordered w-full max-w-xs block bg-white"
                placeholder="Ingrese su respuesta"
              />
            </div>
          </>
        )}

        {props.question.Tipo === "multipleChoice" && (
          <>
            <div className="mt-2 flex flex-row">
              <fieldset className="border border-dashed border-gray-950 p-2">
                <legend className="text-center">{capitalizeFirstLetter(props.question.Titulo)}</legend>
                <div className="flex flex-wrap justify-between">
                  {props.question.Opciones.map((opcion, index) => (
                    <div key={index} className="w-1/3 mb-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        value={opcion}
                        id={opcion}
                      />
                      <label htmlFor={opcion} className="ml-2">{opcion}</label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </>
        )}

        {props.question.Tipo === "qualification" && (
          <>
            <label htmlFor="">{capitalizeFirstLetter(props.question.Titulo)}</label>
            <div className="mt-2">

              <div className="flex flex-row justify-between ">
                <span className="mt-2 mr-1 italic">Muy bajo</span>
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <label key={index} className="mr-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`star-${star}`}
                      value={star}
                      checked={rating === star}
                      onChange={() => handleRatingChange(star)}
                      className="hidden"
                    />
                    <i
                      className={`text-2xl ${ // aumenta el tamaño de la fuente
                        rating >= star ? "text-yellow-400" : "text-gray-400"
                        }`}
                    >
                      &#x2605;
                    </i>
                  </label>
                ))}
                <span className="mt-2 ml-1 italic">Excelente</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CreateQuestion(props: CreateQuestionProps) {
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

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "Opciones",
  });

  const handleAddOption = () => {
    append("");
  };

  const handleRemoveOption = (index: number) => {
    remove(index);
  };



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
  console.log(tipo);

  const onSubmit = async (data: any) => {
    props.newChildren(data);
    reset();
    setIsOpen(false);
    ref.current?.close();
    console.log(data);
  };

  useEffect(() => {
    if (tipo === 'text') {
      const opcionesActuales = getValues('Opciones');
      if (opcionesActuales.length !== 1 || opcionesActuales[0] !== 'text') {
        setValue('Opciones', ['text']);
      }
    }
  }, [tipo, getValues, setValue]);

  useEffect(() => {
    if (tipo === 'qualification') {
      const opcionesActuales = getValues('Opciones');
      if (opcionesActuales.length !== 1 || opcionesActuales[0] !== 'qualification') {
        setValue('Opciones', ['qualification']);
      }
    }
  }, [tipo, getValues, setValue]);

  const ref = useRef<HTMLDialogElement>(null);
  const handleShow = useCallback(() => {
    ref.current?.showModal();
  }, [ref]);


  const handleClickCerrar = () => {
    ref.current?.close();
    setIsOpen(false);
    reset();
  };

  return (
    <div
      ref={componentRef}
      className={`border border-dashed border-neutral mx-8 ${!isOpen && "text-right"
        }`}
    >
      <div
      >
        {!isOpen && (
          <Button
            className="mx-3 my-2 btn btn-primary"
            onClick={(event) => {
              if (event.detail == 1) {
                setIsOpen(!isOpen);
                handleShow();
              }
            }}
          >
            Agregar nuevo campo
          </Button>

        )}
        <Modal ref={ref} className="bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-0 lg:p-0">
            <Modal.Header>¿Desea añadir una pregunta?</Modal.Header>
            <Modal.Body>
              {isOpen &&
                (
                  <>
                    <div className="flex justify-center">
                      <input
                        type="text"
                        placeholder="Titulo de pregunta"
                        {...register("Titulo")}
                        className="input input-bordered w-full max-w-xs block  bg-white"
                      />
                    </div>
                    {errors.Titulo && <span className="text-red-600 flex justify-center ml-4">{errors.Titulo.message}</span>}
                    <div className="flex flex-col  my-2">
                      <Controller
                        name="Tipo"
                        control={control}
                        defaultValue="text"
                        render={({ field }) => (
                          <div className="mt-2 flex flex-row">
                            <fieldset className="border border-dashed border-gray-950 p-2">
                              <legend className="text-center">Tipo de pregunta</legend>
                              <div className="flex flex-wrap justify-between">
                                <div className="w-1/2">

                                  <input
                                    type="radio"
                                    {...field}
                                    value="text"
                                    checked={field.value === "text"}
                                    className="radio unchecked:bg-secondary checked:bg-primary"

                                  />
                                  <label className="ml-2">Texto</label>

                                </div>
                                <div className="w-1/2">

                                  <input
                                    type="radio"
                                    {...field}
                                    value="option"
                                    checked={field.value === "option"}
                                    className="radio unchecked:bg-secondary checked:bg-primary"
                                  />
                                  <label className="ml-2">Opciones</label>

                                </div>
                                <div className="w-1/2 mt-2">

                                  <input
                                    type="radio"
                                    {...field}
                                    value="multipleChoice"
                                    checked={field.value === "multipleChoice"}
                                    className="radio unchecked:bg-secondary checked:bg-primary"
                                  />
                                  <label className="ml-2">Opciones múltiples</label>

                                </div>
                                <div className="w-1/2 mt-2">
                                  <input
                                    type="radio"
                                    {...field}
                                    value="qualification"
                                    checked={field.value === "qualification"}
                                    className="radio unchecked:bg-secondary checked:bg-primary"
                                  />
                                  <label className="ml-2">Calificación</label>

                                </div>
                              </div>
                            </fieldset>

                          </div>
                        )}
                      />
                      {errors.Tipo && <span className="text-red-600 flex justify-center ml-4">{errors.Tipo.message}</span>}
                      {tipo === "option" && (
                        <>
                          <div className="flex flex-col">
                            <label htmlFor="">Lista de Opciones</label>
                            {fields.map((field, index) => (
                              <div key={index}>
                                <div className="mb-2 flex flex-col md:flex-row lg:flex-row justify-center" >
                                  <div className="mx-2 px-1 input-bordered flex flex-row border-2 border-primary rounded-lg">
                                    <input
                                      type="text"
                                      placeholder="Opción"
                                      {...register(`Opciones.${index}`, { setValueAs: (value) => value === "" ? undefined : value })}
                                      className=" border-0 focus:ring-0 border-primary "
                                    />
                                    <button type="button" onClick={() => handleRemoveOption(index)}>
                                      <XMarkIcon className="h-5 w-5 text-primary border-l" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                                {errors.Opciones?.[index] && <span>{errors.Opciones?.[index].message}</span>}
                              </div>
                            ))}
                            <div className="flex flex-col items-center">
                              <button onClick={handleAddOption} className="btn btn-primary w-1/2">
                                Agregar mas opciones
                              </button>
                            </div>

                          </div>
                        </>
                      )}
                      {tipo === "multipleChoice" && (
                        <>
                          <div className="flex flex-col">
                            <label htmlFor="">Lista de Opciones</label>
                            {fields.map((field, index) => (
                              <div key={index}>
                                <div className="mb-2 flex flex-col md:flex-row lg:flex-row justify-center" >
                                  <div className="mx-2 px-1 input-bordered flex flex-row border-2 border-primary rounded-lg">
                                    <input
                                      type="text"
                                      placeholder="Opción"
                                      {...register(`Opciones.${index}`, { setValueAs: (value) => value === "" ? undefined : value })}
                                      className=" border-0 focus:ring-0 border-primary "
                                    />
                                    <button type="button" onClick={() => handleRemoveOption(index)}>
                                      <XMarkIcon className="h-5 w-5 text-primary border-l" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                                {errors.Opciones?.[index] && <span>{errors.Opciones?.[index].message}</span>}
                              </div>
                            ))}
                            <div className="flex flex-col items-center">
                              <button onClick={handleAddOption} className="btn btn-primary w-1/2">
                                Agregar mas opciones
                              </button>
                            </div>

                          </div>
                        </>
                      )}
                    </div>
                  </>
                )
              }
            </Modal.Body>
            <Modal.Actions>
              <div className="flex flex-col md:flex-row lg:flex-row">
                <Button type="button" className="btn btn-outline btn-secondary order-2 md:order-1 lg:order-1 mt-3 md:mt-0 lg:mt-0 md:mr-20 lg:md:mr-20" onClick={() => handleClickCerrar()}>Cancelar</Button>
                <Button type="submit" className="btn btn-outline btn-primary order-1 md:order-2 lg:order-2">Agregar nuevo campo al formulario</Button>
              </div>
            </Modal.Actions>
          </form>
        </Modal>
      </div>

    </div >

  );
}
