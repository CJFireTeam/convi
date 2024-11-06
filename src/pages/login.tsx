import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import convi from "./convi.jpg";
import { Bounce, toast } from "react-toastify";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import  {useUserStore} from "../store/userStore";
import { Button } from "@/components/ui/button"
import { Input } from "../components/ui/input";
import '../styles/login.module.css'
export default function Login() {
  const router = useRouter();
  const {setUser,setBearer} = useUserStore()

  const [isVisible, setIsVisible] = useState(true);
  const [error,setError] = useState(false);
  useEffect(() => {
    if (router.query.verify) {
      toast.success("Su cuenta fue verificada correctamente", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  }, [router.query]);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const id = toast.loading("Entrando al sistema...");
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const resp = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "auth/local",
        {
          identifier: data.get("email"),
          password: data.get("password"),
        }
      );
      toast.update(id, {
        render: "Entrando al sistema...",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
      Cookies.set("bearer", resp.data.jwt);
      setBearer(resp.data.jwt)
      setUser(resp.data.user)
      setIsVisible(false);
      setTimeout(() => {
        router.push({ pathname: "/" });
      }, 500);
    } catch (error) {
      setError(true)
      if (error instanceof AxiosError) {
        if (error.response) {
          if (error.response.data.error.message)
            if (error.response.data.error.message === "Your account has been blocked by an administrator") toast.update(id, {
              render: "Tu cuenta se encuentra bloqueada, Contatate con un Administrador.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
        }
      }
      if (error instanceof AxiosError) {
        if (error.response) {
          if (error.response.data.error.message)
            if (error.response.data.error.message === "Your account email is not confirmed") toast.update(id, {
              render: "Aún no has confirmado tu correo electrónico, Revisa tu correo electronico.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
        }
      }
      if (error instanceof AxiosError) {
        if (error.response) {
          if (error.response.data.error.message)
            if (error.response.data.error.message === "Invalid identifier or password") toast.update(id, {
              render: "Correo o contraseña invalidas.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
        }
      }
      setTimeout(() => {
        setError(false)
      }, 1500);
      console.log(error);
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setIsVisible(true);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  const register = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.push({ pathname: "/register" });
    }, 500);
  };
  const recover = () => {
    router.push({ pathname: "/recover" });
  };
  return (
    <>
      <div
        className={`flex min-h-full h-dvh	 bg-white flex-1 flex-col justify-center px-6 py-12 lg:px-8 transition-transform ${
          isVisible ? "animate-fadein" : "animate-fadeout"
        }`}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            className=" dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
            src={convi}
            alt="Convi"
            priority
          />

        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm ">
          <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Correo electronico
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 font-semibold  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-info sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Contraseña
                </label>
                <div className="text-sm">
                <Button type="button" onClick={recover} variant="link" className="font-semibold">Olvide mi contraseña</Button>
                  
                </div>
              </div>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-info sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
            <Button className="flex w-full justify-center">
            {error && (<ExclamationTriangleIcon className="w-6 text-white" aria-hidden="true" />)}
            Conectar</Button>

              {/* <button
                type="submit"
                className={`flex w-full justify-center rounded-md ${error ? `bg-primary` : `bg-primary hover:bg-accent`} px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              >
              {error && (<ExclamationTriangleIcon className="w-6 text-white" aria-hidden="true" />)}
                Conectar
              </button> */}
            </div>
          </form>
          <div className="flex justify-center m-1">
            <button
              onClick={register}
              className="font-semibold hover:text-secondary"
            >
              Registrate
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
