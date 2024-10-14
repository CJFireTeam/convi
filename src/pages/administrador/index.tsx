import router, { useRouter } from "next/router";
import WarningAlert from "@/components/alerts/warningAlert";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { api_getAllUsersByEstablishment } from "@/services/axios.services";
import { PencilIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";

export interface IUser {
  id: number;
  username: string;
  comuna: string;
  email: string;
  provider?: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt?: string;
  updatedAt?: string;
  second_lastname: string;
  first_lastname: string;
  firstname: string;
  secondname: string;
  establishment?: number;
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function Index() {
  const { push } = useRouter();
  const redirect = () => {
    push("administrador/crearusuario");
  };
  const { user, GetRole } = useUserStore();
  const [data, setData] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const usersPerPage = 10;

  const getData = async () => {
    if (user?.establishment?.name) {
      setIsLoading(true);
      try {
        const response = await api_getAllUsersByEstablishment({
          establishment: user.establishment.name,
          page: currentPage,
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar los usuarios');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user?.id !== 0 && GetRole() === "admin") {
      getData();
    }
  }, [user, currentPage]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(data.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleRouter = (id: number) => {
    sessionStorage.setItem("id_survey", id.toString());
    toast.success('Usuario seleccionado');
    // Implementar la lógica de redirección aquí
  };

  if (GetRole() !== "admin") {
    return <WarningAlert message="No tienes permisos para ver esta página" />;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Lista de usuarios</h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button onClick={redirect} className="btn btn-primary btn-outline">
            Crear nuevo usuario
          </button>
        </div>
      </div>
      {isLoading ? (
        <p className="text-center mt-4">Cargando usuarios...</p>
      ) : data.length === 0 ? (
        <WarningAlert message="No se han encontrado usuarios" />
      ) : (
        <>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300 border rounded-md">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nombre</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Editar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {indexOfFirstUser + index + 1}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.id}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.firstname} {user.first_lastname}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <button onClick={() => router.push(`/administrador/editarUsuario?id=${user.id}`)}>
                            <PencilIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="btn btn-primary btn-outline"
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="btn btn-primary btn-outline"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}