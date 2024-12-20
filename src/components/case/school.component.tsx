import { Fragment, useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import UserInterface from "../../interfaces/user.interface";
import axios from "axios";
import Cookies from "js-cookie";
import {
  api_casesRoles,
  api_establishmentByComuna,
  api_usersByRole,
} from "../../services/axios.services";
import { getComunas, getRegiones } from "../../services/local.services";
import Select from "react-select";
import metaI from "../../interfaces/meta.interface";
import stablishmentI from "../../interfaces/establishment.interface";
interface roleListI {
  id: number;
  attributes: {
    name: string;
    reference: number;
  };
}
interface valueInterface {
  title: string;
  value: string | boolean;
}
interface establishment {
  id: number;
  name: string;
}
interface groupQuestionI {
  title: string;
  value: string | string[];
  type: "text" | "checkboxUnique" | "checkboxMultiple" | "School";
  options?: valueInterface[] | valueInterface;
}

export const SchoolComponent: React.FC<{
  form: groupQuestionI;
  setOwner: (newElement: string | number, element: string) => void;
  OwnerString: string;
  setSite: (newElement: string | number, element: string) => void;
  OwnerSite: string;
}> = ({ form, setOwner, OwnerString, setSite, OwnerSite }) => {
  const { user, GetRole, role, GetStablishment } = useUserStore();
  const [roleList, setRoleList] = useState([]);
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [userList, setUserList] = useState<UserInterface[]>([]);
  const [selectedValue, setSelectedValue] = useState(0);
  const [datailsSchool, setDatailsSchool] = useState(false);
  const [establecimiento, setEstablecimiento] = useState(0);

  const handleChangeEstablecimiento = (value: string) => {
    setSite(value, OwnerSite);
    setEstablecimiento(Number(value));
  };
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(Number(event.target.value));
    setOwner(Number(event.target.value), OwnerString);
  };
  useEffect(() => {
    setUserList([]);
    const getUsers = async () => {
      const data = await api_usersByRole(selectedRole, establecimiento);
      setUserList(data.data.data.attributes.users.data);
    };
    if (useUserStore.getState().GetRole() === "Authenticated") {
      setDatailsSchool(true);
      if (selectedRole !== 0 && establecimiento !== 0) getUsers();
    }
  }, [selectedRole, establecimiento, role]);
  //REGIONES
  useEffect(() => {
    const roles = async () => {
      const data = await api_casesRoles();

      setRoleList(data.data.data);
    };

    roles();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      const data = await api_usersByRole(selectedRole, GetStablishment().id);
      setUserList(data.data.data.attributes.users.data);
    };
    if (useUserStore.getState().GetRole() !== "Authenticated") {
      if (selectedRole !== 0 && GetStablishment().id !== 0) getUsers();
    }
  }, [selectedRole]);
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(Number(event.target.value));
    setSelectedValue(0);
    setOwner(0, OwnerString);
  };

  return (
    <>

      <div className="md:flex-1 divide-y md:mx-1 my-1 divide-gray-200 overflow-hidden shadow-xl rounded-lg bg-white shadow animate-fadein">
        <div className="px-4 py-5 sm:px-6 text-left">
          <h6 className="font-bold md:text-base text-sm">{form.title}</h6>
        </div>
        {datailsSchool && (
          <DetailedSchoolComponent
            establecimiento={establecimiento}
            setEstablecimiento={handleChangeEstablecimiento}
          />
        )}
        <div className="flex flex-col md:flex-row m-2">
          <label className="md:flex-1 mr-4">
            <h6 className="text-sm leading-6 text-gray-900 font-bold">Cargo</h6>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value={0}>Seleccione el rol</option>

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
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value={0}>Seleccione el usuario</option>
              {userList.map((user: UserInterface) => (
                <option value={user.id} key={user.id}>
                  {user.attributes.firstname} {user.attributes.first_lastname}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

    </>
  );
};

export const DetailedSchoolComponent: React.FC<{
  establecimiento: number;
  setEstablecimiento: (number: string) => void;
}> = ({ establecimiento, setEstablecimiento }) => {
  const { bearer, setRole, GetRole, user, role } = useUserStore()

  const [meta, setMeta] = useState<metaI>({
    page: 0,
    pageCount: 1,
    pageSize: 1,
    total: 1,
  });
  const [query, setQuery] = useState("");

  const [establecimientoList, setEstablecimientoList] = useState<{ id: number, name: string }[]>([]);
  const [establecimientoSelected, setEstablecimientoSelected] =
    useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEstablecimientoList(user.establishment_authenticateds)
    if (GetRole() === "Authenticated" && user.tipo === "alumno") setEstablecimiento(String(user.establishment_authenticateds[0].id));
    if (GetRole() === "Authenticated" && user.tipo === "apoderado") setEstablecimiento(String(user.establishment.id));
  }, [user])

  const handleChangeEstablecimiento = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setEstablecimientoSelected(Number(event.target.value));
    setEstablecimiento(event.target.value);
  };

  if (role.name === "Authenticated" && user.tipo === "apoderado") {
    return (<></> );
  }

};
