import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/router'; // Importa useRouter
import { api_getCourses, api_getUsersEstablishment, api_postSendMeeting } from '@/services/axios.services';
import { Bounce, toast } from "react-toastify";
import Head from 'next/head';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface FormValues {
    CreationDate: Date;
    RoomName: string;
    RoomUrl: string;
    Establishment: number;
    CreatorUser: number;
    Destined: {
        Courses: number;
        Users_destiny: number;
    }[]
}

interface Course {
    id: number;
    name: string;
}

interface User {
    id: number;
    firstname: string;
    first_lastname: string;
}

export default function MeetingPage() {
    const [roomName, setRoomName] = useState('');
    const [roomStatus, setRoomStatus] = useState(false);
    const [meetingWindow, setMeetingWindow] = useState<Window | null>(null);
    const { user, GetRole } = useUserStore();
    const [url, setUrl] = useState('');
    const router = useRouter(); // Inicializa el router

    const arrayIDs = z.object({
        Courses: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        Users_destiny: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
    })

    const MeetingSchema = z.object({
        CreationDate: z.date({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' }),
        RoomName: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' }),
        RoomUrl: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo inválido' }),
        Establishment: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        CreatorUser: z.number({ required_error: 'Campo requerido', invalid_type_error: 'Tipo invalido' }),
        Destined: z.array(arrayIDs),
    });

    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const getUsers = async () => {
        try {
            const data = api_getUsersEstablishment(user.establishment.id);
            //setDataUsers()  
           } catch (error) {
               
           }
    }


      const getCourses = async () => {
         try {
          const data = api_getCourses(user.establishment.id);
          //setDataCourses(data) 
         } catch (error) {
             
         }
     }
 
     useEffect(() => {
         if (!user || user.establishment.id == 0) return;
         getUsers()
         getCourses();
     }, [user]);
  
    const handleCreateMeeting = async () => {
        try {
            // Reemplaza los espacios en blanco por guiones bajos
            const formattedRoomName = roomName.replace(/\s+/g, '_'); // Reemplaza todos los espacios en blanco por "_"

            if (!formattedRoomName) {
                alert('Por favor, ingrese un nombre para la sala.');
                return;
            }

            localStorage.setItem('currentRoom', formattedRoomName); // Usa el nombre de sala formateado

            const displayName = `${user.firstname} ${user.first_lastname} ${user.second_lastname}`;
            const randomToken = Math.floor(Math.random() * 10000000000).toString();
            // URL de la reunión 
            const roomUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}#userInfo.displayName="${displayName}"&config.defaultLanguage=es&interfaceConfigOverwrite.TOOLBAR_BUTTONS=["microphone", "camera", "closedcaptions", "desktop", "fullscreen", "fodeviceselection", "hangup", "profile", "chat", "recording", "livestreaming", "etherpad", "sharedvideo", "settings", "raisehand", "videoquality", "filmstrip", "invite", "feedback", "stats", "shortcuts", "tileview", "videobackgroundblur", "download", "help", "mute-everyone"]&config.disableProfile=true`;

            // Guardar solo la parte de la URL hasta 'token'
            const baseUrl = `https://meet.jit.si/${formattedRoomName}?token=${randomToken}`;

            const currentTime = new Date().toISOString().split('T')[0];
            toast.loading('Creando reunión...');
            // const data = await api_postSendMeeting({
            //     CreationDate: currentTime,
            //     RoomName: formattedRoomName,
            //     RoomUrl: baseUrl,
            //     Establishment: user.establishment.id 
            // });

            setRoomStatus(true);
            toast.dismiss();
            toast.success('Reunión creada correctamente');
            // Abrir la reunión en una nueva pestaña y
            const newWindow = window.open(roomUrl, '_blank');
            setMeetingWindow(newWindow);
            console.log('Información de la reunión enviada al backend');
        } catch (error) {
            console.error('Error al enviar la información de la reunión:', error);
        }


    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value);
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        setSelectedCourses(selectedOptions);
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        setSelectedUsers(selectedOptions);
    };

    // Función para finalizar la reunión
    const handleFinishMeeting = () => {
        setRoomName('');
        setRoomStatus(false);
        if (meetingWindow) {
            meetingWindow.close(); // Cerrar la ventana de reunión
        }
    };

    //mañana poner la parte del back (el lunes )

    if (GetRole() === "Profesor" || GetRole() === "Encargado de Convivencia Escolar") {
        return (
            <>
                <Head>
                    <title>Reunión</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                </Head>
                <div className="w-full md:w-1/2 h-screen mx-auto">
                    {!roomStatus && (
                        <div className="grid md:grid-cols-12 w-full border border-gray-400 rounded shadow-md p-4">
                            <div className='col-span-6 flex flex-col items-center my-auto text-center'>
                                <h1 className='font-bold text-xl'>Bienvenido</h1>
                                <h1 className='font-bold text-xl'>A la sala</h1>
                                <h1 className='font-bold text-xl'>De</h1>
                                <h1 className='font-bold text-xl'>Reuniones</h1>
                            </div>
                            <div className='col-span-6 mt-2 md:mt-0 border-t-2 md:border-t-0 md:border-l-2 p-4 flex flex-col items-center'>
                                <label htmlFor="roomName" className="block mb-2 font-semibold">Nombre de la sala:</label>
                                <input
                                    type="text"
                                    id="roomName"
                                    name="roomName"
                                    value={roomName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 input input-primary mb-2"
                                    placeholder="Ingrese el nombre de la sala"
                                />
                                <label htmlFor="courses" className="block mb-2 font-semibold">Seleccionar cursos (opcional):</label>
                                <select
                                    id="courses"
                                    multiple
                                    value={selectedCourses.map(String)}
                                    onChange={handleCourseChange}
                                    className="w-full p-2 input input-primary mb-2"
                                    size={4}
                                >
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                                <label htmlFor="users" className="block mb-2 font-semibold">Seleccionar usuarios (opcional):</label>
                                <select
                                    id="users"
                                    multiple
                                    value={selectedUsers.map(String)}
                                    onChange={handleUserChange}
                                    className="w-full p-2 input input-primary mb-2"
                                    size={4}
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{`${user.firstname} ${user.first_lastname}`}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleCreateMeeting}
                                    className="p-2 btn btn-outline btn-secondary"
                                >
                                    Comenzar una Reunión
                                </button>
                            </div>
                        </div>


                    )}
                    {roomStatus && roomName && (
                        <div className="grid md:grid-cols-12 w-full border border-gray-400 rounded shadow-md p-4">
                            <div className='col-span-6 flex flex-col items-center my-auto text-center'>
                                <h1 className='font-semibold text-xl'>Sala</h1>
                                <h1 className='font-bold text-xl'>{roomName}</h1>
                                <h1 className='font-semibold text-xl'>en Reunion</h1>
                            </div>

                            <div className='col-span-6 mt-2 md:mt-0 border-t-2 md:border-t-0 md:border-l-2 p-4 flex flex-col items-center'>
                                <button
                                    onClick={handleFinishMeeting}
                                    className="p-2 btn btn-outline btn-danger mt-4"
                                >
                                    Finalizar Reunión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }
    return null;
}
