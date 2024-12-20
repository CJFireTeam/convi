import router, { useRouter } from "next/router";
import WarningAlert from "@/components/alerts/warningAlert";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { PencilIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { api_getAllUsersAutByEstablishment, api_getAllUsersOtrosByEstablishment } from "@/services/axios.services";
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
        const response = await api_getAllUsersOtrosByEstablishment({
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

  const [editAut, setEditAut] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = data.filter((user) =>
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
            <h1 className="text-base font-semibold leading-6 text-gray-900">Lista de usuarios</h1>
          </div>
          <div className="my-4 ">
            <button onClick={() => { setEditAut(true) }} className="w-full md:w-auto btn btn-secondary btn-outline md:mr-2">
              Editar Autenticados
            </button>
            <button onClick={redirect} className="w-full md:w-auto btn btn-primary btn-outline mt-4 md:mt-0">
              Crear nuevo usuario
            </button>
          </div>
        </div>
        {isLoading ? (<>
          <p className="text-center mt-4">Cargando usuarios...</p>
        </>
        ) : !editAut ? (
          <>
            {data.length === 0 ? (
              <WarningAlert message="No se han encontrado usuarios" />
            ) : (<>
              <div className="mt-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o correo"
                    className="w-full md:w-96 pl-10 pr-4 py-2 input input-primary bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 absolute left-3 top-2.5 h-5 w-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300 border ">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nombre</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comuna</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rol</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Editar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredUsers.slice(indexOfFirstUser, indexOfLastUser).map((user, index) => (
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
            </>)
            }
          </>
        ) : (
          <>
            <EditAuthenticated editAut={setEditAut} dataEdit={editAut} />
          </>
        )
        }
      </div>
    </>
  );
}

interface props {
  editAut: (value: boolean) => void; // Acepta un booleano
  dataEdit: boolean;
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


export function EditAuthenticated(props: props) {
  const { user, GetRole } = useUserStore();

  const [data, setData] = useState<IUserAut[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const getData = async () => {
    if (user?.establishment?.name) {
      try {
        const response = await api_getAllUsersAutByEstablishment({
          establishment: user.establishment.name,
          page: currentPage,
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar los usuarios');
      }
    }
  };

  useEffect(() => {
    if (user?.id !== 0 && GetRole() === "admin") {
      getData();
    }
  }, [user, currentPage, props.dataEdit]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(data.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = data.filter((user) =>
    user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (GetRole() !== "admin") {
    return <WarningAlert message="No tienes permisos para ver esta página" />;
  }

  return (
    <>
      {data.length !== 0 ? (

        <>
          <div className="md:col-start-0 md:col-end-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-primary hover:text-green-700 cursor-pointer" onClick={() => props.editAut(false)}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 absolute left-3 top-2.5 h-5 w-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300 border ">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nombre</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comuna</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">tipo</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Editar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredUsers.slice(indexOfFirstUser, indexOfLastUser).map((user, index) => (
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
                              <button onClick={() => router.push(`/administrador/editarUsuarioAut?id=${user.id}`)}>
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
        </>
      ) : (
        <div className="grid md:grid-cols-12 gap-4 p-4">
          <div className="md:col-start-0 md:col-end-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-primary hover:text-green-700 cursor-pointer" onClick={() => props.editAut(false)}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="md:col-start-2 md:col-end-13 mx-auto my-auto">
            <WarningAlert message={'Colegio sin usuarios Autenticados'} />
          </div>
        </div>
      )}


    </>
  );
}