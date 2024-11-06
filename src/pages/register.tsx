import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import convi from "./convi.jpg";
import Image from "next/image";
import { CheckIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validations/recoverSchema";
import { getComunas, getRegiones } from "../services/local.services";
import stablishmentI from "../interfaces/establishment.interface";
import { api_establishmentByComuna } from "../services/axios.services";

Modal.setAppElement('#__next');
//

interface Inputs {
  username: string;
  email: string;
  password: string;
  first_lastname: string;
  second_lastname: string;
  firstname: string;
  secondname: string;
  region: string;
  comuna: string;
  direccion: string;
  phone: string;
  // tipo: string;
  // establishment_authenticateds: number[];
}


export default function Register() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalOut, setModalOut] = useState(false);
  const [email, setemail] = useState("");
  const [comunaList, setComunaList] = useState<string[]>([]);
  const [establecimientoList, setEstablecimientoList] = useState<stablishmentI[]>([]);
  const [comunaSelected, setComunaSelected] = useState<string>("");
  const [regionList, setRegionList] = useState<string[]>([]);
  const {register, handleSubmit, watch, setValue, formState: {errors} } = useForm<Inputs>({
    resolver: zodResolver(registerSchema),
  });

  const handleInputString = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = event.target.value;
      inputValue = inputValue.replace(/[^a-zA-Z\s]/g, "");
      event.target.value = inputValue;
  };
  useEffect(() => {
    const Regiones = async () => {
      const data = await getRegiones();
      setRegionList(data.data.data);
    };
    Regiones();
  }, []);
  
  function openModal() {
    setModalOut(true)
    setIsOpen(true);
  }

  function closeModal() {
    setModalOut(false)
    setTimeout(() => {
      setIsOpen(false);
      router.push({ pathname: "/login" });
    }, 500);
  }
  const Submit = async (data: Inputs) => {
    const id = toast.loading("Creando...");
    data.username = data.email
    try {  
      await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "auth/local/register",
        data
      );
      openModal();
      toast.update(id, {
        render: "creado correctamente",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          if (error.response.data.error.message)
            if (error.response.data.error.message === "Email or Username are already taken") toast.update(id, {
              render: "Error: El correo electronico Ya se encuentra en uso.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
              
            })
            router.push({ pathname: "/login" });
            
        }
      } else {
        toast.update(id, {
          render: "Ocurrió un error al crear la cuenta.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setIsVisible(true);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);
  const login = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.push({ pathname: "/login" });
    }, 500);
  };

  const regionWatch =watch("region")
  const handleChangeRegion = async (
    region:string
  ) => {
    setValue("comuna","")
    const comunas = await getComunas(region);
    setComunaList(comunas.data.data);
  };
  useEffect( () => {
    if (!regionWatch || regionWatch.length === 0) return;
    handleChangeRegion(regionWatch)
  }, [regionWatch])
  

  const onSubmits = handleSubmit((data) => Submit(data))

  return (
    <div className="bg-white">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
          modalOut ? "animate-fadein" : "animate-fadeout"
        }`}
      >
        <div className="bg-white p-6 rounded-lg w-full sm:w-3/4 md:w-1/2 lg:max-w-md mx-auto flex flex-col">
          <div className="flex items-center justify-center mb-4">
            <CheckIcon className="w-6 text-primary-500" aria-hidden="true" />
          </div>
          <span className="text-left">
            Hemos enviado un correo electrónico a
            <span className="text-blue-500"> {email} </span>
            con un enlace de verificación.
          </span>
          <span className="text-left">
            Por favor, verifica tu correo electrónico para completar tu
            registro.
          </span>
          <span className="text-left text-red-500">
            Si no recibes el correo electrónico en unos minutos, por favor
            revisa tu carpeta de correo no deseado o spam.
          </span>
          <button
            onClick={closeModal}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ir a mi cuenta
          </button>
        </div>
      </Modal>
      <div
        className={`flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 transition-transform ${
          isVisible ? "animate-fadein" : "animate-fadeout"
        }`}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            className=" dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
            src={convi}
            alt="Convi"
            priority
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Registrate
          </h2>
        </div>

        <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="bg-white space-y-6" method="POST" onSubmit={onSubmits}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Datos de la cuenta
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600"></p>

                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
                  <div className="col-span-full">
                    <label
                      htmlFor="Email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      email
                    </label>
                    <div className="mt-2">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary sm:max-w-md">
                        <input
                          type="email"
                          id="email"
                          autoComplete="email"
                          {...register("email", {setValueAs: (value) => value === "" ? undefined : value})}
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        />
                      </div>
                      <span className="text-error text-weight-600">{errors.email?.message ? errors.email?.message : ""}</span>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Contraseña
                    </label>
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary sm:max-w-md">
                      <input
                        
                        minLength={6}
                        type="password"
                        id="password"
                        {...register("password", {setValueAs: (value) => value === "" ? undefined : value})}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                    <span className="text-error text-weight-600">{errors.password?.message ? errors.password?.message : ""}</span>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-900/10 pb-6">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Informacion personal
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="firstname"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Primer nombre
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="firstname"
                        {...register("firstname", {setValueAs: (value) => value === "" ? undefined : value})}
                        autoComplete="firstname"
                        onInput={handleInputString}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                    <span className="text-error text-weight-600">{errors.firstname?.message ? errors.firstname?.message : ""}</span>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="secondname"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Segundo nombre
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="secondname"
                        {...register("secondname", {setValueAs: (value) => value === "" ? undefined : value})}
                        onInput={handleInputString}
                        autoComplete="secondname"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                    <span className="text-error text-weight-600">{errors.secondname?.message ? errors.secondname?.message : ""}</span>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="first_lastname"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Primer apellido
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register("first_lastname", {setValueAs: (value) => value === "" ? undefined : value})}
                        id="first_lastname"
                        onInput={handleInputString}
                        autoComplete="first_lastname"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                    <span className="text-error text-weight-600">{errors.first_lastname?.message ? errors.first_lastname?.message : ""}</span>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="second_lastname"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Segundo apellido
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register("second_lastname", {setValueAs: (value) => value === "" ? undefined : value})}
                        id="second_lastname"
                        onInput={handleInputString}
                        autoComplete="second_lastname"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                    <span className="text-error text-weight-600">{errors.second_lastname?.message ? errors.second_lastname?.message : ""}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Region de residencia
                    </label>
                    <div className="mt-2">
                    <select {...register("region")} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6">
                      <option  value={""}>Seleccione su region de residencia</option>
                      {regionList.map((region: string) => (
                        <option value={region} key={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    </div>
                    <span className="text-error text-weight-600">{errors.region?.message ? errors.region?.message : ""}</span>

                  </div>
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="comuna"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                     Comuna de residencia
                    </label>
                    <div className="mt-2">
                    <select {...register("comuna")} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6">
                      <option value={""}>Seleccione su Comuna de residencia</option>
                      {comunaList.map((comuna: string) => (
                        <option value={comuna} key={comuna}>
                          {comuna}
                        </option>
                      ))}
                    </select>
                    </div>
                    <span className="text-error text-weight-600">{errors.comuna?.message ? errors.comuna?.message : ""}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="direccion"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Dirección
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register("direccion", {setValueAs: (value) => value === "" ? undefined : value})}
                        id="direccion"
                        autoComplete="direccion"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                    <span className="text-error text-weight-600">{errors.direccion?.message ? errors.direccion?.message : ""}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Teléfono
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register("phone", {setValueAs: (value) => value === "" ? undefined : value})}
                        id="phone"
                        autoComplete="phone"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                    <span className="text-error text-weight-600">{errors.phone?.message ? errors.phone?.message : ""}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-x-6">
              <button
                type="button"
                onClick={login}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Ya tengo cuenta
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Registrarme
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
