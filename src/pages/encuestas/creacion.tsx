import { ArrowLeftIcon, PencilIcon, PlusIcon, StarIcon, TrashIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { Router, useRouter } from "next/router";
import { Button, Input, Textarea } from "react-daisyui";
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
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from "date-fns/locale/es";
import { toast } from "react-toastify";
import { api_postQuestions, api_postSurveys } from "@/services/axios.services";
registerLocale("es", es);
import { useUserStore } from "../../store/userStore";
import { assignFormUsers } from "../../services/local.services";

interface FormularyI {
  Titulo: string;
  FechaInicio: Date;
  FechaFin: Date;
  creador: number;
  Descripcion: string;
  establishment: number;
  Question: QuestionI[];
}

interface QuestionI {
  Titulo: string;
  Tipo: "text" | "option" | "multipleChoice" | "qualification";
  opciones: string[];
}

const options = z.string({
  required_error: "Se requiere ingresar datos para la opción a mostrar",
}).min(1, 'Se requieren mínimo 1 caracteres');

const QuestionZod = z.object({
  Titulo: z.string({ required_error: "Se requiere título de la pregunta." }).min(1, "Se requiere título de la pregunta."),
  Tipo: z.enum(["text", "option", "multipleChoice", "qualification"], { required_error: "Seleccione una opción" }),
  opciones: z.array(options),
});


const FormularyZod = z.object({
  Titulo: z.string({ required_error: "Se requiere título del formulario." }),
  FechaInicio: z.date({
    required_error: "Se requiere fecha de inicio del formulario.",
  }),
  FechaFin: z.date({
    required_error: "Se requiere fecha de finalización del formulario.",
  }),
  creador: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo invalido" }),
  Descripcion: z.string({ required_error: "Campo Requerido", invalid_type_error: "Tipo Invalido" }),
  establishment: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo Invalido" }),
  Question: z.array(QuestionZod),
});

export default function Creacion() {
  const methods = useForm<FormularyI>({
    resolver: zodResolver(FormularyZod),
  });
  const { user, GetRole, role } = useUserStore();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const router = useRouter();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "Question",
  });

  const redirect = () => {
    router.back();
  };

  const newChildren = async (data: QuestionI) => {
    append(data);
  };

  const handleDateChange = (field: "FechaInicio" | "FechaFin") => (date: Date | null) => {
    if (date) {
      setValue(field, date);
    }
  };

  useEffect(() => {

    setValue('creador', user.id);
    setValue('establishment', user.establishment.id);
  }, [user]);


  const [loading, setLoading] = useState(false);
  const onSubmit = async (dataSurvey: FormularyI) => {
    try {
      setLoading(true);
      // Primero realiza el POST de la encuesta (api_postSurveys)
      const surveyResponse = await api_postSurveys(dataSurvey);
      // Rescatar la ID de la encuesta recién creada
      const formulario = surveyResponse.data.data.id; // Asegúrate de que la respuesta tenga el campo "id"
      const respUsers = await assignFormUsers(dataSurvey.establishment, formulario);

      // Ahora procesa las preguntas, asignando valores por defecto si Opciones está vacío
      const processedQuestions = dataSurvey.Question.map((question) => {
        if (question.opciones.length === 0) {
          if (question.Tipo === "text") {
            return { ...question, opciones: ["input"] };
          } else if (question.Tipo === "qualification") {
            return { ...question, opciones: ["qualification"] };
          }
        }
        return question;
      });

      // Prepara las preguntas con el campo `formulario`
      const questionsWithSurveyId = processedQuestions.map((question) => ({
        ...question,
        "formulario": formulario // Asigna el surveyId a cada pregunta
      }));

      // Realiza el POST de cada pregunta asociada al surveyId
      await Promise.all(questionsWithSurveyId.map((question) => api_postQuestions(question)));

      toast.success('Encuesta y preguntas creadas correctamente');
      setTimeout(() => { router.push("/encuestas") }, 2000)
    } catch (error) {
      console.error("Error al crear la encuesta o las preguntas:", error);
      toast.error('Ocurrió un error al crear la encuesta o las preguntas');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };



  // Acceder a las fechas desde el formulario
  const fechaInicio = watch("FechaInicio");
  const fechaFin = watch("FechaFin");
  const descripcionForm = watch('Descripcion');

  const fechaActual = new Date();

  return (
    <>
      <Button
        className="mx-1 sm:mx-2 md:mx-4 my-1 sm:my-2"
        onClick={redirect}
        color="primary"
        variant="outline"
      >
        <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
      </Button>
      <h1 className="text-center font-bold text-lg sm:text-md md:text-xl mb-2">Creación de encuesta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-2 md:gap-4 w-12/12 sm:w-11/12 md:w-10/12 mx-auto">
        {/* Formulario de creación */}
        <fieldset className="border shadow-md rounded-lg p-2 sm:p-3 md:p-4 md:m-3 m-0">
          <legend className="text-center">Editor de Formulario</legend>
          <FormProvider {...methods}>
            <div className="w-full max-w-4xl mx-auto p-2 sm:p-3 md:p-4 bg-white shadow-md rounded-lg">

              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4 md:space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-lg sm:text-md md:text-xl font-bold text-gray-900">
                    <TitleComponent />
                  </h2>
                  {errors.Titulo && (
                    <p className="text-red-500 text-sm mt-1">{errors.Titulo.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio:</label>
                    <DatePicker
                      selected={new Date()}
                      onChange={handleDateChange("FechaInicio")}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      dropdownMode="select"
                      yearDropdownItemNumber={15}
                      peekNextMonth
                      showYearDropdown
                      showMonthDropdown
                      dateFormat={"dd/MM/yyyy"}
                      selectsStart
                      startDate={fechaInicio}
                      endDate={fechaFin}
                      minDate={fechaActual}
                      locale="es"

                    />
                    {errors.FechaInicio && <p className="text-red-500 text-sm">{errors.FechaInicio.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin:</label>
                    <DatePicker
                      selected={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                      onChange={handleDateChange("FechaFin")}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      dropdownMode="select"
                      yearDropdownItemNumber={15}
                      peekNextMonth
                      showYearDropdown
                      showMonthDropdown
                      dateFormat={"dd/MM/yyyy"}
                      selectsEnd
                      startDate={fechaInicio}
                      endDate={fechaFin}
                      minDate={fechaInicio || fechaActual}
                      locale="es"
                    />
                    {errors.FechaFin && <p className="text-red-500 text-sm">{errors.FechaFin.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Descripción del formulario</label>
                  <Textarea {...register('Descripcion')} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                  {errors.Descripcion && <p className="text-red-500">{errors.Descripcion.message}</p>}
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <QuestionComponent key={field.id} index={index} remove={remove} />
                  ))}
                  <AddQuestionComponent append={append} />
                </div>
                <div className="text-center my-2">
                  <Button className="btn btn-primary text-white w-full sm:w-auto  px-6 py-2" disabled={loading}>
                    {!loading ? 'Crear encuesta': <>Cargando<span className="loading loading-spinner loading-md"></span>
                      </>}
                  </Button>
                </div>
              </form>
            </div>
          </FormProvider>
        </fieldset>

        {/* Previsualización del formulario */}
        <fieldset className="border shadow-md rounded-lg p-2 sm:p-3 md:p-4 md:m-3 m-0">
          <legend className="text-center">Previsualización de encuesta</legend>
          <FormProvider {...methods}>
            <div className="w-full max-w-4xl mx-auto p-2 sm:p-3 md:p-4 bg-white shadow-md rounded-lg">
              <div className="text-center">
                <h2 className="text-lg sm:text-md md:text-xl font-bold text-gray-900">
                  {watch("Titulo") || "Título del formulario"}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-center">Fecha de Inicio:</label>
                  <p className="flex items-center justify-center">{fechaInicio ? fechaInicio.toLocaleDateString() : "No definida."}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-center">Fecha de Fin:</label>
                  <p className="flex items-center justify-center">{fechaFin ? fechaFin.toLocaleDateString() : "No definida."}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <p className="w-full border-none">{descripcionForm ? descripcionForm : <span className="font-medium">Sin Descripción.</span>}</p>
              </div>
              <div className="">
                <div className="my-3 sm:my-4 p-3 sm:p-4  text-center items-center">
                  {fields.map((field, index) => (
                    <PreviewQuestionComponent key={field.id} index={index} />
                  ))}
                </div>
              </div>
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
  const { register, watch, setValue, formState: { errors } } = methods;
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
              className="ml-2 px- py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
    opciones: [],
  };
  const methods = useForm<FormularyI>({
    resolver: zodResolver(FormularyZod),
  });

  const agregarPregunta = () => {
    append(nuevaPregunta);
  };
  const { register, watch, setValue, formState: { errors } } = methods;

  return (
    <div className="text-center my-4">
      <Button onClick={agregarPregunta} className="btn btn-primary bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
        Agregar una pregunta
      </Button>
    </div>
  );
}

function QuestionComponent({ index, remove }: { index: number, remove: (index: number) => void }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormularyI>();
  const tipoPregunta = watch(`Question.${index}.Tipo`);

  const addOption = () => {
    const currentOptions = watch(`Question.${index}.opciones`) || [];
    setValue(`Question.${index}.opciones`, [...currentOptions, ""]);
  };

  const deleteQuestion = () => {
    remove(index);
  };

  const deleteOption = (optionIndex: number) => {
    const currentOptions = watch(`Question.${index}.opciones`) || [];
    setValue(`Question.${index}.opciones`, currentOptions.filter((_, idx) => idx !== optionIndex));
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg shadow-sm">
      <div className="space-y-2">
        <Input
          {...register(`Question.${index}.Titulo`)}
          placeholder="Ingrese el título de la pregunta..."
          className="w-full mb-2"
        />
        {errors?.Question?.[index]?.Titulo && <p className="text-red-500 text-sm">{errors.Question?.[index]?.Titulo?.message}</p>}
      </div>
      <div className="space-y-2">
        <select {...register(`Question.${index}.Tipo`)} className="w-full mb-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
          <option value="text">Texto</option>
          <option value="option">Opción</option>
          <option value="multipleChoice">Múltiple elección</option>
          <option value="qualification">Calificación</option>
        </select>
        {errors?.Question?.[index]?.Tipo && <p className="text-red-500 text-sm">{errors.Question?.[index]?.Tipo?.message}</p>}
      </div>

      {tipoPregunta === "text" && (
        <Input
          type="text"
          className="w-full mt-2"
          placeholder="Respuesta de texto"
          disabled
        />
      )}

      {(tipoPregunta === "option" || tipoPregunta === "multipleChoice") && (
        <>
          <p className="font-medium">Opciones:</p>
          {(watch(`Question.${index}.opciones`) || []).map((_, idx: number) => (
            <div key={idx} className="flex items-center mb-2">
              <Input
                type="text"
                {...register(`Question.${index}.opciones.${idx}`)}
                className="w-full"
                placeholder="Ingrese el nombre de la opción..."
              />
              <Button
                type="button"
                onClick={() => deleteOption(idx)}
                className="ml-2 p-2 text-red-500 hover:text-red-700"
              >
                <XCircleIcon className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <div className="space-y-2 flex items-center justify-center">
            <Button type="button" onClick={addOption} className="bg-blue-500 hover:bg-blue-700 text-white">
              Añadir Opción
            </Button>
          </div>
        </>
      )}

      {tipoPregunta === "qualification" && (
        <div className="flex space-x-2 mt-2 items-center justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} className="text-yellow-500 w-12 h-12" />
          ))}
        </div>
      )}
      <div className="space-y-2 flex items-center justify-center">
        <Button onClick={deleteQuestion} className="text-red-500 mt-4">
          <TrashIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}


function PreviewQuestionComponent({ index }: { index: number }) {
  const { watch } = useFormContext<FormularyI>();
  const tipoPregunta = watch(`Question.${index}.Tipo`);
  const opciones = watch(`Question.${index}.opciones`) || [];
  const titulo = watch(`Question.${index}.Titulo`);


  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-2 mt-2">{titulo}</h3>

      {tipoPregunta === "text" && <input type="text" className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" disabled />}

      {tipoPregunta === "option" && (
        <div className="grid grid-cols-3 gap-2">
          {opciones.map((opcion, idx) => (
            <div key={idx} className="flex items-center justify-center mb-2">
              <input type="radio" disabled className="mr-2" />
              <label>{opcion}</label>
            </div>
          ))}
        </div>
      )}

      {tipoPregunta === "multipleChoice" && (
        <div className="grid grid-cols-3 gap-2">
          {opciones.map((opcion, idx) => (
            <div key={idx} className="flex items-center justify-center mb-2">
              <input type="checkbox" disabled className="mr-2" />
              <label>{opcion}</label>
            </div>
          ))}
        </div>
      )}

      {tipoPregunta === "qualification" && (
        <div className="flex space-x-2 mt-2 items-center justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} className="text-yellow-500 w-9 h-9" />
          ))}
        </div>
      )}
    </div>
  );
}

