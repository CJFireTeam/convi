import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import { useEffect, useState } from "react";
import UserInterface from "../../interfaces/user.interface";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
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
  where: string;
  when: string;
  establishment: number;
  story: string;
  measures: string;
  directed: number;
  created_by_id: number;
  updated_by_id: number;
}
interface roleListI {
  id: number;
  attributes: {
    name: string;
    reference: number;
  };
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
        <div className="mx-4 w-full">
          <textarea
            value={textValue}
            onChange={handleTextChange}
            className="border rounded-lg bg-gray-100 focus:outline-none focus:ring focus:border-blue-500 p-2 resize-y w-full h-full"
            rows={5}
          ></textarea>
        </div>
      </div>
    </div>
  );
};
const CheckboxMultipleComponent: React.FC<{
  form: groupQuestionI;
  setElement: (newElement: string[]) => void;
}> = ({ form, setElement }) => {
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
    setElement(updatedElement);
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
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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

const CheckboxUniqueComponent: React.FC<{
  form: groupQuestionI;
  setElement: (newElement: string, element: string) => void;
  elementOption: string;
}> = ({ form, setElement, elementOption }) => {
  if (!Array.isArray(form.options)) {
    return "OCURRIO UN ERROR";
  }
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSelectedOption(newValue);
    setElement(newValue, elementOption);
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
                  value={e.title}
                  type="radio"
                  name={form.title}
                  aria-describedby={`${form.title}-${index}`}
                  checked={selectedOption === e.title}
                  onChange={handleOptionChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span
                  id={`${form.title}-${index}`}
                  className="ml-3 text-sm leading-6"
                >
                  {e.title}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

const SchoolComponent: React.FC<{
  form: groupQuestionI;
  roleList: roleListI[];
  setElement: (newElement: string | number, element: string) => void;
  elementOption: string;
}> = ({ form, roleList, setElement, elementOption }) => {
  const [selectedRole, setSelectedRole] = useState<number>(
    roleList[0].attributes.reference
  );
  const [userList, setUserList] = useState<UserInterface[]>([]);
  const [selectedValue, setSelectedValue] = useState(0);
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("hola", event.target.value);
    setSelectedValue(Number(event.target.value));
    setElement(Number(event.target.value), elementOption);
  };
  useEffect(() => {
    const usersByRole = async (selectedRole: number) => {
      const data = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          "users?populate=role&filters[role][id][$eq]=" +
          selectedRole,
        { headers: { Authorization: "Bearer " + Cookies.get("bearer") } }
      );
      if (data.data.length === 0) {
      }
      setUserList(data.data);
    };
    // Aquí puedes poner el código que quieres que se ejecute cuando el rol cambie
    usersByRole(selectedRole);
  }, [selectedRole]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(0);
    setElement(0, elementOption);
    setSelectedRole(Number(event.target.value));
  };

  return (
    <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden shadow-xl rounded-lg bg-white shadow animate-fadein">
      <div className="px-4 py-5 sm:px-6 text-left">
        <h6 className="font-bold md:text-base text-sm">{form.title}</h6>
      </div>
      <div className="flex flex-col md:flex-row m-2">
        <label className="md:flex-1 mr-4">
          <h6 className="text-sm leading-6 text-gray-900 font-bold">Cargo</h6>
          <select
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            {roleList.map((role: roleListI) => (
              <option
                value={role.attributes.reference}
                key={role.attributes.reference}
              >
                {role.attributes.name}
              </option>
            ))}
          </select>
        </label>
        <label className="md:flex-1">
          <span className="text-sm font-bold leading-6 text-gray-900">
            Selecciona a quién dirigir la denuncia
          </span>
          <select
            value={selectedValue}
            onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value={0}>Seleccione el usuario</option>
            {userList.map((user: UserInterface) => (
              <option value={user.id} key={user.id}>
                {user.firstname} {user.first_lastname}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

const Form: React.FC<{
  fields: groupQuestionI[];
  roleList: roleListI[];
  setWho: (newElement: string[]) => void;
  setElement: (newElement: string | number, element: string) => void;
  create: (event: React.FormEvent<HTMLFormElement>) => void;
  creating: boolean;
}> = ({ fields, roleList, setWho, setElement, create,creating }) => (
  <form onSubmit={create}>
    <div className="flex flex-col md:flex-row">
      <CheckboxMultipleComponent form={fields[0]} setElement={setWho} />
      <CheckboxUniqueComponent
        form={fields[1]}
        elementOption="where"
        setElement={setElement}
      />
      <CheckboxUniqueComponent
        form={fields[2]}
        elementOption="when"
        setElement={setElement}
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
      {roleList.length > 0 && (
        <SchoolComponent
          form={fields[5]}
          roleList={roleList}
          setElement={setElement}
          elementOption="directed"
        />
      )}
    </div>
    <div className="flex flex-col md:flex-row items-center justify-center m-2">
      <button
        disabled={creating}
        className="flex rounded-full bg-indigo-600 px-3.5 py-2 text-sm md:text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        type="submit"
      >
        <span>Registrar Denuncia</span>
        {creating && (<Cog8ToothIcon className="animate-spin text-white w-6 mt-0 md:mt-1" aria-hidden="true" />)}
        </button>
    </div>
  </form>
);

export default function CrearCasos() {
  const [roleList, setRoleList] = useState([]);
  const [creating,setCreating] = useState(false);
  const resolveAfter3Sec = new Promise(resolve => setTimeout(resolve, 3000));
  const { push } = useRouter();
  const [schoolCase, setSchoolCase] = useState<SchoolCase>({
    establishment: 0,
    updated_by_id: 0,
    created_by_id: 0,
    who: { values: [] },
    where: "",
    when: "",
    story: "",
    measures: "",
    directed: 0,
  });
  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //VALIDATIONS
    if (schoolCase.directed === 0) {
      toast.error('Se necesita seleecionar el encargado de la denuncia')
      return ;
    }
    const requiredProps = ['where', 'when', 'story', 'measures','who'];
    const isMissingRequiredProp = requiredProps.some(prop => {
      if (prop === 'who') {
        return schoolCase[prop].values.length === 0;
      }
      return schoolCase[prop].length === 0;
    });
    if (isMissingRequiredProp) {
      toast.error('Se requiere rellenar campos')
      return;
    }
    
    const id = toast.loading("Guardando...",)
    const userId = JSON.parse(Cookies.get("user")).id;
    schoolCase.created_by_id = userId;
    schoolCase.updated_by_id = userId;
    schoolCase.establishment = JSON.parse(Cookies.get("establishment")).id
    setCreating(true)
    setSchoolCase(schoolCase);
    try {
      const data = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "cases",
        { data: schoolCase },
        { headers: { Authorization: "Bearer " + Cookies.get("bearer") } }
      );
      setRoleList(data.data.data);
      toast.update(id, {render: "Guardado correctamente", type: "success", isLoading: false,autoClose:3000});
      push('/casos')
    } catch (error) {
      toast.update(id, {render: "Ocurrio un error", type: "error", isLoading: false,autoClose:3000 });
    }
  };
  const setWho = (newElement: string[]) => {
    setSchoolCase((prev) => ({ ...prev, who: { values: newElement } }));
  };

  const setOne = (newElement: string | number, element: string | number) => {
    setSchoolCase((prev) => ({ ...prev, [element]: newElement }));
  };

  useEffect(() => {
    const roles = async () => {
      try {
        const data = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_URL + "role-lists",
          { headers: { Authorization: "Bearer " + Cookies.get("bearer") } }
        );
        setRoleList(data.data.data);
      } catch (error) {}
    };
    roles();
  }, []);
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
          roleList={roleList}
          setWho={setWho}
          setElement={setOne}
          create={create}
          creating={creating}
        />
        
      </div>
    </div>
  );
}
