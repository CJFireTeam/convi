import { api_getUsersEstablishment } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";

/* interface UserCounts {
  apoderado: number;
  alumnos: number;
  otros: number;
} */

export default function ContadorUsuarios() {
  const { user } = useUserStore();
  /* const [userCounts, setUserCounts] = useState<UserCounts>({
    apoderado: 0,
    alumnos: 0,
    otros: 0,
  }); */

  const getUserByEstablishment = async () => {
    const response = await api_getUsersEstablishment(user.establishment.id);
    console.log(response);
    /* try {
      const users = response.data.data[0].attributes.users.data;
      
      const counts = users.reduce((acc: UserCounts, user: any) => {
        const tipo = user.attributes.tipo?.toLowerCase();
        
        if (tipo === 'apoderado') {
          acc.apoderado++;
        } else if (tipo === 'alumno') {
          acc.alumnos++;
        } else {
          acc.otros++;
        }
        return acc;
      }, { apoderado: 0, alumnos: 0, otros: 0 });

      console.log("Final counts:", counts); // Debug log
      setUserCounts(counts);
    } catch (error) {
      console.error("Error fetching establishment data:", error);
    } */
  };

  useEffect(() => {
    getUserByEstablishment();
  }, [user.establishment.id]);

  return (
    <div className="grid grid-cols-3 gap-4 border rounded-lg shadow-md p-4">
      <div className="col-span-3 text-center">
        <span className="font-semibold text-2xl">
          Bienvenido administrador {user.firstname + " " + user.first_lastname}
        </span>
      </div>

      {/* <div className="col-span-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold">Apoderados</h3>
            <p className="text-2xl">{userCounts.apoderado}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold">Alumnos</h3>
            <p className="text-2xl">{userCounts.alumnos}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold">Otros</h3>
            <p className="text-2xl">{userCounts.otros}</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}