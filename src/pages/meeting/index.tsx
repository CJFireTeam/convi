import React, { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import router, { useRouter } from "next/router"; // Importa useRouter
import {
  api_getEstablishmentCoursesSinPag,
  api_GetUsersAlumnosEstablishment,
  api_getUsersEstablishment,
  api_getUsersEstablishment2,
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import { Loading } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";

interface IFormValues {
  CreationDate: string;
  RoomName: string;
  RoomUrl: string;
  Establishment: number;
  CreatorUser: number;
  establishment_courses?: number[] | undefined;
  Users_destiny?: number[] | undefined;
}

interface IUser {
  id: number;
  firstname: string;
  first_lastname: string;
  second_lastname: string;
  role:{
    name:string;
  }
  tipo:string;
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

export default function MeetingPage() {
  const [roomName, setRoomName] = useState("");
  const [meetingWindow, setMeetingWindow] = useState<Window | null>(null);
  const { user, GetRole } = useUserStore();
  const [coursesEs, setCoursesEs] = useState<ICoursesEstablishment[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());

  
  
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

  const listaCursos = watch('establishment_courses');

  
  useEffect(() => {
    if (!user || user.establishment.id === 0) return;
    getCoursesEstablishment();
  }, [user]);

  const getCoursesEstablishment = async () => {
    try {
      const data = await api_getEstablishmentCoursesSinPag(user.establishment.id);
      setCoursesEs(data.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const roomNameInput = document.getElementById("roomName") as HTMLInputElement;
      const roomName = roomNameInput.value.trim();
      console.log(roomName)
      if (!roomName) {
        toast.error("Por favor, ingrese un nombre para la sala.");
        return;
      }

      const formattedRoomName = roomName.replace(/\s+/g, "_");
      localStorage.setItem("currentRoom", formattedRoomName);

      const displayName = `${user.firstname} ${user.first_lastname} ${user.second_lastname}`;
      const randomToken = Math.floor(Math.random() * 10000000000).toString();
      const roomUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}#userInfo.displayName="${displayName}"&config.defaultLanguage=es`;

      const baseUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}`;
      const currentTime = new Date().toISOString().split("T")[0];
      toast.loading("Creando reunión...");

      const newWindow = window.open(roomUrl, "_blank");
      setMeetingWindow(newWindow);

      const meetingData: IFormValues = {
        CreationDate: currentTime,
        RoomName: formattedRoomName,
        RoomUrl: baseUrl,
        Establishment: user.establishment.id,
        CreatorUser: user.id,
        establishment_courses: selectedCourses.size > 0 ? Array.from(selectedCourses) : undefined,
        Users_destiny: selectedUsers.size > 0 ? Array.from(selectedUsers) : undefined,
      };

      // Remove undefined properties
      const cleanedMeetingData = Object.fromEntries(
        Object.entries(meetingData).filter(([_, v]) => v !== undefined)
      );

      console.log('Data del meeting:', cleanedMeetingData);

      await api_postSendMeeting(cleanedMeetingData);

      toast.dismiss();
      toast.success("Reunión creada correctamente");
      setTimeout(() => {
        router.reload();
      }, 3000);
    } catch (error) {
      console.error("Error al enviar la información de la reunión:", error);
      toast.error("Error al crear la reunión");
    }
  };

  const handleSelectUser = useCallback((userId: number) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
    console.log('users: ', selectedUsers)
  }, []);

  const handleSelectCourse = useCallback((courseId: number) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
    // Cuando se selecciona o deselecciona un curso completo, limpiamos los usuarios individuales
    setSelectedUsers(new Set());
    console.log('users: ', selectedUsers)
    console.log('courses: ', selectedCourses)
  }, []);
  
  
  const Body = () => {
    return (
      <Card className="md:w-3/4">
        <CardHeader>
          <CardTitle>Bienvenido a la sala de reuniones</CardTitle>
        </CardHeader>
        <CardContent className="md:mx-8">
          <Label htmlFor="roomName">Nombre de la sala</Label>
          <Input
            id="roomName"
            placeholder="Ingrese el nombre de la sala"
            {...register("RoomName")}
            onChange={(e) => {
              setValue("RoomName", e.target.value); // Actualizar el valor en React Hook Form
            }}
          />
          <div className="w-full mt-4">
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
                  )}
                  options={coursesEs}
                  onChange={(val) => {
                    const selectedIds = val
                      ? val.map((course) => course.id)
                      : [];
                    setValue("establishment_courses", selectedIds);
                  }}
                  menuPortalTarget={document.body}
                  loadingMessage={() => "Cargando opciones..."}
                  isLoading={coursesEs.length === 0}
                  isClearable
                  isMulti
                />
              )}
            />
            <span className="text-gray-400">Debe agregar todo el curso si desea enviar una reunión a este</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCreateMeeting}
            variant="outline"
            className="w-full"
          >
            Generar reunión
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (["Profesor", "Encargado de Convivencia Escolar"].includes(GetRole())) {
    return (
      <div className="px-4">
        <Head>
          <title>Reunión</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <div className="flex items-center justify-center">
          <Body />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {listaCursos && listaCursos.map((e, index) => (
            <Cursos
              key={index}
              e={e}
              coursesEs={coursesEs}
              onSelectUser={handleSelectUser}
              onSelectCourse={handleSelectCourse}
              selectedUsers={selectedUsers}
              selectedCourses={selectedCourses}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
interface IUser {
  id: number;
  firstname: string;
  first_lastname: string;
}

interface ICursosProps {
  e: number;
  coursesEs: ICoursesEstablishment[];
  onSelectUser: (userId: number) => void;
  onSelectCourse: (courseId: number) => void;
  selectedUsers: Set<number>;
  selectedCourses: Set<number>;
}

export const Cursos: React.FC<ICursosProps> = ({
  e,
  coursesEs,
  onSelectUser,
  onSelectCourse,
  selectedUsers,
  selectedCourses
}) => {
  const [students, setStudents] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const { user } = useUserStore();

  const getUsers = async () => {
    try {
      setLoading(true);
      const data = await api_getUsersEstablishment2(user.establishment.id, e);
      setStudents(data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [e]);
  
  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = students.slice(indexOfFirstUser, indexOfLastUser);

  // Función para manejar la navegación entre páginas
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const element = coursesEs.find((element) => element.id === e);
  const isCourseSelected = selectedCourses.has(e);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{element?.attributes.Grade} {element?.attributes.Letter}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {loading && <div className="flex justify-center"><Loading /></div>}
            {!loading && students.length === 0 && <div className="flex justify-center"><WarningAlert message={'Curso sin usuarios.'} /> </div>}
            {!loading && currentUsers?.map((uc, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-nowrap">{uc.firstname + " " + uc.first_lastname}</TableCell>
                <TableCell className="font-medium text-nowrap">{uc.role.name === "Authenticated" ? uc.tipo : uc.role.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectUser(uc.id)}
                    disabled={isCourseSelected}
                    aria-label={selectedUsers.has(uc.id) ? "Deseleccionar usuario" : "Seleccionar usuario"}
                    
                  >
                    {selectedUsers.has(uc.id) ? <Minus color="red" /> : <Plus color="green" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
            {/* Paginación */}
            <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        <span>Página {currentPage}</span>
        <Button
          variant="outline"
          disabled={indexOfLastUser >= students.length}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Siguiente
        </Button>
      </CardFooter>
      <CardFooter>
        <Button
          variant={isCourseSelected ? "default" : "outline"}
          onClick={() => onSelectCourse(e)}
          className={isCourseSelected ? "bg-green-500 hover:bg-green-600 w-full" : "w-full"}
          aria-label={isCourseSelected ? "Quitar todo el curso" : "Agregar todo el curso"}
          
        >
          {isCourseSelected ? <Check /> : <Plus/>}
          {isCourseSelected ? "Curso seleccionado" : "Agregar todo el curso"}
        </Button>
      </CardFooter>
    </Card>
  );
};
