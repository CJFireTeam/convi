import { api_getOneUser, api_updateUser } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, isAxiosError } from "axios";
import router from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { getComunas, getRegiones } from "@/services/local.services";
import { editProfileSchema } from "@/validations/editProfileSchema";
import Head from "next/head";

interface Inputs {
  first_lastname: string;
  second_lastname: string;
  firstname: string;
  secondname: string;
  region: string;
  comuna: string;
  direccion: string;
  phone: string;
}

export default function CambiarContrasena() {
  const { user } = useUserStore();
  
  // Estados para las listas de regiones y comunas
  const [regionList, setRegionList] = useState<string[]>([]);
  const [comunaList, setComunaList] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(user.region || '');
  const [selectedComuna, setSelectedComuna] = useState(user.comuna || '');

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_lastname: user.first_lastname,
      second_lastname: user.second_lastname,
      firstname: user.firstname,
      secondname: user.secondname,
      region: user.region || "",
      comuna: user.comuna || "",
      direccion: user.direccion,
      phone: user.phone,
    },
  });

  // Función para obtener comunas de una región específica
  const fetchComunas = async (region: string) => {
    try {
      const data = await getComunas(region);
      return data.data.data;
    } catch (error) {
      console.error("Error al obtener comunas:", error);
      return [];
    }
  };

  // Cargar regiones al montar el componente
  useEffect(() => {
    const loadRegiones = async () => {
      try {
        const data = await getRegiones();
        setRegionList(data.data.data);
      } catch (error) {
        console.error("Error al cargar regiones:", error);
      }
    };
    loadRegiones();
  }, []);

  // Cargar comunas cuando se tiene una región inicial
  useEffect(() => {
    if (user.region) {
      setSelectedRegion(user.region);
      setValue('region', user.region);
      
      const loadComunasIniciales = async () => {
        const comunas = await fetchComunas(user.region);
        setComunaList(comunas);
        
        if (user.comuna) {
          setSelectedComuna(user.comuna);
          setValue('comuna', user.comuna);
        }
      };
      
      loadComunasIniciales();
    }
  }, [user.region, user.comuna, setValue]);

  // Manejar cambio de región
  const handleChangeRegion = async (region: string) => {
    setSelectedRegion(region);
    setValue("region", region);
    setValue("comuna", ""); // Limpiar comuna al cambiar región
    setSelectedComuna("");
    
    if (region) {
      const comunas = await fetchComunas(region);
      setComunaList(comunas);
    } else {
      setComunaList([]);
    }
  };

  // Manejar cambio de comuna
  const handleChangeComuna = (comuna: string) => {
    setSelectedComuna(comuna);
    setValue("comuna", comuna);
  };

  const onSubmit = async (data: Inputs) => {
    try {
      const resp = await api_updateUser(user.id, data);
      toast.success("Perfil guardado correctamente");
      // Actualiza el estado del usuario en el store con la información actualizada
      const response = await api_getOneUser(user.id);
      const updatedUser = response.data; // Extract the user data from the response
      useUserStore.getState().updateUser(updatedUser);
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error) {
      console.log(error);
      toast.error(
        "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
      );
    }
  };

  function atrasBoton() {
    router.push("/perfil");
  }

  return (
    <>
      <Head>
        <title>Actualizar información</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex flex-col items-center">
        <div className="flex flex-col rounded-lg border shadow-2xl animate-fadein mb-4 p-10">
          <div className="mb-4">
            <button onClick={atrasBoton}>
              <ArrowLeftIcon className="h-8 w-8 text-primary "></ArrowLeftIcon>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="text-center font-bold text-xl mb-4">
              <span>Actualizar información</span>
            </div>

            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left ">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Primer nombre:
                </span>
              </div>
              <div>
                <input
                  type="text"
                  id="firstname"
                  {...register("firstname", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full"
                  placeholder="Ingrese su primer nombre..."
                />
                {errors.firstname?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.firstname.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left ">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Segundo nombre:
                </span>
              </div>
              <div>
                <input
                  type="text"
                  id="secondname"
                  {...register("secondname", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full"
                  placeholder="Ingrese su segundo nombre..."
                />
                {errors.secondname?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.secondname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left ">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Apellido paterno:
                </span>
              </div>
              <div>
                <input
                  type="text"
                  id="first_lastname"
                  {...register("first_lastname", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full"
                  placeholder="Ingrese su primer apellido..."
                />
                {errors.first_lastname?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.first_lastname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Apellido materno:
                </span>
              </div>
              <div>
                <input
                  type="text"
                  id="second_lastname"
                  {...register("second_lastname", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full"
                  placeholder="Ingrese su segundo apellido..."
                />
                {errors.second_lastname?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.second_lastname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Region:
                </span>
              </div>
              <div>
                <select
                  value={selectedRegion}
                  onChange={(e) => handleChangeRegion(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                >
                  <option value="">Seleccione su region de residencia</option>
                  {regionList.map((region: string) => (
                    <option value={region} key={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.region.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Comuna:
                </span>
              </div>
              <div>
                <select
                  value={selectedComuna}
                  onChange={(e) => handleChangeComuna(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  disabled={!selectedRegion}
                >
                  <option value="">Seleccione su comuna de residencia</option>
                  {comunaList.map((comuna: string) => (
                    <option value={comuna} key={comuna}>
                      {comuna}
                    </option>
                  ))}
                </select>
                {errors.comuna?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.comuna.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Dirección:
                </span>
              </div>
              <div>
                <input
                  type="text"
                  id="direccion"
                  {...register("direccion", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full"
                  placeholder="Ingrese su dirección..."
                />
                {errors.direccion?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.direccion.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-subgrid md:grid-cols-2 lg:grid-cols-2 gap-2 mb-4">
              <div className="text-left">
                <span className="text-base font-semibold leading-6 text-gray-900">
                  Teléfono:
                </span>
              </div>
              <div>
                <input
                  type="text"
                  id="phone"
                  {...register("phone", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  className="col-start-1 md:col-span-1 lg:col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full"
                  placeholder="Ej:+56989898989"
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor.length > 12) {
                      e.target.value = valor.substring(0, 12);
                    } else {
                      const regex = /^\+?\d{1,12}$/;
                      if (!regex.test(valor)) {
                        e.target.value = valor.replace(/[^0-9+]/g, "");
                      }
                    }
                  }}
                />
                {errors.phone?.message && (
                  <p className="text-error text-sm mb-4 text-center">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col item-center">
              <button
                className="flex w-full justify-center text-white hover:brightness-90 rounded-md px-3 py-1.5 text-sm font-semibold bg-primary"
                type="submit"
              >
                Actualizar datos
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}