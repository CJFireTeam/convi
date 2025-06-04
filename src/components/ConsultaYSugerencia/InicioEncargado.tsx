import { useUserStore } from "@/store/userStore";
import { useEffect, useState, useCallback } from "react";
import {
  api_getSuggestionBySchool,
  api_updateSuggestionResponse,
} from "@/services/axios.services";
import { toast } from "react-toastify";
import { ISuggestion } from "@/interfaces/suggestion.interface";
import metaI from "@/interfaces/meta.interface";
import Head from "next/head";
import { EyeIcon } from "@heroicons/react/24/outline";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChatBubbleLeftIcon } from "@heroicons/react/20/solid";

export default function InicioEncargado() {
  const { user } = useUserStore();

  // Estadospara el fetch
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //estados para el paginado y la búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<metaI>({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0,
  });

  // Función para capitalizar nombres
  const capitalizeName = useCallback((name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  // Función para obtener sugerencias
  const fetchSuggestions = useCallback(
    async (page: number, pageSize: number, search: string) => {
      if (!user?.establishment?.id) {
        setError("No se encontró el establecimiento del usuario");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api_getSuggestionBySchool({
          establishment: user.establishment.id,
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
    [user?.establishment?.id]
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

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  //componente para enviar props a el modal
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ISuggestion | null>(null);

  //refrescar la pagina una vez sale del modal
  const refreshCurrentPage = useCallback(() => {
    fetchSuggestions(pagination.page, pagination.pageSize, searchQuery);
  }, [pagination.page, pagination.pageSize, searchQuery]);

  //spinner de loading mientras carga las peticiones
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  //en caso de error
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
        <title>Consulta y Sugerencia</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {/* Buscador */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row">
          <input
            type="text"
            placeholder="Buscar sugerencias..."
            className="input input-primary bg-white w-64 md:auto m-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-outline w-64 m-2 md:w-auto"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-md">
        <table className="table text-sm font-medium text-gray-900">
          <thead className="text-left">
            <tr>
              <th>N°</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Establecimiento</th>
              <th>Fecha</th>
              <th>Estado</th> {/* Nueva columna */}
            </tr>
          </thead>
          <tbody>
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => {
                const userData = suggestion.attributes.created.data.attributes;
                const establishmentData =
                  suggestion.attributes.establishment.data.attributes;

                // Determinar si tiene respuesta
                const hasResponse = suggestion.attributes.user_response?.data;

                return (
                  <tr key={suggestion.id} className="hover:bg-gray-100">
                    <td>{startNumber + index}</td>
                    <td>
                      {capitalizeName(userData.firstname)}{" "}
                      {capitalizeName(userData.first_lastname)}{" "}
                      {capitalizeName(userData.second_lastname)}
                    </td>
                    <td>{userData.email}</td>
                    <td>{establishmentData.name}</td>
                    <td>{formatDate(suggestion.attributes.createdAt)}</td>
                    <td>
                      {/* Nuevo ícono condicional */}
                      <button
                        className="btn btn-ghost btn-circle hover:scale-110 hover:text-primary transition-all duration-200"
                        onClick={() => setSelectedSuggestion(suggestion)}
                        aria-label={hasResponse ? "Ver detalle" : "Responder"}
                      >
                        {hasResponse ? (
                          <EyeIcon className="h-5 w-5" />
                        ) : (
                          <ChatBubbleLeftIcon className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No se encontraron sugerencias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4 text-sm font-medium text-gray-900">
        <div>
          Mostrando {(pagination.page - 1) * pagination.pageSize + 1} -{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
          {pagination.total} sugerencias
        </div>

        <div className="join">
          <button
            className="join-item btn btn-secondary btn-md"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            «
          </button>
          <button className="join-item btn btn-secondary btn-md">
            Página {pagination.page}
          </button>
          <button
            className="join-item btn btn-secondary btn-md"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pageCount}
          >
            »
          </button>
        </div>

        <select
          className="select select-secondary bg-secondary select-md"
          value={pagination.pageSize}
          onChange={(e) =>
            fetchSuggestions(1, parseInt(e.target.value), searchQuery)
          }
        >
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="30">30 por página</option>
          <option value="50">50 por página</option>
        </select>
      </div>
      {/* modal para ver la sugerencia */}
      {selectedSuggestion && (
        <ModalSuggestion
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onRefresh={refreshCurrentPage}
          currentUserId={user.id}
        />
      )}
    </>
  );
}

//props para el modal
interface ModalSuggestionProps {
  suggestion: ISuggestion | null;
  onClose: () => void;
  onRefresh: () => void;
  currentUserId: number;
}

//modal para ver la sugerencia
function ModalSuggestion({
  suggestion,
  onClose,
  onRefresh,
  currentUserId,
}: ModalSuggestionProps) {
  //estado para saber si responde el encargado
  const [isResponding, setIsResponding] = useState(false);
  if (!suggestion) return null;

  const userData = suggestion.attributes.created.data.attributes;
  const establishmentData = suggestion.attributes.establishment.data.attributes;

  // Determinar si tiene respuesta
  const hasResponse = suggestion.attributes.user_response?.data;
  const responderData = hasResponse
    ? suggestion.attributes.user_response?.data?.attributes
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="modal-box max-w-2xl rounded-box shadow-2xl bg-base-100 font-medium text-gray-900">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-red-500 hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-4 text-primary">
            Detalle de la Sugerencia
          </h2>

          <div className="space-y-4 p-4 bg-neutral rounded-box">
            {/* Detalle de la sugerencia */}
            <div className="card bg-base-200 shadow-md p-4 border border-base-300">
              <p>
                <strong>Texto:</strong>{" "}
                <span className="text-gray-700">
                  {suggestion.attributes.suggestion}
                </span>
              </p>
            </div>

            {/* detalles del usuario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card bg-base-200 shadow p-4 border border-base-300">
                <h3 className="font-semibold text-lg mb-2 text-info">
                  Usuario
                </h3>
                <p>{`${userData.firstname} ${userData.first_lastname} ${userData.second_lastname}`}</p>
                <p className="text-sm text-gray-600 mt-1">{userData.email}</p>
              </div>

              {/* detalles del establecimiento */}
              <div className="card bg-base-200 shadow p-4 border border-base-300">
                <h3 className="font-semibold text-lg mb-2 text-info">
                  Establecimiento
                </h3>
                <p>{establishmentData.name}</p>
                <p className="text-sm text-gray-600 mt-1">{`${establishmentData.Region} - ${establishmentData.Comuna}`}</p>
              </div>
            </div>

            <div className="text-right text-sm text-gray-500">
              <span>Creado :</span>{" "}
              {new Date(suggestion.attributes.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Mostrar respuesta si existe */}
          {hasResponse && (
            <div className="card bg-green-50 shadow-md p-4 border border-green-200">
              <p>
                <strong>Respuesta:</strong>{" "}
                <span className="text-gray-700">
                  {suggestion.attributes.response}
                </span>
              </p>
              {/* {responderData && (
                  <p className="text-sm text-gray-600 mt-2">
                    Respondido por: {responderData.firstname}{" "}
                    {responderData.first_lastname}
                  </p>
                )} */}
              <p className="text-sm text-gray-500 mt-2">
                Respondido :{" "}
                {new Date(suggestion.attributes.updatedAt).toLocaleString()}
              </p>
            </div>
          )}

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={onClose}>
              Cerrar
            </button>

            {/* Mostrar botón de responder solo si no tiene respuesta */}
            {!hasResponse && (
              <button
                className="btn btn-primary"
                onClick={() => setIsResponding(true)}
              >
                Responder
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Modal de respuesta (solo si no tiene respuesta) */}
      {isResponding && !hasResponse && suggestion && (
        <ResponseFormModal
          suggestionId={suggestion.id}
          currentUserId={currentUserId}
          onClose={() => setIsResponding(false)}
          onSuccess={() => {
            onRefresh();
            onClose();
          }}
        />
      )}
    </>
  );
}

//sub componente modal de respuesta
function ResponseFormModal({
  suggestionId,
  currentUserId,
  onClose,
  onSuccess,
}: {
  suggestionId: number;
  currentUserId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  //zod para el update
  const responseSchema = z.object({
    response: z
      .string({
        required_error: "Campo requerido",
        invalid_type_error: "Tipo de dato inválido",
      })
      .min(3, "Por favor ingrese una respuesta mas larga."),
  });

  // Tipo inferido del esquema
  type ResponseFormData = z.infer<typeof responseSchema>;

  //react hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
  });

  const onSubmit = async (data: ResponseFormData) => {
    if (!currentUserId) {
      toast.error("sin id de usuario.");
      return;
    }
    try {
      await api_updateSuggestionResponse(suggestionId, {
        response: data.response,
        user_response: currentUserId,
      });
      toast.success("Respuesta enviada correctamente");
      onSuccess();
    } catch (error) {
      toast.error("Error al enviar la respuesta");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-box max-w-2xl rounded-box shadow-2xl bg-base-100">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-red-500 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-primary">
          Responder Sugerencia
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tu respuesta</span>
            </label>
            <textarea
              {...register("response", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
              className={`textarea textarea-primary h-32 ${
                errors.response ? "textarea-error" : ""
              }`}
              placeholder="Escribe tu respuesta aquí..."
            />
            {errors.response && (
              <span className="text-error text-sm mt-1">
                {errors.response.message}
              </span>
            )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
