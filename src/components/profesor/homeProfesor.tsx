import { useMenuStore } from "@/store/menus.store";
import { useUserStore } from "@/store/userStore";
import { UsersIcon } from "@heroicons/react/24/outline";
import {
  GraduationCap,
  AlertTriangle,
  FileText,
  ClipboardList,
  FolderOpen,
  Headphones,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/router";

export default function HomeProfesor() {
  const { user, role } = useUserStore();
  const router = useRouter();
  const { setActive } = useMenuStore();

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const fullName = capitalizeWords(`${user.firstname} ${user.first_lastname}`);

  function redirect(url: string) {
    setActive(url);
    return router.push(url);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Bienvenid@ de vuelta!
            </h1>
            {role.name === "Profesor" ? (
              <p className="text-xl text-gray-600">
                Profesor{" "}
                <span className="font-semibold text-indigo-600">
                  {fullName}
                </span>
              </p>
            ) : (
              <p className="text-xl">
                <span className="font-semibold text-indigo-600">
                  {fullName}
                </span>
              </p>
            )}
            <p className="text-gray-500 mt-2">
              Estamos listos para comenzar un nuevo día.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              role.name === "Profesor" ? "lg:grid-cols-4" : "lg:grid-cols-5"
            } gap-4`}
          >
            {role.name === "Profesor" ? (
              <>
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/casos/denuncia")}
                >
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Denuncia</h3>
                  <p className="text-sm opacity-90">Reportar incidentes</p>
                </div>

                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/casos")}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Lista de Casos</h3>
                  <p className="text-sm opacity-90">Ver casos activos</p>
                </div>

                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/encuestas")}
                >
                  <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Encuestas</h3>
                  <p className="text-sm opacity-90">Gestionar encuestas</p>
                </div>

                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/documentos")}
                >
                  <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Documentos</h3>
                  <p className="text-sm opacity-90">Archivos y recursos</p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/te_escuchamos")}
                >
                  <UsersIcon className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Te Escuchamos</h3>
                  <p className="text-sm opacity-90">Comunicar situaciones</p>
                </div>

                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/casos_autenticados")}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Casos</h3>
                  <p className="text-sm opacity-90">Gestionar tus casos</p>
                </div>

                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/sugerencia")}
                >
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Consulta y Sugerencia</h3>
                  <p className="text-sm opacity-90">Realizar consultas</p>
                </div>

                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/encuestas")}
                >
                  <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Encuestas</h3>
                  <p className="text-sm opacity-90">Responder encuestas</p>
                </div>

                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => redirect("/documentos")}
                >
                  <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Documentos</h3>
                  <p className="text-sm opacity-90">Archivos y recursos</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tarjeta de estadísticas rápidas si llegase a ser necesario*/}
        {/* <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Resumen del día
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-gray-500">Denuncias nuevas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-gray-500">Casos activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-sm text-gray-500">Encuestas pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">28</div>
              <div className="text-sm text-gray-500">Documentos</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
