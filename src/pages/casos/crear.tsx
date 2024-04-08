import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import { useEffect, useState } from "react";
import UserInterface from "../../interfaces/user.interface";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import { useUserStore } from "../../store/userStore";
import { SchoolComponent } from "../../components/case/school.component";
interface valueInterface {
  title: string;
  value: string | boolean;
}
interface groupQuestionI {
  title: string;
  value: string | string[];
  type: "text" | "checkboxUnique" | "checkboxMultiple" | "School";
  options?: valueInterface[] | valueInterface;
}

interface SchoolCase {
  who: {
    values: string[];
  };
  where: {
    values: string[];
  };
  when: {
    values: string[];
  };
  establishment: number;
  story: string;
  measures: string;
  directed: number;
  created:number;
}


const formInitial: groupQuestionI[] = [
  {
    title: "¿Quiénes participaron?",
    type: "checkboxMultiple",
    value: [],
    options: [
      { title: "Alumnos", value: false },
      { title: "Docentes", value: false },
      { title: "Otros funcionarios", value: false },
      { title: "Apoderados", value: false },
      { title: "Otras personas", value: false },
      { title: "No lo tengo claro", value: false },
    ],
  },
  {
    title: "¿Dónde ocurrió?",
    type: "checkboxUnique",
    value: "",
    options: [
      { title: "En el colegio", value: true },
      { title: "Fuera del colegio", value: false },
      { title: "En las redes sociales", value: false },
      { title: "En otro lugar", value: false },
    ],
  },
  {
    title: "¿Cuándo ocurrió?",
    type: "checkboxUnique",
    value: "",
    options: [
      { title: "En una fecha determinada", value: true },
      { title: "Se viene produciendo en reiteradas ocaciones", value: false },
      { title: "No lo tengo claro", value: false },
    ],
  },
  {
    title:
      "Relatar los hechos en el siguiente recuadro (se solicita la mayor cantidad de precisión y detalles posibles).",
    type: "text",
    value: "",
  },
  {
    title:
      "¿Se tomaron medidas inmediatas frente a los hechos ocurridos para proteger la integridad de los involucrados? Relatar.",
    type: "text",
    value: "",
  },
  {
    title:
      "A continuación podrás enviar tu denuncia a un profesor determinado o al Encargado de Convivencia",
    type: "School",
    value: "",
  },
];
const TextComponent: React.FC<{
  form: groupQuestionI;
  setElement: (newElement: string, element: string) => void;
  elementOption: string;
}> = ({ form, elementOption, setElement }) => {
  const [textValue, setTextValue] = useState<string>("");
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    setElement(newValue, elementOption);
  };
  return (
    <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden shadow-xl rounded-lg bg-white shadow animate-fadein">
      <div className="px-4 py-5 sm:px-6 text-left">
        <h6 className="font-bold md:text-base text-sm">{form.title}</h6>
      </div>
      <div className="flex items-center justify-center">
        <div className="mx-4 w-full mt-2">
          <textarea
            value={textValue}
            onChange={handleTextChange}
            className="border rounded-lg bg-gray-100 focus:outline-none focus:ring-primary focus:border-primary  p-2 resize-y w-full h-full"
            rows={5}
          ></textarea>
        </div>
      </div>
    </div>
  );
};
const CheckboxMultipleComponent: React.FC<{
  form: groupQuestionI;
  setElement: (newElement: string[], element: string) => void;
  elementArray: string;
}> = ({ form, setElement, elementArray }) => {
  const [element, setElementState] = useState<string[]>([]);
  if (!Array.isArray(form.options) || !form.options) {
    return "OCURRIO UN ERROR";
  }
  const handleCheckboxChange = (title: string) => {
    let updatedElement: string[];
    if (element.includes(title)) {
      updatedElement = element.filter((item) => item !== title);
    } else {
      updatedElement = [...element, title];
    }
    setElementState(updatedElement);
    setElement(updatedElement, elementArray);
  };

  return (
    <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden shadow-xl rounded-lg bg-white shadow animate-fadein">
      <div className="px-4 py-5 sm:px-6 text-center">
        <h6 className="font-bold md:text-base text-sm">{form.title}</h6>
      </div>
      <fieldset className="px-4 py-5 sm:p-6">
        <legend className="sr-only">Notifications</legend>
        <div className="space-y-2">
          {form.options.map((e, index) => {
            return (
              <label key={index} className="relative flex items-start">
                <input
                  id={e.title}
                  aria-describedby={e.title}
                  name={e.title}
                  type="checkbox"
                  onChange={() => handleCheckboxChange(e.title)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-3 text-sm leading-6">{e.title}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};


const Form: React.FC<{
  fields: groupQuestionI[];
  setArray: (newElement: string[], element: string) => void;
  setElement: (newElement: string | number, element: string) => void;
  create: (event: React.FormEvent<HTMLFormElement>) => void;
  creating: boolean;
}> = ({ fields, setArray, setElement, create, creating }) => (
  <form onSubmit={create}>
    <div className="flex flex-col md:flex-row">
      <CheckboxMultipleComponent
        form={fields[0]}
        setElement={setArray}
        elementArray="who"
      />
      <CheckboxMultipleComponent
        form={fields[1]}
        elementArray="where"
        setElement={setArray}
      />
      <CheckboxMultipleComponent
        form={fields[2]}
        elementArray="when"
        setElement={setArray}
      />
    </div>
    <div className="flex flex-col md:flex-row">
      <TextComponent
        form={fields[3]}
        elementOption="story"
        setElement={setElement}
      />
      <TextComponent
        form={fields[4]}
        elementOption="measures"
        setElement={setElement}
      />
    </div>
    <div className="flex flex-col md:flex-row">
        <SchoolComponent
          form={fields[5]}
          setOwner={setElement}
          OwnerString="directed"
          setSite={setElement}
          OwnerSite="establishment"
        />
      
    </div>
    <div className="flex flex-col md:flex-row items-center justify-center m-2">
      <button
        disabled={creating}
        className="flex rounded-full bg-primary px-3.5 py-2 text-sm md:text-lg font-semibold text-white shadow-sm hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        type="submit"
      >
        <span>Registrar Denuncia</span>
        {creating && (
          <Cog8ToothIcon
            className="animate-spin text-white w-6 mt-0 md:mt-1"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  </form>
);

export default function CrearCasos() {
  const [creating, setCreating] = useState(false);
  const {bearer,setRole,GetRole,user,isLoading} = useUserStore()

  const { push } = useRouter();
  const [schoolCase, setSchoolCase] = useState<SchoolCase>({
    establishment: 0,
    who: { values: [] },
    where: { values: [] },
    when: { values: [] },
    story: "",
    measures: "",
    directed: 0,
    created: 0
  });
  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //VALIDATIONS
    if (schoolCase.directed === 0) {
      toast.error("Se necesita seleecionar el encargado de la denuncia");
      return;
    }
    const requiredProps = ["where", "when", "story", "measures", "who"];
    const isMissingRequiredProp = requiredProps.some((prop) => {
      return String(schoolCase[prop as keyof SchoolCase]).length === 0;
    });
    if (isMissingRequiredProp) {
      toast.error("Se requiere rellenar campos");
      return;
    }
    const id = toast.loading("Guardando...");
    schoolCase.created = user.id;
    if (GetRole() !== "Authenticated") schoolCase.establishment = user.establishment.id;
    setCreating(true);
    try {
      const data = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "cases",
        { data: schoolCase },
        { headers: { Authorization: "Bearer " + Cookies.get("bearer") } }
      );
      toast.update(id, {
        render: "Guardado correctamente",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      push("/casos");
    } catch (error) {
      toast.update(id, {
        render: "Ocurrio un error",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  const setArray = (newElement: string[], element: string) => {
    setSchoolCase((prev) => ({ ...prev, [element]: { values: newElement } }));
  };

  const setOne = (newElement: string | number, element: string | number) => {
    setSchoolCase((prev) => ({ ...prev, [element]: newElement }));
  };
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-3 sm:px-6">
        <h6 className="font-bold md:text-lg text-sm">
          Completa la siguiente información sobre el hecho que quieres
          denunciar.
        </h6>
      </div>
      <div className="px-4 py-5 sm:p-6 bg-slate-50">
        <Form
          fields={formInitial}
          setArray={setArray}
          setElement={setOne}
          create={create}
          creating={creating}
        />
      </div>
    </div>
  );
}
