import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/layout/Layout";
import { useUserStore } from "../store/userStore";
import CasesAuthenticated from "../components/CasesAuthenticated";
import Greetings_Authenticated from "../components/greetings/Authenticated";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { bearer, setRole, GetRole, user, isLoading } = useUserStore();
  return (
    <>
      {GetRole() === "Authenticated" && <><Greetings_Authenticated/><CasesAuthenticated /></>}
      {GetRole() !== "Authenticated" && (
          <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-3 sm:px-6">
          <h6 className="font-bold md:text-lg text-sm">En construcción</h6>
        </div>
    </div>
      )}
    </>
  );
}
