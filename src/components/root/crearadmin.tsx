import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { PencilRuler, Wrench } from 'lucide-react';
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "../ui/input";
import { getRegiones, getComunas } from "@/services/local.services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { api_allEstablishment, api_establishmentByComuna, api_postEstablishment, api_role, api_updateUser } from "@/services/axios.services";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import router, { useRouter } from "next/router";


interface IForm {
    username: string;
    email: string;
    first_lastname: string;
    second_lastname: string;
    firstname: string;
    secondname: string;
    region: string;
    comuna: string;
    direccion: string;
    phone: string;
    password: string;
    tipo: string;
    role: number;
    establishment: number;
    canUploadDoc: boolean;
    region_establishment: string;
    comuna_establishment: string;
}

interface IRole {
    id: number;
    name: string
}

interface IEstablishment {
    id: number;
    attributes: {
        name: string;
        comuna: string;
    };
}

export default function CrearAdministrador() {
    const { bearer, setRole, user, role } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [regionList, setRegionList] = useState<string[]>([]);
    const [comunaList, setComunaList] = useState<string[]>([]);
    const [regionEstablishmentList, setRegionEstablishmentList] = useState<string[]>([]);
    const [comunaEstablishmentList, setComunaEstablishmentList] = useState<string[]>([]);
    const [establishmentList, setEstablishmentList] = useState<IEstablishment[]>([]);
    const [regionEstablecimiento, setRegionEstablecimiento] = useState<string>("");
    const [comunaEstablecimiento, setComunaEstablecimiento] = useState<string>("");

    const [loading, setLoading] = useState(false);

    const fetchRegiones = async () => {
        try {
            const regionData = await getRegiones();
            setRegionList(regionData.data.data);
        } catch (error) {
            console.error("Error fetching regiones:", error);
        }
    };

    const fetchComunas = async (region: string) => {
        try {
            const comunaData = await getComunas(region);
            setComunaList(comunaData.data.data);
        } catch (error) {
            console.error("Error fetching comunas:", error);
        }
    };

    const fetchRegionesEstablecimiento = async () => {
        try {
            const regionData = await getRegiones();
            setRegionEstablishmentList(regionData.data.data);
        } catch (error) {
            console.error("Error fetching regiones del establecimiento:", error);
        }
    };

    const fetchComunasEstablecimiento = async (region: string) => {
        try {
            const comunaData = await getComunas(region);
            setComunaEstablishmentList(comunaData.data.data);
        } catch (error) {
            console.error("Error fetching comunas del establecimiento:", error);
        }
    };

    useEffect(() => {
        fetchRegiones();
        fetchRegionesEstablecimiento();
    }, []);

    const SchemaFormValues = z.object({
        email: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).email({
            message: "Porfavor ingresa un email valido",
        }),
        role: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo invalido" }),
        establishment: z.number({ required_error: "Campo Requerido", invalid_type_error: "Tipo invalido" }),
        first_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
        second_lastname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
        firstname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
        secondname: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
        region: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
        comuna: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
        direccion: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
        phone: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
        region_establishment: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default(""),
        comuna_establishment: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }).min(3, { message: "Campo Requerido" }).default("")
    });

    const { register, handleSubmit, watch, setValue, control, formState: { errors }, reset } = useForm<IForm>({
        resolver: zodResolver(SchemaFormValues),
    });

    const regionWatch = watch("region");
    const regionEstablishmentWatch = watch("region_establishment");
    const comunaEstablishmentWatch = watch("comuna_establishment")

    useEffect(() => {
        if (regionWatch) {
            fetchComunas(regionWatch);
            setValue("comuna", ""); // Reset comuna cuando cambia la región
        }
    }, [regionWatch, setValue]);

    useEffect(() => {
        if (regionEstablishmentWatch) {
            fetchComunasEstablecimiento(regionEstablishmentWatch);
            setValue("comuna_establishment", "");
            setComunaEstablecimiento("");
        }
    }, [regionEstablishmentWatch, setValue]);

    function generateRandomPassword() {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < 6; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    const fetchEstablishment = async (comuna_establishment: string) => {
        try {
            const establishmentData = await api_establishmentByComuna(comuna_establishment);
            setEstablishmentList(establishmentData.data.data);
        } catch (error) {
            console.error("Error fetching stablishment:", error);
        }
    };

    useEffect(() => {
        if (comunaEstablecimiento) {
            fetchEstablishment(comunaEstablecimiento);
        }
    }, [comunaEstablecimiento]);

    
    const onSubmit = async (data: IForm) => {
        const id = toast.loading("Creando...");
        setLoading(true);
        const transformedData = {
            ...data,
            username: data.email,
            password: generateRandomPassword(),
            tipo: "otro",
            canUploadDoc: true
        };
        try {
            console.log("data enviada al posss", transformedData)
            const response = await axios.post(
                process.env.NEXT_PUBLIC_BACKEND_URL + "auth/local/register",
                transformedData
            );
            const updateRoleUser = {
                role: data.role
            }
            const userId = response.data.user.id;
            await api_updateUser(Number(userId), updateRoleUser);

            const emailResponse = await axios.post(
                process.env.NEXT_PUBLIC_BACKEND_URL + "send-password-email",
                {
                    email: data.email,
                    password: transformedData.password
                }
            );
            toast.success('Administrador creado con exito.')
            setTimeout(() => {
                router.reload();
            }, 3000);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response) {
                    if (error.response.data.error.message)
                        if (error.response.data.error.message === "Email or Username are already taken") toast.update(id, {
                            render: "Error: El correo electronico Ya se encuentra en uso.",
                            type: "error",
                            isLoading: false,
                            autoClose: 3000,

                        })
                }
            } else {
                toast.update(id, {
                    render: "Ocurrió un error al crear la cuenta.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        }
    }


    const [roleList, setRoleList] = useState<IRole[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roleData = await api_role()
                const filteredRoles = roleData.data.roles.filter(
                    (role: IRole) => role.name === "admin"
                )
                setRoleList(filteredRoles)
                const regionData = await getRegiones()
                setRegionList(regionData.data.data)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [])
    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Card className="flex-1 cursor-pointer">
                        <CardHeader>
                            <CardTitle>
                                <Alert>
                                    <PencilRuler className="h-4 w-4" />
                                    <AlertTitle>Crear Administrador</AlertTitle>
                                    <AlertDescription>
                                        {user.firstname} {user.first_lastname}
                                    </AlertDescription>
                                </Alert>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] w-[102vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center">Crear Administrador</DialogTitle>
                        <DialogDescription className="text-center">
                            Llena los campos para registrar un nuevo administrador.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogTitle className="mb-2">Información personal:</DialogTitle>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div className="flex flex-col">
                                <Label className="mb-1">Email*</Label>
                                <Input
                                    type="text"
                                    {...register('email', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label className="mb-1">Teléfono*</Label>
                                <Input
                                    type="text"
                                    {...register('phone', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                            </div>

                            <div className="flex flex-col">
                                <Label className="mb-1" >Primer nombre*</Label>
                                <Input
                                    type="text"
                                    {...register('firstname', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label className="mb-1">Segundo nombre*</Label>
                                <Input
                                    type="text"
                                    {...register('secondname', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.secondname && <p className="text-red-500 text-sm">{errors.secondname.message}</p>}
                            </div>

                            <div className="flex flex-col">
                                <Label className="mb-1">Apellido paterno*</Label>
                                <Input
                                    type="text"
                                    {...register('first_lastname', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.first_lastname && <p className="text-red-500 text-sm">{errors.first_lastname.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label className="mb-1">Apellido materno*</Label>
                                <Input
                                    type="text"
                                    {...register('second_lastname', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.second_lastname && <p className="text-red-500 text-sm">{errors.second_lastname.message}</p>}
                            </div>


                            <div className="flex flex-col">
                                <Label className="mb-1">Región*</Label>
                                <Controller
                                    name="region"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione una región" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-52">
                                                {regionList.map((region) => (
                                                    <SelectItem key={region} value={region}>
                                                        {region}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.region && <p className="text-red-500 text-sm">{errors.region.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label className="mb-1">Comuna*</Label>
                                <Controller
                                    name="comuna"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!regionWatch}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione una comuna" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-52">
                                                {comunaList.map((comuna) => (
                                                    <SelectItem key={comuna} value={comuna}>
                                                        {comuna}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.comuna && <p className="text-red-500 text-sm">{errors.comuna.message}</p>}
                            </div>

                        </div>
                        <div className="grid grid-cols-1 gap-4 mb-10">
                            <div className="flex flex-col">
                                <Label className="mb-1">Dirección*</Label>
                                <Input
                                    type="text"
                                    {...register('direccion', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion.message}</p>}
                            </div>
                        </div>

                        <DialogTitle className="mb-2">Información laboral:</DialogTitle>
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="flex flex-col">
                                <Label className="mb-1">Región del establecimiento*</Label>
                                <Controller
                                    name="region_establishment"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            setRegionEstablecimiento(value);
                                        }} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione una región" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-52">
                                                {regionEstablishmentList.map((region) => (
                                                    <SelectItem key={region} value={region}>
                                                        {region}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.region_establishment && <p className="text-red-500 text-sm">{errors.region_establishment.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label className="mb-1">Comuna del establecimiento*</Label>
                                <Controller
                                    name="comuna_establishment"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setComunaEstablecimiento(value);
                                            }}
                                            value={field.value}
                                            disabled={!regionEstablishmentWatch}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione una comuna" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {comunaEstablishmentList.map((comuna) => (
                                                    <SelectItem key={comuna} value={comuna}>
                                                        {comuna}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.comuna_establishment && <p className="text-red-500 text-sm">{errors.comuna_establishment.message}</p>}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="establishment" className="block text-sm font-medium text-gray-700 mb-1">Establecimiento*</label>
                                <Controller
                                    name="establishment"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => field.onChange(value === "" ? undefined : Number(value))} value={field.value?.toString() || ""} disabled={!comunaEstablishmentWatch}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione el establecimiento" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-52">
                                                {establishmentList.length > 0 ? (
                                                    establishmentList.map((establishment: IEstablishment) => (
                                                        <SelectItem key={establishment.id} value={establishment.id.toString()}>
                                                            {establishment.attributes.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem disabled value="no-establishments">
                                                        No se encontraron establecimientos
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.establishment && <p className="text-red-500 text-sm">{errors.establishment.message}</p>}

                            </div>

                            <div>
                                <Label>Rol*</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione un rol" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-52">
                                                {roleList.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                            </div>


                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>Crear</Button>
                            <Button type="button" variant="destructive" onClick={() => setIsOpen(false)}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )

}