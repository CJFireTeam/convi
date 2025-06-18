import React, { useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { api_casesByFase } from "../../services/axios.services";
import GraficoFases from "./graficoFases";
import { useRouter } from "next/router";
import { useMenuStore } from "@/store/menus.store";
import {
  GraduationCap,
  AlertTriangle,
  FileText,
  ClipboardList,
  FolderOpen,
  Headphones,
  MessageCircle,
  Settings,
} from "lucide-react";

export default function HomeEncargado() {
  const { user, GetRole, role } = useUserStore();
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

  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);

  const updateCounts = (fase: number, count: number) => {
    setCounts((prevCounts) => {
      const newCounts = [...prevCounts];
      newCounts[fase - 1] = count;
      return newCounts;
    });
  };

  const dataFaseByNumber = async (fase: number) => {
    let assigned: number | undefined = undefined;
    if (GetRole() !== "Authenticated") {
      assigned = user?.id;
    }
    const data = await api_casesByFase({
      createdBy: user?.id,
      userId: assigned,
      fase: fase,
    });
    updateCounts(fase, data.data.meta.pagination.total);
  };

  useEffect(() => {
    if (user?.id === 0) return;
    dataFaseByNumber(1);
    dataFaseByNumber(2);
    dataFaseByNumber(3);
    dataFaseByNumber(4);
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 animate-fadein">
      <div className="max-w-6xl mx-auto">
        {/* Tarjeta principal de bienvenida */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Bienvenid@ de vuelta!
            </h1>
            <p className="text-xl text-gray-600">
              Encargad@{" "}
              <span className="font-semibold text-indigo-600">{fullName}</span>
            </p>
            <p className="text-gray-500 mt-2">
              Estamos listos para comenzar un nuevo día.
            </p>
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center"
              onClick={() => redirect("/casos")}
            >
              <FileText className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Casos</h3>
              <p className="text-sm opacity-90">Gestionar casos</p>
            </div>

            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center"
              onClick={() => redirect("/configuracion")}
            >
              <Settings className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Configuración</h3>
              <p className="text-sm opacity-90">Ajustes del sistema</p>
            </div>

            <div
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center"
              onClick={() => redirect("/sugerencia")}
            >
              <MessageCircle className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Consulta</h3>
              <p className="text-sm opacity-90">y Sugerencia</p>
            </div>

            <div
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center"
              onClick={() => redirect("/encuestas")}
            >
              <ClipboardList className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Encuestas</h3>
              <p className="text-sm opacity-90">Gestionar encuestas</p>
            </div>

            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center"
              onClick={() => redirect("/documentos")}
            >
              <FolderOpen className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Documentos</h3>
              <p className="text-sm opacity-90">Archivos y recursos</p>
            </div>
          </div>

          {/* Gráfico integrado */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Denuncias por Ciclos
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <GraficoFases dataNumbers={counts} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
