import { ArrowLeftIcon, PencilIcon, PlusIcon, StarIcon, TrashIcon } from "@heroicons/react/20/solid";
import router, { Router, useRouter } from "next/router";
import { Accordion, Button, Card, Collapse, Input, Modal, Textarea } from "react-daisyui";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { use, useEffect, useRef, useState } from "react";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from "date-fns/locale/es";
import { toast } from "react-toastify";
import { api_getQuestionsByForm, api_getQuestionsCompleted, api_getQuestionsNotCompleted, api_postQuestions, api_postSurveys, api_getOneSurvey } from "@/services/axios.services";
registerLocale("es", es);
import { useUserStore } from "../../store/userStore";
import { assignFormUsers } from "../../services/local.services";
import { Doughnut } from "react-chartjs-2";


interface ISurvey {
  id: number;
  attributes: {
    Descripcion: string;
    FechaFin: string;
    FechaInicio: string;
    Titulo: string;
    formulario_pregutas: {
      data: {
        id: number;
        attributes: {
          Tipo: string;
          Titulo: string;
          opciones: []
        }
      }[]
    }
  }
}

interface IUserFormCompleted {
  attributes: {
    user: {
      data: {
        attributes: {
          firstname: string;
          first_lastname: string;
          email: string;
        }
        id: number;
      }
    }
  }
  id: number;

}


export default function Visualizar() {
  const { user, GetRole } = useUserStore();
  const router = useRouter();

  const [idSurvey, setIdSurvey] = useState<string | null>(null);
  const [countQuestions, setCountQuestions] = useState(0);
  const [countQuestions2, setCountQuestions2] = useState(0);
  const [modalOpen, setModalOpen] = useState<number | null>(null); // Estado para controlar modales

  const [dataUserForm, setDataUserForm] = useState<IUserFormCompleted[]>([]);

  const getData = async () => {
    try {
      const response = await api_getQuestionsCompleted(Number(idSurvey));
      setCountQuestions(response.data.meta.pagination.total);
      setDataUserForm(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getData2 = async () => {
    try {
      const data = await api_getQuestionsNotCompleted(Number(idSurvey));
      setCountQuestions2(data.data.meta.pagination.total);
      
    } catch (error) {
      console.log(error);
    }
  };

  const [dataSurvey, setDataSurvey] = useState<ISurvey>();
  const getSurvey = async () => {
    try {
      const response = await api_getOneSurvey({ surveyId: Number(idSurvey) });
      setDataSurvey(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (Number(idSurvey) != 0) {
      getData();
      getData2();
      getSurvey();
    }
  }, [idSurvey]);

  useEffect(() => {
    const id = sessionStorage.getItem("id_survey");
    setIdSurvey(id);
  }, [user]);

  const data = {
    labels: [
      "Respondidos: " + countQuestions,
      "Sin Responder: " + countQuestions2,
    ],
    datasets: [
      {
        label: "N° de personas",
        data: [countQuestions, countQuestions2],
        backgroundColor: ["rgba(60, 179, 113,0.4)", "rgba(255, 0, 0, 0.4)"],
        borderColor: ["rgba(60, 179, 113, 1)", "rgba(255, 0, 0, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mx-auto shadow-md rounded-md border p-4">
        <div className="md:col-start-1 md:col-end-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-10 text-primary cursor-pointer"
            onClick={() => router.back()}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <div className="md:col-start-2 md:col-end-5 text-center">
          <Card>
            <Card.Body className="items-center text-center p-4">
              <label className="label-text font-bold text-xl">
                Realización total del cuestionario
              </label>
              <Doughnut data={data} options={options} />
            </Card.Body>
          </Card>
        </div>
        <div className="md:col-start-5 md:col-end-13">
          <div className="text-center">
            <p className="font-bold text-lg">{dataSurvey?.attributes.Titulo}</p>
            <p>
              <span className="font-semibold text-lg">Descripcion: </span>
              {dataSurvey?.attributes.Descripcion}
            </p>
          </div>
          <div className="grid grid-cols-2">
            {dataSurvey?.attributes.formulario_pregutas?.data.map(
              (p, index) => (
                <div key={index} className="mx-2 my-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-primary w-full"
                    title="Haz click para más detalle"
                    onClick={() => setModalOpen(index)}
                  >
                    {p.attributes.Titulo}
                  </button>

                  <Modal
                    open={modalOpen === index}
                    className="w-full bg-white"
                  >
                    <Modal.Header className="text-center">
                      <span className="font-semibold">Detalles de la Pregunta: </span>{p.attributes.Titulo}
                    </Modal.Header>
                    <Modal.Body className="text-left">
                      {dataUserForm.map((u, idx) => (
                        <div className="flex flex-col border border-black rounded-md m-2 p-4" key={idx}>
                          <span>Nombre: {u.attributes.user.data.attributes.firstname + " " + u.attributes.user.data.attributes.first_lastname }</span>
                          <span>Correo: {u.attributes.user.data.attributes.email}</span>
                        </div>
                      ))}
                    </Modal.Body>
                    <Modal.Actions>
                      <Button onClick={() => setModalOpen(null)}>
                        Cerrar
                      </Button>
                    </Modal.Actions>
                  </Modal>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
