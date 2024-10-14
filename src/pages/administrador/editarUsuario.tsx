import { api_getOneUser } from "@/services/axios.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface IUser {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    second_lastname: string;
    first_lastname: string;
    firstname: string;
    secondname: string;
    tipo: string;
    direccion: string;
    region: string;
    comuna: string;
    phone: string;
}

interface IFormValue {
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    second_lastname: string;
    first_lastname: string;
    firstname: string;
    secondname: string;
    tipo: string;
    direccion: string;
    region: string;
    comuna: string;
    phone: string;
}

export default function EditarUsuario() {
    const searchParams = useSearchParams();
    const search = searchParams.get("id");
    const userId = String(search);

    const [dataUser, setDataUser] = useState<IUser>()

    const getUser = async () => {
        try {
            const response = await api_getOneUser(parseInt(userId));
            setDataUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        getUser();
    }, [search]);

    const EditUserSchema = z.object({
        username: z.string(),
        email: z.string(),
        confirmed: z.boolean(),
        blocked: z.boolean(),
        second_lastname: z.string(),
        first_lastname: z.string(),
        firstname: z.string(),
        secondname: z.string(),
        tipo: z.string(),
        direccion: z.string(),
        region: z.string(),
        comuna: z.string(),
        phone: z.string(),
    });

    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<IFormValue>({
        resolver: zodResolver(EditUserSchema),
        defaultValues: {
            first_lastname: dataUser?.first_lastname,
            second_lastname: dataUser?.second_lastname,
            firstname: dataUser?.firstname,
            secondname: dataUser?.secondname,
            region: '',
            comuna: '',
            direccion: dataUser?.direccion,
            phone: dataUser?.phone,
            username:dataUser?.username,
        }
    });



    return (
        <>
            <div className="grid grid-cols-12 gap-4 border rounded-md shadow-md p-4 w-3/4 mx-auto">
                <div className="col-start-0 col-end-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-primary hover:text-green-700 cursor-pointer" onClick={() => { router.back() }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <div className="col-start-2 col-end-13">
                    <div className="grid grid-cols-2">
                        <div className="md:mr-2">
                            <label htmlFor="nombre">Primer Nombre: </label>
                            <input {...register('firstname')} type="text" className="input input-primary w-full" placeholder="Ingre su primer nombre..." />
                        </div>

                        <div>
                            <label htmlFor="nombre">Segundo Nombre: </label>
                            <input type="text" className="input input-primary w-full" placeholder="Ingre su segundo nombre..." />
                        </div>

                        <div className="md:mr-2">
                            <label htmlFor="nombre">Primer Apellido: </label>
                            <input type="text" className="input input-primary w-full" placeholder="Ingre su primer apellido..." />
                        </div>

                        <div>
                            <label htmlFor="nombre">Segundo Apellido: </label>
                            <input type="text" className="input input-primary w-full" placeholder="Ingre su segundo apellido..." />
                        </div>
                        <div>
                            <label htmlFor="nombre">Segundo Apellido: </label>
                            <input type="text" className="input input-primary w-full" placeholder="Ingre su segundo apellido..." />
                        </div>
                        <div>
                            <label htmlFor="nombre">Segundo Apellido: </label>
                            <input type="text" className="input input-primary w-full" placeholder="Ingre su segundo apellido..." />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}