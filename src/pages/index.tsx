import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/layout/Layout";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
    <div className="px-4 py-3 sm:px-6">
      <h6 className="font-bold md:text-lg text-sm">
        En construcción
      </h6>
    </div>

  </div>
    
  );
}
