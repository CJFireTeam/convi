import Image from "next/image";
import convi from "./convi.jpg";
import { useRouter } from "next/router";
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {recoverSchema} from "@/validations/recoverSchema";
import { recoverPasswordSchema } from "@/validations/recoverSchema";
import axios, { AxiosError } from "axios";
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from "react-toastify";


type Inputs = {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}


function RecoverPassword({ code }: { code: string | null }) {
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
      toast.success('Hemos enviado un correo electrónico a la dirección proporcionada. Si no encuentras el correo electrónico en tu bandeja de entrada, asegúrate de verificar también la carpeta de spam o correo no deseado.');
    } catch (error) {
      toast.error('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
    }
  };
  if (code) return <></>

  return (<div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" 
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Ingresa tu correo electrónico
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="convi@ejemplo.cl"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
              {errors.email?.message && (<p className="text-error text-sm mt-1">{errors.email.message}</p>)}
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
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Recuperar contraseña
            </button>
          </div>
        </form>
      </div>)
}

function ChangePassword({ code }: { code: string | null }){
  const router = useRouter();

  const onSubmit = async (data: Inputs) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}auth/reset-password`, {
        code,
        password: data.newPassword,
        passwordConfirmation: data.confirmNewPassword,
      });
      toast.success('¡Contraseña cambiada con éxito!');
      router.push('/login');
    } catch (error) {
      toast.error('Ocurrió un error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const {register, handleSubmit, formState: {errors} } = useForm<Inputs>({
    resolver: zodResolver(recoverPasswordSchema),
  });
  const login = () => {
    router.push({ pathname: "/login" });
  };

  if (!code) return <></>

  return (<div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
  <form className="space-y-6" 
    noValidate
    onSubmit={handleSubmit(onSubmit)}
  >
    <div>
      <label
        htmlFor="newPassword"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Ingrese su nueva contraseña
      </label>
      <div className="mt-2">
        <input
          id="newPassword"
          type="password"
          autoComplete="newPassword"
          {...register('newPassword')}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
        />
        {errors.newPassword?.message && (<p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>)}
      </div>
    </div>
    <div>
      <label
        htmlFor="confirmNewPassword"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Confirma tu nueva contraseña
      </label>
      <div className="mt-2">
        <input
          id="confirmNewPassword"
          type="password"
          autoComplete="confirmNewPassword"
          {...register('confirmNewPassword')}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
        />
        
        {errors.confirmNewPassword?.message && (<p className="text-red-600 text-sm mt-1">{errors.confirmNewPassword.message}</p>)}
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
        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Cambiar contraseña
      </button>
    </div>
  </form>
</div>
)

}

export default function Recover() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');


  return (
    <div className="h-dvh	 bg-white flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 transition-transform">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          className="dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src={convi}
          alt="Convi"
          priority
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Recuperar Contraseña
        </h2>
      </div>
      <RecoverPassword code={code} />
      <ChangePassword code={code} />
    </div>
  );
}
