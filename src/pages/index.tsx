import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/layout/Layout";
import { useUserStore } from "../store/userStore";
import CasesAuthenticated from "../components/CasesAuthenticated";
import Greetings_Authenticated from "../components/greetings/Authenticated";
import { useMenuStore } from "../store/menus.store";
import { useEffect } from "react";
import Grafico from "@/components/encargado/graficos";
import { routeModule } from "next/dist/build/templates/app-page";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { bearer, setRole, user, isLoading, role } = useUserStore();
  return (
    <>
      {role.name === "Authenticated" && <><Greetings_Authenticated /><CasesAuthenticated /></>}
      {role.name === "Encargado de Convivencia Escolar" && <><Grafico /></>}
    </>
  );
}
