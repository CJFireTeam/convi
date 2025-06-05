import CasesAuthenticated from "@/components/authenticated/CasesAuthenticated";
import Greetings_Authenticated from "@/components/greetings/Authenticated";
import { useUserStore } from "@/store/userStore";
import Head from "next/head";


export default function CasosAutenticados() {
  const { bearer, setRole, user, isLoading, role } = useUserStore();
  return (
    <>
      <Head>
        <title>Casos</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {role.name === "Authenticated" && <><Greetings_Authenticated /><CasesAuthenticated /></>}
    </>
  );
}
