// components/ConsultaYSugerencia/InicioUsuario.tsx
import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/userStore";
import { toast } from "react-toastify";
import {
  api_establishmentByComuna,
  api_getSuggestionsByUser,
  api_softDeleteSuggestion,
} from "@/services/axios.services";
import { ISuggestion } from "@/interfaces/suggestion.interface";
import metaI from "@/interfaces/meta.interface";
import Head from "next/head";
import { EyeIcon } from "@heroicons/react/24/outline";
import { TrashIcon, PlusIcon } from "@heroicons/react/20/solid";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suggestionSchema } from "@/validations/suggestionSchema";
import axios from "axios";
import Cookies from "js-cookie";
import { getComunas, getRegiones } from "@/services/local.services";

export default function InicioUsuario() {
  const { user } = useUserStore();

  // Estados para el fetch
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el paginado y la búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<metaI>({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0,
  });

  // Estado para el modal de nueva sugerencia
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  // Función para obtener sugerencias
  const fetchSuggestions = useCallback(
    async (page: number, pageSize: number, search: string) => {
      if (!user?.id) {
        setError("Usuario no autenticado");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api_getSuggestionsByUser({
          userId: user.id,
          page,
          pageSize,
          search,
        });

        setSuggestions(response.data.data);
        setPagination(response.data.meta.pagination);
      } catch (err) {
        console.error("Error al obtener sugerencias:", err);
        setError("No se pudieron cargar las sugerencias");
        toast.error("Error al cargar las sugerencias");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // Cargar datos iniciales
  useEffect(() => {
    fetchSuggestions(pagination.page, pagination.pageSize, searchQuery);
  }, [fetchSuggestions]);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      fetchSuggestions(newPage, pagination.pageSize, searchQuery);
    }
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuggestions(1, pagination.pageSize, searchQuery);
  };

  // Componente para enviar props al modal de detalle
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ISuggestion | null>(null);

  // Refrescar tabla después de crear nueva sugerencia
  const refreshTable = () => {
    fetchSuggestions(1, pagination.pageSize, "");
    setSearchQuery("");
  };

  // Spinner de carga
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <div className="alert alert-error m-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  // Calcular número inicial para la paginación
  const startNumber = (pagination.page - 1) * pagination.pageSize + 1;

  return (
    <>
      <Head>
        <title>Mis Sugerencias</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {/* Barra superior con botón y buscador */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button
          className="btn btn-secondary btn-outline"
          onClick={() => setIsFormModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Consulta o Sugerencia
        </button>

        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar sugerencias..."
              className="input input-primary bg-white w-64 md:w-80 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  setSearchQuery("");
                  fetchSuggestions(1, pagination.pageSize, "");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-outline ml-2">
            Buscar
          </button>
        </form>
      </div>

      {/* Tabla de sugerencias */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="table w-full text-sm font-medium text-gray-900">
          <thead>
            <tr className="bg-base-200">
              <th>N°</th>
              <th>Establecimiento</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => {
                const establishmentData =
                  suggestion.attributes.establishment.data.attributes;
                const hasResponse = !!suggestion.attributes.response;

                return (
                  <tr key={suggestion.id} className="hover:bg-base-100">
                    <td>{startNumber + index}</td>
                    <td>{establishmentData.name}</td>
                    <td>{new Date(suggestion.attributes.createdAt).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          hasResponse ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {hasResponse ? "Respondida" : "Pendiente"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm hover:text-primary"
                        onClick={() => setSelectedSuggestion(suggestion)}
                        aria-label="Ver detalle"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="text-gray-500">
                    No se encontraron sugerencias
                  </div>
                  <button
                    className="btn btn-link mt-2"
                    onClick={() => setIsFormModalOpen(true)}
                  >
                    Crear mi primera sugerencia
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4 text-sm font-medium text-gray-900">
        <div className="text-sm">
          Mostrando {(pagination.page - 1) * pagination.pageSize + 1} -{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
          {pagination.total} sugerencias
        </div>

        <div className="join">
          <button
            className="join-item btn btn-secondary btn-outline btn-md"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            «
          </button>
          <button className="join-item btn btn-secondary btn-outline btn-md">
            Página {pagination.page}
          </button>
          <button
            className="join-item btn btn-secondary btn-outline btn-md"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pageCount}
          >
            »
          </button>
        </div>

        <select
          className="select select-primary"
          value={pagination.pageSize}
          onChange={(e) =>
            fetchSuggestions(1, parseInt(e.target.value), searchQuery)
          }
        >
          <option value="5">5 por página</option>
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="30">30 por página</option>
        </select>
      </div>

      {/* Modal para ver detalle de sugerencia */}
      {selectedSuggestion && (
        <ViewSuggestionModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
        />
      )}

      {/* Modal para crear nueva sugerencia */}
      {isFormModalOpen && (
        <SuggestionFormModal
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={refreshTable}
        />
      )}
    </>
  );
}

// Modal para ver detalle (solo lectura)
function ViewSuggestionModal({
  suggestion,
  onClose,
}: {
  suggestion: ISuggestion;
  onClose: () => void;
}) {
  const userData = suggestion.attributes.created.data.attributes;
  const establishmentData = suggestion.attributes.establishment.data.attributes;
  const hasResponse = !!suggestion.attributes.response;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-box max-w-2xl bg-base-100 rounded-box shadow-xl">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-xl font-bold mb-4">Detalle de la Sugerencia</h3>

        <div className="space-y-4">
          <div>
            <label className="font-semibold">Establecimiento:</label>
            <p className="mt-1">{establishmentData.name}</p>
            <p className="text-sm text-gray-600">
              {establishmentData.Region} - {establishmentData.Comuna}
            </p>
          </div>

          <div>
            <label className="font-semibold">Tu sugerencia:</label>
            <div className="mt-1 p-3 bg-base-200 rounded-lg">
              {suggestion.attributes.suggestion}
            </div>
          </div>

          <div>
            <label className="font-semibold">Fecha de creación:</label>
            <p>{new Date(suggestion.attributes.createdAt).toLocaleString()}</p>
          </div>

          {hasResponse && (
            <div className="border-t pt-4 mt-4">
              <label className="font-semibold text-success">Respuesta:</label>
              <div className="mt-1 p-3 bg-success bg-opacity-10 rounded-lg">
                {suggestion.attributes.response}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Respondido el:{" "}
                {new Date(suggestion.attributes.updatedAt).toLocaleString()}
              </p>
            </div>
          )}

          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de confirmación para eliminar (reutilizable)
function DeleteConfirmationModal({
  suggestion,
  onClose,
  onConfirm,
  loading,
}: {
  suggestion: ISuggestion;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="font-bold text-lg text-error">Eliminar Sugerencia</h3>
        <p className="py-4">
          ¿Estás seguro de que deseas eliminar esta sugerencia?
        </p>
        <div className="bg-base-200 p-3 rounded-lg mt-2">
          <p className="truncate">
            {suggestion.attributes.suggestion.substring(0, 100)}...
          </p>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn btn-error"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Sí, Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Inputs {
  suggestion: string;
  establishment: number;
  created: number;
}

function SuggestionFormModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const methods = useForm<Inputs>({
    resolver: zodResolver(suggestionSchema),
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = methods;
  const { user } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seleccion, setSeleccion] = useState("");

  // Watch para debugging
  const watchedValues = watch();

  useEffect(() => {
    if (user?.id) {
      setValue("created", user.id);
    }
  }, [user, setValue]);

  // Manejar cambio de selección igual que en el código anterior
  const handleSeleccionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    console.log("Selección cambiada a:", value);

    if (value === "convi") {
      // Usar el mismo patrón que en tu código anterior
      const establishmentId = user?.establishment_authenticateds?.[0]?.id;
      console.log("Establecimiento del usuario:", establishmentId);
      setValue("establishment", establishmentId);
    }
    setSeleccion(value);
  };

  const onSubmit = async (data: Inputs) => {
    console.log("Datos del formulario:", data); // Debug
    console.log("Selección:", seleccion); // Debug

    // Validaciones adicionales
    if (!data.suggestion?.trim()) {
      toast.error("La sugerencia es obligatoria");
      return;
    }

    if (seleccion === "otro establecimiento" && !data.establishment) {
      toast.error("Debe seleccionar un establecimiento");
      return;
    }

    if (seleccion === "convi" && !user?.establishment_authenticateds?.[0]?.id) {
      toast.error("No se encontró el establecimiento del usuario");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        data: {
          suggestion: data.suggestion.trim(),
          establishment:
            seleccion === "convi"
              ? user.establishment_authenticateds[0].id
              : data.establishment,
          created: user.id,
        },
      };

      console.log("Payload a enviar:", payload); // Debug

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}suggestions`,
        payload,
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("bearer"),
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response); // Debug

      toast.success("¡Sugerencia enviada correctamente!");
      onSuccess();
      onClose();
      reset();
      setSeleccion("");
    } catch (error) {
      console.error("Error completo:", error);

      if (axios.isAxiosError(error)) {
        console.error("Respuesta del error:", error.response?.data);
        const errorMsg =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Error al enviar la sugerencia";
        toast.error(errorMsg);
      } else {
        toast.error("Error al enviar la sugerencia");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-box max-w-3xl">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-4">Nueva Consulta o Sugerencia</h3>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Seleccione a quién va dirigida la sugerencia:
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                className="select select-primary bg-white w-full"
                value={seleccion}
                onChange={handleSeleccionChange}
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="convi">Encargado de convivencia escolar</option>
                <option value="otro establecimiento">
                  Otro establecimiento
                </option>
              </select>
              {!seleccion && (
                <p className="text-error text-sm mt-1">
                  Debe seleccionar una opción
                </p>
              )}
            </div>

            {seleccion === "otro establecimiento" && <ColegioSection />}

            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Escriba su consulta o sugerencia:
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                {...methods.register("suggestion")}
                className="textarea textarea-primary bg-white w-full h-32"
                placeholder="Escriba aquí su sugerencia..."
                required
              />
              {errors.suggestion && (
                <p className="text-error text-sm mt-1">
                  {errors.suggestion.message}
                </p>
              )}
            </div>

            <div className="bg-info bg-opacity-10 p-4 rounded-lg mb-4">
              <p className="text-sm">
                <span className="font-bold">Importante:</span> Su consulta o
                sugerencia será recepcionada por el equipo de convivencia
                escolar del establecimiento y será respondida a la brevedad por
                esta misma aplicación, podrá ver la respuesta en la su
                sugerencia creada.
              </p>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !seleccion}
              >
                {isSubmitting ? "Enviando..." : "Enviar Sugerencia"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

// Componente para selección de colegio (reutilizado)
function ColegioSection() {
  const { register, setValue, watch } = useFormContext();
  const [regionList, setRegionList] = useState<string[]>([]);
  const [regionSelected, setRegionSelected] = useState("");
  const [comunaList, setComunaList] = useState<string[]>([]);
  const [comunaSelected, setComunaSelected] = useState("");
  const [establecimientoList, setEstablecimientoList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeRegion = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const region = e.target.value;
    setRegionSelected(region);
    setComunaSelected("");
    setEstablecimientoList([]);
    setValue("establishment", "");

    if (region) {
      setIsLoading(true);
      try {
        const comunas = await getComunas(region);
        setComunaList(comunas.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar comunas");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChangeComuna = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const comuna = e.target.value;
    setComunaSelected(comuna);
    setEstablecimientoList([]);
    setValue("establishment", "");

    if (comuna) {
      setIsLoading(true);
      try {
        const response = await api_establishmentByComuna(comuna);
        setEstablecimientoList(response.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar establecimientos");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadRegiones = async () => {
      try {
        const data = await getRegiones();
        setRegionList(data.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadRegiones();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Región:</label>
        <select
          className="select select-primary bg-white w-full"
          value={regionSelected}
          onChange={handleChangeRegion}
          disabled={isLoading}
        >
          <option value="">Seleccione región</option>
          {regionList.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Comuna:</label>
        <select
          className="select select-primary bg-white w-full"
          value={comunaSelected}
          onChange={handleChangeComuna}
          disabled={!regionSelected || isLoading}
        >
          <option value="">Seleccione comuna</option>
          {comunaList.map((comuna) => (
            <option key={comuna} value={comuna}>
              {comuna}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">
          Establecimiento:
        </label>
        <select
          {...register("establishment", {
            setValueAs: (value) => (value ? parseInt(value) : undefined),
          })}
          className="select select-primary bg-white w-full"
          disabled={
            !comunaSelected || isLoading || establecimientoList.length === 0
          }
        >
          <option value="">Seleccione establecimiento</option>
          {establecimientoList.map((est) => (
            <option key={est.id} value={est.id}>
              {est.attributes.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
