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
import Head from "next/head";
import VerEstablecimientos from "@/components/root/verestablecimiento";
import CrearEstablecimientos from "@/components/root/crearestablecimientos";
import VerAdministradores from "@/components/root/veradmin";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { bearer, setRole, user, isLoading, role } = useUserStore();
  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {role.name === "Authenticated" && <><Greetings_Authenticated /><CasesAuthenticated /></>}
      {role.name === "Encargado de Convivencia Escolar" && <><Grafico /></>}
      {role.name === "admin" && <div className="h-full">
        <ContadorUsuarios />
      </div>}
      {role.name === "root" &&
        <>
          <div className="grid md:grid-cols-2 gap-2 mx-4">
            <VerEstablecimientos />

            <CrearEstablecimientos/>

            <VerAdministradores/>

            {/* <CrearAdministradores/> */}

          </div>
        </>
      }
    </>
  );
}
