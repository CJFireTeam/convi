import { api_GetUsersAlumnosEstablishment, api_GetUsersApoderadosEstablishment, api_getUsersEncargadoEstablishment, api_getUsersProfeEstablishment } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";

interface UserCounts {
  profesor: number;
  encargado: number;
  apoderado: number;
  alumno: number;
  total: number;
}

export default function ContadorUsuarios() {
  const { user } = useUserStore();
  const [userCounts, setUserCounts] = useState<UserCounts>({
    profesor: 0,
    encargado: 0,
    apoderado: 0,
    alumno: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true); // Add a loading state variable

  const getUsersByEstablishment = async () => {
    try {
      setLoading(true); // Set loading to true when fetching data
      const responses = await api_getUsersProfeEstablishment(user.establishment.id);
      const data = await api_getUsersEncargadoEstablishment(user.establishment.id);
      const data2 = await api_GetUsersApoderadosEstablishment(user.establishment.id);
      const data3 = await api_GetUsersAlumnosEstablishment(user.establishment.id);

      const profesorCount = responses.data.length;
      const encargadoCount = data.data.length;
      const apoderadoCount = data2.data.length;
      const alumnoCount = data3.data.length;
      const Total = profesorCount + encargadoCount + apoderadoCount + alumnoCount;
      setUserCounts({
        profesor: profesorCount,
        encargado: encargadoCount,
        apoderado: apoderadoCount,
        alumno: alumnoCount,
        total: Total,
      });
      setLoading(false); // Set loading to false when data is fetched
    } catch (error) {
      console.error("Error fetching establishment data:", error);
      setLoading(false); // Set loading to false on error
    }
  };

  useEffect(() => {
    getUsersByEstablishment();
  }, [user.establishment.id]);

  return (
    <div className="grid grid-cols-3 gap-4 border rounded-lg shadow-md p-4">
      <div className="col-span-3 text-center">
        <span className="font-semibold text-2xl">
          Bienvenido administrador {user.firstname + " " + user.first_lastname}
        </span>
        <br />
        <span className="font-semibold text-2xl">
          Estos son los datos de : {user.establishment.name}
        </span>
      </div>

      <div className="col-span-3">
        {loading ? ( // Show loading indicator while data is being fetched
          <div className="flex justify-center">
            <svg
              className="animate-spin h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12H4zm2 5.291A7.962 7.962 0 014 19.708a7.962 7.962 0 0114.708 0 1.992 1.992 0 012.121.691z"
              />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-indigo-200 p-4 rounded-lg">
              <h3 className="font-semibold">Encargados de Convivencia</h3>
              <p className="text-2xl">{userCounts.encargado}</p>
            </div>
            <div className="bg-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold">Profesores</h3>
              <p className="text-2xl">{userCounts.profesor}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold">Alumnos</h3>
              <p className="text-2xl">{userCounts.alumno}</p>
            </div>
            <div className="bg-sky-100 p-4 rounded-lg">
              <h3 className="font-semibold">Apoderados</h3>
              <p className="text-2xl">{userCounts.apoderado}</p>
            </div>
            
            <div className="bg-green-200 p-4 rounded-lg">
              <h3 className="font-semibold">Total</h3>
              <p className="text-2xl">{userCounts.total}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}