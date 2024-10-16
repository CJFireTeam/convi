import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/layout/Layout";
import { useUserStore } from "../store/userStore";
import Greetings_Authenticated from "../components/greetings/Authenticated";
import { useMenuStore } from "../store/menus.store";
import { useEffect } from "react";
import Grafico from "@/components/encargado/graficos";
import { routeModule } from "next/dist/build/templates/app-page";
import CasesAuthenticated from "../components/authenticated/CasesAuthenticated";
import ModalWhoIS from "../components/authenticated/modalWhoIs";
import ContadorUsuarios from "@/components/administrador/contadorusuarios";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { bearer, setRole, user, isLoading, role } = useUserStore();
  return (
    <>
      {role.name === "Authenticated" && <><Greetings_Authenticated /><CasesAuthenticated /></>}
      {role.name === "Encargado de Convivencia Escolar" && <><Grafico /></>}
      {role.name === "admin" && <><ContadorUsuarios/></>}
    </>
  );
}
