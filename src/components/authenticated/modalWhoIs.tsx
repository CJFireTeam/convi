import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Radio, Table } from "react-daisyui";
import { useUserStore } from "../../store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  api_establishmentByComuna,
  api_updateUser,
} from "../../services/axios.services";
import stablishmentI from "../../interfaces/establishment.interface";
import { getComunas, getRegiones } from "../../services/local.services";
import { Bounce, toast } from "react-toastify";

interface InputsTipo {
  tipo: "alumno" | "apoderado";
}

interface InputsSchoolStudent {
  Schools: number;
}

interface InputsSchoolApoderado {
  Schools: number[];
}
const tipoSchema = z.object({
  tipo: z.string({ required_error: "Es necesario seleccionar una opción" }),
});

const SchoolSchemaStudent = z.object({
  Schools: z.number({ required_error: "Es necesario seleccionar una opción" }),
});

const SchoolSchemaApoderado = z.object({
  Schools: z.array(z.number({ required_error: "Es necesario seleccionar una opción" })).min(1, { message: "Es necesario agregar un establecimiento" }).default([])
});

function ModalTipoUser() {
  const { bearer, setRole, GetRole, user, isLoading, updateUser } =
    useUserStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InputsTipo>({
    resolver: zodResolver(tipoSchema),
  });

  const Submit = async (data: InputsTipo) => {
    try {
      await api_updateUser(user.id, data);
      updateUser({ tipo: data.tipo });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(user.establishment_authenticateds?.length === 0);
  }, []);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const handleShow = useCallback(() => {}, [ref]);
  const onSubmit = handleSubmit((data: InputsTipo) => Submit(data));
  return (
    <Modal ref={ref}>
      <Modal.Header className="font-bold">Hola {user.firstname}!</Modal.Header>
      <Modal.Body>
        <span className="font-medium">Ayudanos a conocerte </span>
      </Modal.Body>
      <Modal.Actions className="justify-normal w-full">
        <form className="space-y-6 w-full" method="POST" onSubmit={onSubmit}>
          <div>
            <Form.Label title="Soy un Alumno">
              <Radio
                name="tipo"
                onClick={() => setValue("tipo", "alumno")}
                className="checked:bg-primary mx-2"
              />
            </Form.Label>
            <Form.Label title="Soy un Apoderado">
              <Radio
                name="tipo"
                onClick={() => setValue("tipo", "apoderado")}
                className="checked:bg-primary mx-2 focus:bg-primary"
              />
            </Form.Label>
            <span className="text-error">{errors.tipo?.message}</span>
          </div>
          <div className="text-center">
            <Button color="primary">Siguiente</Button>
          </div>
        </form>
      </Modal.Actions>
    </Modal>
  );
}

function ModalSchoolAlumno() {
  const [regionList, setRegionList] = useState<string[]>([]);
  const [establecimientoList, setEstablecimientoList] = useState<
    stablishmentI[]
  >([]);
  const [comunaList, setComunaList] = useState<string[]>([]);
  const handleChangeComuna = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (Number(event.target.value) === 0) {
      return;
    }

    const data = await api_establishmentByComuna(event.target.value);
    setEstablecimientoList(data.data.data);
  };
  useEffect(() => {
    const Regiones = async () => {
      const data = await getRegiones();
      setRegionList(data.data.data);
    };
    Regiones();
  }, []);

  const handleChangeRegion = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const comunas = await getComunas(e.target.value);
    setComunaList(comunas.data.data);
  };

  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const handleShow = useCallback(() => {}, [ref]);
  const { bearer, setRole, GetRole, user, isLoading, addSchool } =
    useUserStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InputsSchoolStudent>({
    resolver: zodResolver(SchoolSchemaStudent),
  });

  const Submit = async (data: InputsSchoolStudent) => {
    try {
      const school = establecimientoList.find((e) => e.id === data.Schools);
      if (!school) throw "Not found school";
      await api_updateUser(user.id, {
        establishment_authenticateds: [data.Schools],
      });
      addSchool(data.Schools, school?.attributes.name);
    } catch (error) {
      console.log(error);
    }
  };
  const onSubmit = handleSubmit((data: InputsSchoolStudent) => Submit(data));
  return (
    <Modal ref={ref}>
      <Modal.Header className="font-bold">Hola {user.firstname}!</Modal.Header>
      <Modal.Body>
        <span className="font-medium">De que colegio eres ?</span>
      </Modal.Body>
      <Modal.Actions className="justify-normal w-full">
        <form
          className="space-y-6 w-full animate-fadein"
          method="POST"
          onSubmit={onSubmit}
        >
          <div className="sm:col-span-3">
            <label
              htmlFor="region"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Region de su colegio
            </label>
            <div className="mt-2">
              <select
                onChange={handleChangeRegion}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value={""}>Seleccione su region de su colegio</option>
                {regionList.map((region: string) => (
                  <option value={region} key={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="comuna"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Comuna de su colegio
            </label>
            <div className="mt-2">
              <select
                onChange={handleChangeComuna}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value={""}>Seleccione su Comuna de su colegio</option>
                {comunaList.map((comuna: string) => (
                  <option value={comuna} key={comuna}>
                    {comuna}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:col-span-3">
            <label className="md:flex-1 mr-4">
              <h6 className="text-sm leading-6 text-gray-900 font-bold">
                Establecimiento
              </h6>

              <select
                {...register("Schools", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value={""}>Seleccione el establecimiento</option>
                {establecimientoList.map((stablishment: stablishmentI) => (
                  <option value={stablishment.id} key={stablishment.id}>
                    {stablishment.attributes.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <span className="text-error">{errors.Schools?.message}</span>

          <div className="text-center">
            <Button color="primary">Siguiente</Button>
          </div>
        </form>
      </Modal.Actions>
    </Modal>
  );
}

function ModalSchoolApoderado() {
  const [regionList, setRegionList] = useState<string[]>([]);
  const [establecimientosVirtual, setEstablecimientoVirtual] = useState<
    { id: number; name: string }[]
  >([]);
  const [establecimientoList, setEstablecimientoList] = useState<
    stablishmentI[]
  >([]);
  const [comunaList, setComunaList] = useState<string[]>([]);
  const handleChangeComuna = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (Number(event.target.value) === 0) {
      return;
    }
    const data = await api_establishmentByComuna(event.target.value);
    setEstablecimientoList(data.data.data);
  };

  const handleChangeEstablecimiento = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (event.target.value === "") return;
    const establecimiento = establecimientoList.find((e) => Number(event.target.value) === e.id);
    if (!establecimiento) throw "Not found school";
    const list = getValues("Schools");
    if (list.find(e => e === establecimiento.id)) return ;
    setEstablecimientoVirtual((prevEstablecimientos) => [
      ...prevEstablecimientos,
      { id: establecimiento.id, name: establecimiento.attributes.name },
    ]);
    list.push(establecimiento.id)
    setValue("Schools",list)
  };
  useEffect(() => {
    const Regiones = async () => {
      const data = await getRegiones();
      setRegionList(data.data.data);
    };
    Regiones();
  }, []);

  const handleChangeRegion = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const comunas = await getComunas(e.target.value);
    setComunaList(comunas.data.data);
  };

  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const handleShow = useCallback(() => {}, [ref]);
  const { bearer, setRole, GetRole, user, isLoading, addSchool } =
    useUserStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InputsSchoolApoderado>({
    resolver: zodResolver(SchoolSchemaApoderado),defaultValues: {Schools: []},
  });

  const Submit = async (data: InputsSchoolApoderado) => {
    try {
      await api_updateUser(user.id, {
        establishment_authenticateds: data.Schools,
      });
      establecimientosVirtual.forEach(element => {
        addSchool(element.id,element.name);
      });
    } catch (error) {
      console.log(error);
    }
  };
  const deleteIndex = (index:number) => {
    removeEstablecimientoByIndex(index);
    const list = getValues("Schools");
    setValue("Schools",list.filter((e,_index) => _index !== index));
  }
  const removeEstablecimientoByIndex = (indexToRemove:number) => {
    setEstablecimientoVirtual((prevEstablecimientos) =>
      prevEstablecimientos.filter((_, index) => index !== indexToRemove)
    );
  };
  const onSubmit = handleSubmit((data: InputsSchoolApoderado) => Submit(data));
  return (
    <Modal ref={ref}>
      <Modal.Header className="font-bold">Hola {user.firstname}!</Modal.Header>
      <Modal.Body>
        <span className="font-medium">
          ¿En que colegios tiene a sus alumnos?
        </span>
      </Modal.Body>
      <Modal.Actions className="justify-normal w-full">
        <form
          className="space-y-6 w-full animate-fadein"
          method="POST"
          onSubmit={onSubmit}
        >
          <div className="sm:col-span-3">
            <label
              htmlFor="region"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Region de su colegio
            </label>
            <div className="mt-2">
              <select
                onChange={handleChangeRegion}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value={""}>Seleccione su region de su colegio</option>
                {regionList.map((region: string) => (
                  <option value={region} key={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="comuna"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Comuna de su colegio
            </label>
            <div className="mt-2">
              <select
                onChange={handleChangeComuna}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value={""}>Seleccione su Comuna de su colegio</option>
                {comunaList.map((comuna: string) => (
                  <option value={comuna} key={comuna}>
                    {comuna}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:col-span-3">
            <label className="md:flex-1 mr-4">
              <h6 className="text-sm leading-6 text-gray-900 font-bold">
                Establecimiento
              </h6>

              <select
                onChange={handleChangeEstablecimiento}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value={""}>Seleccione el establecimiento</option>
                {establecimientoList.map((stablishment: stablishmentI) => (
                  <option value={stablishment.id} key={stablishment.id}>
                    {stablishment.attributes.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <span className="text-error">{errors.Schools?.message}</span>

          {establecimientosVirtual.length !== 0 && (
            <Table size="xs" zebra className="animate-fadein">
              <Table.Head>
                <span />
                <span>Establecimiento</span>
                <span></span>
              </Table.Head>

              <Table.Body>
                {establecimientosVirtual.map((element, index) => (
                  <Table.Row key={index}>
                    <span>{index + 1}</span>
                    <span>{element.name}</span>
                    <span>
                      {" "}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteIndex(index);
                        }}
                        className="text-error"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}

          <div className="text-center">
            <Button color="primary">Siguiente</Button>
          </div>
        </form>
      </Modal.Actions>
    </Modal>
  );
}

export default function ModalWhoIS() {
  const { bearer, setRole, GetRole, user, isLoading, updateUser } =
    useUserStore();
  if (!user.tipo || user.tipo === "otro") return <ModalTipoUser />;
  if (user.establishment_authenticateds.length === 0 && user.tipo === "alumno")
    return <ModalSchoolAlumno />;
  if (
    user.establishment_authenticateds.length === 0 &&
    user.tipo === "apoderado"
  )
    return <ModalSchoolApoderado />;
}
