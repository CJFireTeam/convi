import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/router"; // Importa useRouter
import {
  api_getEstablishmentCoursesSinPag,
  api_getUsersEstablishment,
  api_postSendMeeting,
} from "@/services/axios.services";
import { Bounce, toast } from "react-toastify";
import Head from "next/head";
import { z } from "zod";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

interface IFormValues {
  CreationDate: Date;
  RoomName: string;
  RoomUrl: string;
  Establishment: number;
  CreatorUser: number;
  establishment_courses?: number[];
  Users_destiny?: number[];
}

interface IUser {
  id: number;
  firstname: string;
  first_lastname: string;
}

interface ICoursesEstablishment {
  attributes: {
    Grade: string;
    Letter: string;
    establishment: {
      data: {
        attributes: {
          name: string;
        };
        id: number;
      };
    };
  };
  id: number;
}

export default function MeetingPage() {
  const [roomName, setRoomName] = useState("");
  const [roomStatus, setRoomStatus] = useState(false);
  const [meetingWindow, setMeetingWindow] = useState<Window | null>(null);
  const { user, GetRole } = useUserStore();
  const [url, setUrl] = useState("");
  const router = useRouter(); // Inicializa el router

  const MeetingSchema = z.object({
    CreationDate: z.date({
      required_error: "Campo requerido",
      invalid_type_error: "Tipo inválido",
    }),
    RoomName: z.string({
      required_error: "Campo requerido",
      invalid_type_error: "Tipo inválido",
    }),
    RoomUrl: z.string({
      required_error: "Campo requerido",
      invalid_type_error: "Tipo inválido",
    }),
    Establishment: z.number({
      required_error: "Campo requerido",
      invalid_type_error: "Tipo invalido",
    }),
    CreatorUser: z.number({
      required_error: "Campo requerido",
      invalid_type_error: "Tipo invalido",
    }),
    establishment_courses: z.array(z.number()).optional(), // Cambiado a array
    Users_destiny: z.array(z.number()).optional(), // Cambiado a array
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IFormValues>({
    resolver: zodResolver(MeetingSchema),
  });
  const listaCursos = watch('establishment_courses')
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const getUsers = async () => {
    try {
      const data = await api_getUsersEstablishment(user.establishment.id);
      setUsers(data.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!user) return;

    getUsers();
  }, [user]);

  const [coursesEs, setCoursesEs] = useState<ICoursesEstablishment[]>([]);
  const getCoursesEstablishment = async () => {
    try {
      const data = await api_getEstablishmentCoursesSinPag(
        user.establishment.id
      );
      setCoursesEs(data.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user || user.establishment.id == 0) return;
    getCoursesEstablishment();
  }, [user]);

  const handleCreateMeeting = async () => {
    try {
      // Reemplaza los espacios en blanco por guiones bajos
      const formattedRoomName = roomName.replace(/\s+/g, "_"); // Reemplaza todos los espacios en blanco por "_"

      if (!formattedRoomName) {
        alert("Por favor, ingrese un nombre para la sala.");
        return;
      }

      localStorage.setItem("currentRoom", formattedRoomName); // Usa el nombre de sala formateado

      const displayName = `${user.firstname} ${user.first_lastname} ${user.second_lastname}`;
      const randomToken = Math.floor(Math.random() * 10000000000).toString();
      // URL de la reunión
      const roomUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}#userInfo.displayName="${displayName}"&config.defaultLanguage=es&interfaceConfigOverwrite.TOOLBAR_BUTTONS=["microphone", "camera", "closedcaptions", "desktop", "fullscreen", "fodeviceselection", "hangup", "profile", "chat", "recording", "livestreaming", "etherpad", "sharedvideo", "settings", "raisehand", "videoquality", "filmstrip", "invite", "feedback", "stats", "shortcuts", "tileview", "videobackgroundblur", "download", "help", "mute-everyone"]&config.disableProfile=true`;

      // Guardar solo la parte de la URL hasta 'token'
      const baseUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}`;

      const currentTime = new Date().toISOString().split("T")[0];
      toast.loading("Creando reunión...");
      // const data = await api_postSendMeeting({
      //     CreationDate: currentTime,
      //     RoomName: formattedRoomName,
      //     RoomUrl: baseUrl,
      //     Establishment: user.establishment.id
      // });

      setRoomStatus(true);
      toast.dismiss();
      toast.success("Reunión creada correctamente");
      // Abrir la reunión en una nueva pestaña y
      const newWindow = window.open(roomUrl, "_blank");
      setMeetingWindow(newWindow);
      console.log("Información de la reunión enviada al backend");
    } catch (error) {
      console.error("Error al enviar la información de la reunión:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setSelectedCourses(selectedOptions);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setSelectedUsers(selectedOptions);
  };
  // Función para finalizar la reunión
  const handleFinishMeeting = () => {
    setRoomName("");
    setRoomStatus(false);
    if (meetingWindow) {
      meetingWindow.close(); // Cerrar la ventana de reunión
    }
  };
  const Cursos = ({e}:{e:number}) => {
    console.log(e)
    const element = coursesEs.find((element) => element.id === e) 
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{element?.attributes.Grade} {element?.attributes.Letter}</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    );
  };
  const Body = () => {
    return (
      <>
        <Head>
          <title>Reunión</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido a la sala de reuniones</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="email">Nombre de la sala</Label>
            <Input
              type="email"
              id="email"
              placeholder="Ingrese el nombre de la sala"
              value={roomName}
              onChange={handleInputChange}
            />
            <div className="w-full">
              <label htmlFor="courses" className="mb-2 font-semibold">
                Seleccionar cursos (opcional):
              </label>
              <Controller
                control={control}
                name="establishment_courses"
                render={({ field: { onChange, value, name, ref } }) => (
                  <Select
                    placeholder="Seleccione curso"
                    getOptionValue={(option) => option.id.toString()}
                    getOptionLabel={(option) =>
                      option.attributes.Grade + " " + option.attributes.Letter
                    }
                    value={coursesEs.filter((course) =>
                      value?.includes(course.id)
                    )} // Filtra los cursos seleccionados
                    options={coursesEs}
                    onChange={(val) => {
                      const selectedIds = val
                        ? val.map((course) => course.id)
                        : []; // Obtiene los IDs seleccionados
                      setValue("establishment_courses", selectedIds); // Actualiza el valor en el formulario
                    }}
                    menuPortalTarget={document.body}
                    loadingMessage={() => "Cargando opciones..."}
                    isLoading={coursesEs.length === 0}
                    isClearable
                    isMulti // Habilita la selección múltiple
                  />
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateMeeting}
              variant="outline"
              className="w-full"
            >
              Outline
            </Button>
          </CardFooter>
        </Card>
      </>
    );
  }
  if (["Profesor", "Encargado de Convivencia Escolar"].includes(GetRole())) {
    return <div className="px-4">
    <Body/>
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
    {listaCursos && listaCursos.map((e, index) => (
        <Cursos key={index} e={e}/> 
        
      ))}
    </div>
    </div>
  }

}


