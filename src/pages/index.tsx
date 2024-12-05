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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "lucide-react";

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
      <div className="flex flex-row  mx-4 space-x-2">
        <Card className="flex-1 ">
          <CardHeader>
            <CardTitle>
              <Alert>
                <User className="h-4 w-4" />
                <AlertTitle>Ver establecimientos</AlertTitle>
                <AlertDescription>
                  {user.firstname} {user.first_lastname}
                </AlertDescription>
              </Alert>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              <Alert>
                <User className="h-4 w-4" />
                <AlertTitle>Crear Establecimientos</AlertTitle>
                <AlertDescription>
                  {user.firstname} {user.first_lastname}
                </AlertDescription>
              </Alert>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      }
    </>
  );
}
