import { useUserStore } from "@/store/userStore";
import { useEffect, useState, useCallback } from "react";
import { api_getSuggestionBySchool } from "@/services/axios.services";
import { toast } from "react-toastify";
import { ISuggestion } from "@/interfaces/suggestion.interface";
import metaI from "@/interfaces/meta.interface";
import Head from "next/head";

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
    
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}-${month}-${year}`;
  };

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
            className="input input-primary bg-white w-2/5 m-2 md:w-auto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-outline w-2/5 m-2 md:w-auto">
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
              <th>Region establecimiento</th>
              <th>Comuna establecimiento</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => {
                const userData = suggestion.attributes.created.data.attributes;
                const establishmentData =
                  suggestion.attributes.establishment.data.attributes;

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
                    <td>{establishmentData.Region}</td>
                    <td>{establishmentData.Comuna}</td>
                    <td>{formatDate(suggestion.attributes.createdAt)}</td>
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
    </>
  );
}
