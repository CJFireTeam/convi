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
import { api_getQuestionsByForm, api_getQuestionsCompleted, api_getQuestionsNotCompleted, api_postQuestions, api_postSurveys, api_getOneSurvey, api_getQuestionResponses } from "@/services/axios.services";
registerLocale("es", es);
import { useUserStore } from "../../store/userStore";
import { assignFormUsers } from "../../services/local.services";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ArcElement
} from "chart.js";


// Registrar los elementos necesarios de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  
);


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
  id: number;
}


interface IResponses {
  id: number;
  attributes: {
    response: string | string[];
    userform: {
      data: {
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
    }
  }
}

export default function Visualizar() {
  const { user, GetRole } = useUserStore();
  const router = useRouter();
  const checkAuthorization = () => {
    const role = GetRole();
    if (role !== "Profesor" && role !== "Encargado de Convivencia Escolar") {
      router.back();
    }
  };
  useEffect(() => {
    checkAuthorization();
  }, [user]);

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
  const [dataQuestionResponses, setDataQuestionResponses] = useState<IResponses[]>([]);
  const getQuestionResponses = async (questionId: number) => {
    try {
      const response = await api_getQuestionResponses({ questionId });
      setDataQuestionResponses(response.data.data);
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


  // Función para calcular el porcentaje de respuestas y contar usuarios
  const calculateResponseCounts = () => {
    const counts = new Array(5).fill(0); // Array para contar respuestas del 1 al 5
    const userCounts = new Array(5).fill(0); // Array para contar la cantidad de usuarios por calificación

    // Contamos las respuestas en el rango 1 a 5
    dataQuestionResponses.forEach(response => {
      const rating = Number(response.attributes.response);
      if (rating >= 1 && rating <= 5) {
        counts[rating - 1] += 1; // Incrementa el contador para esa calificación
        userCounts[rating - 1] += 1; // Incrementa el conteo de usuarios para esa calificación
      }
    });

    // Convertir conteos a porcentajes
    const totalResponses = dataQuestionResponses.length;
    const percentages = counts.map(count => (totalResponses > 0 ? (count / totalResponses) * 100 : 0)); // Devuelve porcentajes

    return { percentages, userCounts }; // Devuelve porcentajes y conteos de usuarios
  };

  const calculateAverage = () => {
    if (dataQuestionResponses.length === 0) return 0;

    const total = dataQuestionResponses.reduce((acc, curr) => {
      return acc + Number(curr.attributes.response);
    }, 0);

    return (total / dataQuestionResponses.length).toFixed(2); // Redondea el promedio a 2 decimales
  };

  const { percentages: responseCounts, userCounts } = calculateResponseCounts(); // Obtener porcentajes y conteos de usuarios
  const average = calculateAverage(); // Obtener el promedio

  const barChartData = {
    labels: ["1", "2", "3", "4", "5"], // Calificaciones
    datasets: [
      {
        label: `Calificación (Promedio: ${average})`, // Mostrar promedio en el título
        data: responseCounts, // Usa los porcentajes calculados
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Máximo en porcentaje
        ticks: {
          stepSize: 10, // Incrementos de 10%
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'bar'>) => { // Especificar el tipo aquí
            const index = tooltipItem.dataIndex;
            return `Total voto: ${userCounts[index]}`; // Mostrar la cantidad de personas
          },
        },
      },
    },
  };

  const calculateOptionCounts = (questionId: number) => {
    const optionCounts: { [key: string]: number } = {};

    // Contar respuestas de la pregunta específica
    dataQuestionResponses.forEach(response => {
      const responseOption = response.attributes.response; // Suponiendo que esto tiene el ID de la opción seleccionada
      if (Array.isArray(responseOption)) {
        // Si es un array, cuenta cada opción en el array
        responseOption.forEach(option => {
          optionCounts[option] = (optionCounts[option] || 0) + 1;
        });
      } else if (typeof responseOption === 'string') {
        // Si es un string, cuenta esa opción
        optionCounts[responseOption] = (optionCounts[responseOption] || 0) + 1;
      }
    });

    return optionCounts;
  };

  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);
  const toggleAccordion = (index: number) => {
    setOpenAccordionIndex(prevIndex => prevIndex === index ? null : index);
  };
  if (GetRole() === "Profesor" || GetRole() === "Encargado de Convivencia Escolar") {}
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
              <span className="font-semibold text-lg">Descripción: </span>
              {dataSurvey?.attributes.Descripcion}
            </p>
          </div>
          <div className="grid md:grid-cols-2">
            {dataSurvey?.attributes.formulario_pregutas?.data.map(
              (p, index) => (
                <div key={index} className="mx-2 my-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-primary w-full"
                    title="Haz click para más detalle"
                    onClick={() => { setModalOpen(index); getQuestionResponses(p.id); }}
                  >
                    {p.attributes.Titulo}
                  </button>

                  <Modal
                    open={modalOpen === index}
                    className="w-full bg-white"
                  >
                    <Modal.Header className="text-center flex flex-col">
                      <span className="font-semibold">Detalles de la Pregunta: </span>
                      <span>{p.attributes.Titulo}</span>
                    </Modal.Header>
                    <Modal.Body className="text-left">
                      {p.attributes.Tipo === "qualification" && (<>
                        <div className="flex flex-col p-4">
                          <h3 className="font-semibold">Promedio de la calificación: {average}</h3>
                          <Bar data={barChartData} options={barChartOptions} />
                        </div>
                      </>)}

                      {p.attributes.Tipo === "option" && (
                        <>
                          {(() => {
                            const optionCounts = calculateOptionCounts(p.id); // Calcula los conteos de opciones
                            const labels = Object.keys(optionCounts);
                            const data = Object.values(optionCounts);
                            const totalResponses = data.reduce((sum, count) => sum + count, 0);

                            const percentages = data.map(count => ((count / totalResponses) * 100).toFixed(2)); // Calcula porcentajes

                            const pieChartData = {
                              labels: labels.map((label, index) => `${label} (${percentages[index]}%)`), // Muestra porcentaje en las etiquetas
                              datasets: [{
                                data: data,
                                backgroundColor: labels.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`), // Colores aleatorios
                              }],
                            };

                            return (
                              <div className="flex flex-col p-6">
                                <h3 className="font-semibold text-center mb-2">Distribución de opciones:</h3>
                                <Doughnut data={pieChartData} options={{ plugins: { legend: { position: "bottom" } } }} />
                              </div>
                            );
                          })()}
                        </>
                      )}

                      {p.attributes.Tipo === "text" && (<>
                        {dataQuestionResponses.map((u, idx) => (
                          <div className="flex flex-col w-full" key={idx}>
                            <div className="w-full max-w-md mx-auto mt-1">
                              <div
                                onClick={() => toggleAccordion(idx)}
                                className="cursor-pointer border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 p-2 grid grid-cols-2 "
                              >
                                <h3 className="text-md font-semibold">
                                  <span >Nombre: {u.attributes.userform.data.attributes.user.data.attributes.firstname + " " + u.attributes.userform.data.attributes.user.data.attributes.first_lastname}</span>
                                </h3>
                                <h3 className="text-md font-semibold">
                                <span>Correo: {u.attributes.userform.data.attributes.user.data.attributes.email}</span>
                                </h3>
                              </div>

                              {openAccordionIndex === idx && (
                                <div className="border border-t-0 border-gray-300 p-4 rounded-b-md bg-gray-50">
                                  <p>{u.attributes.response}</p>
                                </div>
                              )}
                            </div>

                          </div>
                        ))}
                      </>)}
                      {p.attributes.Tipo === "multipleChoice" && dataQuestionResponses && (
                        <>
                          {dataQuestionResponses.map((u, idx) => (
                            <div className="flex flex-col rounded-md m-2 border p-4 shadow-md hover:border-primary hover:border-2" key={idx}>
                              <span>Nombre: {u.attributes.userform.data.attributes.user.data.attributes.firstname + " " + u.attributes.userform.data.attributes.user.data.attributes.first_lastname}</span>
                              <span>Correo: {u.attributes.userform.data.attributes.user.data.attributes.email}</span>
                              <span>
                                {Array.isArray(u.attributes.response) ? (
                                  u.attributes.response.length > 1 ?
                                    u.attributes.response[0] + ", " + u.attributes.response.slice(1).join(', ') :
                                    u.attributes.response[0]
                                ) : (
                                  u.attributes.response
                                )}
                              </span>
                            </div>
                          ))}
                        </>
                      )}

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
