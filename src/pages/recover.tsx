import Image from "next/image";
import convi from "./convi.jpg";
import { useRouter } from "next/router";
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {recoverSchema} from "@/validations/recoverSchema";
import axios, { AxiosError } from "axios";

type Inputs = {
  email: string;
}

export default function Recover() {
  const router = useRouter();

  const login = () => {
    router.push({ pathname: "/login" });
  };

  const {register, handleSubmit, formState: {errors} } = useForm<Inputs>({
    resolver: zodResolver(recoverSchema),
  });

  const onSubmit = async (data: Inputs) => {
    try {
      const resp = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "auth/forgot-password",
        data
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 transition-transform">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          className="dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src={convi}
          alt="Convi"
          priority
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          ¿Olvidaste tu contraseña?
        </h2>
      </div>

      <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" 
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Correo electrónico
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.email?.message && (<p className="text-red-600 text-sm mt-1">{errors.email.message}</p>)}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={login}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Recuperar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
