import router, { useRouter } from "next/router";
import WarningAlert from "@/components/alerts/warningAlert";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import {
  api_getAllUsersAutByEstablishment,
  api_getAllUsersOtrosByEstablishment,
  api_updateUser,
} from "@/services/axios.services";
import Head from "next/head";

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
  role: {
    id: number;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function Index() {
  const { push,query } = useRouter();
  const redirect = () => {
    push("administrador/crearusuario");
  };

  //estado para manejar pestañas
  /* const [activeTab, setActiveTab] = useState<'users' | 'authenticated'>('users'); */
   // Usamos el parámetro de consulta para determinar la pestaña activa
  const [activeTab, setActiveTab] = useState<'users' | 'authenticated'>(() => {
    return query.tab === 'authenticated' ? 'authenticated' : 'users';
  });

  const { user, GetRole } = useUserStore();
  const [data, setData] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const usersPerPage = 10;

  const getData = async () => {
    if (user?.establishment?.name) {
      setIsLoading(true);
      try {
        const response = await api_getAllUsersOtrosByEstablishment({
          establishment: user.establishment.name,
          page: currentPage,
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar los usuarios");
      } finally {
        setIsLoading(false);
      }
    }
  };

  //estados para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Función para manejar la eliminación
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      await api_updateUser(selectedUserId, { eliminado: true });
      toast.success("Usuario eliminado con éxito");
      await getData(); // Recargar los datos
    } catch (error) {
      toast.error("Error al eliminar el usuario");
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setSelectedUserId(null);
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
    toast.success("Usuario seleccionado");
    // Implementar la lógica de redirección aquí
  };
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = data.filter(
    (user) =>
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (GetRole() !== "admin") {
    return <WarningAlert message="No tienes permisos para ver esta página" />;
  }

  return (
    <>
       <Head>
        <title>Administrar usuarios</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Lista de usuarios
            </h1>
          </div>
          <div className="my-4">
            <button
              onClick={redirect}
              className="w-full md:w-auto btn btn-primary btn-outline mt-4 md:mt-0"
              disabled={activeTab === 'authenticated'}
            >
              Crear nuevo usuario
            </button>
          </div>
        </div>
        
        {/* Selector de pestañas */}
        <div className="tabs tabs-boxed bg-white shadow-sm p-1">
          <button
            className={`tab ${activeTab === 'users' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Usuarios
          </button> 
          <button
            className={`tab ${activeTab === 'authenticated' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('authenticated')}
          >
            Usuarios Autenticados
          </button>
        </div>

        {isLoading ? (
          <p className="text-center mt-4">Cargando usuarios...</p>
        ) : (
          <>
            {activeTab === 'users' ? (
              // Tabla de usuarios normales
              <>
                {data.length === 0 ? (
                  <WarningAlert message="No se han encontrado usuarios" />
                ) : (
                   <>
                <div className="mt-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, apellido o correo"
                      className="w-full md:w-96 pl-10 pr-4 py-2 input input-primary bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-8 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300 border ">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                            >
                              #
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              ID
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Nombre
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Comuna
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Rol
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Editar
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Eliminar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredUsers
                            .slice(indexOfFirstUser, indexOfLastUser)
                            .map((user, index) => (
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
                                  {user.comuna}
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {user.role.name}
                                </td>

                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/administrador/editarUsuario?id=${user.id}`
                                      )
                                    }
                                  >
                                    <PencilIcon
                                      className="h-6 w-6"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  <button
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <TrashIcon
                                      className="h-6 w-6 text-red-500 hover:text-red-700"
                                      aria-hidden="true"
                                    />
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
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
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
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                  <h3 className="text-lg font-semibold mb-4">
                    ¿Estás seguro de eliminar este usuario?
                  </h3>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="btn btn-ghost"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="btn btn-error text-white"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
                
              </>
            ) : (
              // Tabla de usuarios autenticados
              <EditAuthenticated />
            )}
          </>
        )}
      </div>
    </>
  );
}

interface IUserAut {
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
  tipo: string;
}

export function EditAuthenticated() {
  const { user, GetRole } = useUserStore();

  const [data, setData] = useState<IUserAut[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga agregado
  const usersPerPage = 10;

  const getData = async () => {
  setIsLoading(true); // Activar loading al iniciar
    if (user?.establishment?.name) {
      try {
        const response = await api_getAllUsersAutByEstablishment({
          establishment: user.establishment.name,
          page: currentPage,
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar los usuarios");
      } finally {
        setIsLoading(false); // Desactivar loading al finalizar
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id !== 0 && GetRole() === "admin") {
      getData();
    }
  }, [user, currentPage]);

  //estados para el eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  //funcion para eliminar
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      await api_updateUser(selectedUserId, { eliminado: true });
      toast.success("Usuario eliminado con éxito");
      await getData();
    } catch (error) {
      toast.error("Error al eliminar el usuario");
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setSelectedUserId(null);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(data.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = data.filter(
    (user) =>
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <p className="text-center mt-4">Cargando usuarios autenticados...</p>;
  }

  if (GetRole() !== "admin") {
    return <WarningAlert message="No tienes permisos para ver esta página" />;
  }

  return (
    <>
      {data.length !== 0 ? (
        <>
          {!data ? (
            <WarningAlert message="No se han encontrado usuarios" />
          ) : (
            <>
              <div className="mt-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo o rol"
                    className="w-full md:w-96 pl-10 pr-4 py-2 input input-primary bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300 border ">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            #
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            ID
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Nombre
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Comuna
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            tipo
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Editar
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Eliminar
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredUsers
                          .slice(indexOfFirstUser, indexOfLastUser)
                          .map((user, index) => (
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
                                {user.comuna}
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {user.tipo}
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/administrador/editarUsuarioAut?id=${user.id}`
                                    )
                                  }
                                >
                                  <PencilIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </button>
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                <button
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <TrashIcon
                                    className="h-6 w-6 text-red-500 hover:text-red-700"
                                    aria-hidden="true"
                                  />
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
                <span>
                  Página {currentPage} de {totalPages}
                </span>
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
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">
                  ¿Estás seguro de eliminar este usuario?
                </h3>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="btn btn-error text-white"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid md:grid-cols-12 gap-4 p-4">
          <div className="md:col-start-2 md:col-end-13 mx-auto my-auto">
            <WarningAlert message={"Colegio sin usuarios Autenticados"} />
          </div>
        </div>
      )}
    </>
  );
}
