import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LoaderProvider } from "@/context/loader";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isLoginPage = router.pathname === "/login";
  return (
    <LoaderProvider>
      {!isLoginPage ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
          <Component {...pageProps} />
      )}
      </LoaderProvider>
  );
}
