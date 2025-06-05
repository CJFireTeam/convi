// pages/sugerencia.tsx - Modificado
import React, { useState, useEffect } from "react";
import InicioEncargado from "@/components/ConsultaYSugerencia/InicioEncargado";
import { useUserStore } from "@/store/userStore";
import Head from "next/head";
import InicioUsuario from "@/components/ConsultaYSugerencia/InicioUsuario";

export default function Sugerencia() {
  const { role } = useUserStore();

  return (
    <>
      <Head>
        <title>Consulta y Sugerencia</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      {/* Vista para Encargado de Convivencia */}
      {role.name === "Encargado de Convivencia Escolar" ? (
        <InicioEncargado />
      ) : (
        // Vista para usuarios regulares
        <InicioUsuario />
      )}
    </>
  );
}