import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LoaderProvider } from "@/context/loader";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const excludedPaths = ['/login', '/register', '/recover']; // Agrega aquí las rutas que quieres excluir

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isExcludedPath = excludedPaths.includes(router.pathname);

  return (
    <LoaderProvider>
      <ToastContainer />
      {!isExcludedPath ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
          <Component {...pageProps} />
      )}
      </LoaderProvider>
  );
}
