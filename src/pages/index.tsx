import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/layout/Layout";
import { useUserStore } from "../store/userStore";
import CasesAuthenticated from "../components/CasesAuthenticated";
import Greetings_Authenticated from "../components/greetings/Authenticated";
import { useMenuStore } from "../store/menus.store";
import { useEffect } from "react";
import Grafico from "@/components/encargado/graficos";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { bearer, setRole, GetRole, user, isLoading } = useUserStore();
  return (
    <>
      {GetRole() === "Authenticated" && <><Greetings_Authenticated /><CasesAuthenticated /></>}
      {GetRole() === "Encargado de Convivencia Escolar" && <><Grafico/></>}

    </>
  );
}
