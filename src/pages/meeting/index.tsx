"use client"

import React, { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import {
  api_getEstablishmentCoursesSinPag,
  api_getUsersEstablishment2,
  api_postSendMeeting,
} from "@/services/axios.services";
import { toast } from "react-toastify";
import Head from "next/head";
import { z } from "zod";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Minus, Plus, CalendarIcon, Clock } from 'lucide-react';
import { Loading } from "react-daisyui";
import WarningAlert from "@/components/alerts/warningAlert";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const MeetingSchema = z.object({
  RoomName: z.string().min(1, "Campo requerido"),
  establishment_courses: z.array(z.number()).optional(),
  Users_destiny: z.array(z.number()).optional(),
  MeetingDate: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof MeetingSchema>;

interface ICoursesEstablishment {
  attributes: {
    Grade: string;
    Letter: string;
  };
  id: number;
}

interface IUser {
  id: number;
  firstname: string;
  first_lastname: string;
  role: {
    name: string;
  }
  tipo: string;
}

export default function MeetingPage() {
  const [coursesEs, setCoursesEs] = useState<ICoursesEstablishment[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(MeetingSchema),
    defaultValues: {
      RoomName: "",
      establishment_courses: [],
      Users_destiny: [],
      MeetingDate: null,
    },
  });

  const listaCursos = watch('establishment_courses') || [];
  const meetingDate = watch('MeetingDate');

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

  const onSubmit = async (data: FormValues) => {
    try {
      toast.loading("Creando reunión...");

      const formattedRoomName = data.RoomName.replace(/\s+/g, "_");
      localStorage.setItem("currentRoom", formattedRoomName);

      const displayName = `${user.firstname} ${user.first_lastname} ${user.second_lastname}`;
      const randomToken = Math.floor(Math.random() * 10000000000).toString();
      const roomUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}#userInfo.displayName="${displayName}"&config.defaultLanguage=es`;

      const baseUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}`;
      const currentTime = new Date().toISOString().split("T")[0];

      window.open(roomUrl, "_blank");

      let formattedDate = null;
      let formattedTime = null;
      if (data.MeetingDate) {
        const date = new Date(data.MeetingDate);
        formattedDate = date.toISOString().split("T")[0];
        formattedTime = format(date, "hh:mm:ss");
      }

      const meetingData = {
        CreationDate: currentTime,
        RoomName: formattedRoomName,
        RoomUrl: baseUrl,
        Establishment: user.establishment.id,
        CreatorUser: user.id,
        establishment_courses: selectedCourses.size > 0 ? Array.from(selectedCourses) : undefined,
        Users_destiny: selectedUsers.size > 0 ? Array.from(selectedUsers) : undefined,
        MeetingDate: formattedDate,
        MeetingTime: formattedTime,
      };

      console.log('Datos a enviar:', meetingData);

      await api_postSendMeeting(meetingData);

      toast.dismiss();
      toast.success("Reunión creada correctamente");
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
    setSelectedUsers(new Set());
  }, []);

  const Body = () => (
    <Card className="md:w-3/4">
      <CardHeader>
        <CardTitle>Bienvenido a la sala de reuniones</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="md:mx-8">
          <Label htmlFor="RoomName">Nombre de la sala</Label>
          <Input
            id="RoomName"
            placeholder="Ingrese el nombre de la sala"
            {...register("RoomName")}
          />
          {errors.RoomName && <span className="text-red-500">{errors.RoomName.message}</span>}

          <div className="w-full mt-4">
            <Label htmlFor="courses">Seleccionar cursos (opcional):</Label>
            <Controller
              control={control}
              name="establishment_courses"
              render={({ field }) => (
                <Select<ICoursesEstablishment, true>
                  {...field}
                  placeholder="Seleccione curso"
                  getOptionValue={(option: ICoursesEstablishment) => option.id.toString()}
                  getOptionLabel={(option: ICoursesEstablishment) =>
                    option.attributes.Grade + " " + option.attributes.Letter
                  }
                  options={coursesEs}
                  onChange={(val) => {
                    const selectedIds = val
                      ? (val as ICoursesEstablishment[]).map((course) => course.id)
                      : [];
                    field.onChange(selectedIds);
                  }}
                  value={coursesEs.filter((course) => field.value?.includes(course.id))}
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

          <div className="w-full mt-4">
            <Label htmlFor="meetingDate">Fecha y hora de la reunión (opcional)</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !meetingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {meetingDate ? format(new Date(meetingDate), "PPP HH:mm", { locale: es }) : <span>Seleccionar fecha y hora</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={meetingDate ? new Date(meetingDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentDate = meetingDate ? new Date(meetingDate) : new Date();
                      date.setHours(currentDate.getHours(), currentDate.getMinutes());
                      setValue("MeetingDate", date.toISOString());
                    } else {
                      setValue("MeetingDate", null);
                    }
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  locale={es}
                  className="max-h-60 overflow-auto"
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    value={meetingDate ? format(new Date(meetingDate), "HH:mm") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = meetingDate ? new Date(meetingDate) : new Date();
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setValue("MeetingDate", newDate.toISOString());
                      }
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
          >
            Generar reunión
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

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
        {listaCursos.map((e: number, index: number) => (
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

interface ICursosProps {
  e: number;
  coursesEs: ICoursesEstablishment[];
  onSelectUser: (userId: number) => void;
  onSelectCourse: (courseId: number) => void;
  selectedUsers: Set<number>;
  selectedCourses: Set<number>;
}

const Cursos: React.FC<ICursosProps> = ({
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

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = students.slice(indexOfFirstUser, indexOfLastUser);

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
          {isCourseSelected ? <Check /> : <Plus />}
          {isCourseSelected ? "Curso seleccionado" : "Agregar todo el curso"}
        </Button>
      </CardFooter>
    </Card>
  );
};

