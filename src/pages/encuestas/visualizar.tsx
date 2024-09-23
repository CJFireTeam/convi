import { ArrowLeftIcon, PencilIcon, PlusIcon, StarIcon, TrashIcon } from "@heroicons/react/20/solid";
import router, { Router, useRouter } from "next/router";
import { Button, Input, Textarea } from "react-daisyui";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from "date-fns/locale/es";
import { toast } from "react-toastify";
import { api_postQuestions, api_postSurveys, api_survey } from "@/services/axios.services";
registerLocale("es", es);
import { useUserStore } from "../../store/userStore";
import { assignFormUsers } from "../../services/local.services";


export default function Visualizar() {
  const { user, GetRole } = useUserStore();
  const router = useRouter();
 
  const [idSurvey, setIdSurvey] = useState<string | null>(null)

  const getData = async () => {
    try {
      const response = await api_survey({
        surveyId: Number(idSurvey)
      });
      console.log("Este es el dato del survey:", response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(()=> {
    console.log("el id es :",  idSurvey)
    getData();
  },[idSurvey])

  useEffect(()=> {
        const id = sessionStorage.getItem("id_survey");
        setIdSurvey(id)
  },[user])

  return (
    <>  
      <h1>Holi </h1>
       
    </>
  );
}
