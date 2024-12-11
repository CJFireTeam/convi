import router, { useRouter } from "next/router";
import WarningAlert from "@/components/alerts/warningAlert";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateUserByAdminSchema } from "@/validations/createUserByAdminSchema";
import { getComunas, getRegiones } from "@/services/local.services";
import { api_establishmentByComuna, api_role, api_updateUser } from "@/services/axios.services";
import axios, { AxiosError } from "axios";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
export interface IFormValue {
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

function generateRandomPassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 6; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

export default function CrearUsuario() {
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

    const { register, watch, setValue, handleSubmit, formState: { errors }, control } = useForm<IFormValue>({
        resolver: zodResolver(CreateUserByAdminSchema),
        defaultValues: {

        }
    });

    const regionWatch = watch("region");
    const regionEstablishmentWatch = watch("region_establishment");
    const comunaEstablishmentWatch = watch("comuna_establishment")

    useEffect(() => {
        if (regionWatch) {
            fetchComunas(regionWatch);
            setValue("comuna", "");
        }
    }, [regionWatch, setValue]);

    useEffect(() => {
        if (regionEstablishmentWatch) {
            fetchComunasEstablecimiento(regionEstablishmentWatch);
            setValue("comuna_establishment", "");
            setComunaEstablecimiento("");
        }
    }, [regionEstablishmentWatch, setValue]);

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

    const onSubmit = async (data: IFormValue) => {
        const id = toast.loading("Creando...");
        setLoading(true);
        const transformedData = {
            ...data,
            username: data.email,
            password: generateRandomPassword(),
            tipo: "otro",
            canUploadDoc: false
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
            toast.update(id, {
                render: "Usuario creado correctamente",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
            router.push("/administrador")
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

    function atrasButton() {
        router.push("/administrador");
    }

    const [roleList, setRoleList] = useState<IRole[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roleData = await api_role()
                const filteredRoles = roleData.data.roles.filter(
                    (role: IRole) => role.name === "Encargado de Convivencia Escolar" || role.name === "Profesor"
                )
                setRoleList(filteredRoles)
                // const regionData = await getRegiones()
                // setRegionList(regionData.data.data)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [])

    return (
        <>

            <div className="mb-4">
                <button onClick={atrasButton}>
                    <ArrowLeftIcon className="h-8 w-8 text-primary "></ArrowLeftIcon>
                </button>
            </div>
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-primary">
                <h2 className="text-2xl font-bold mb-2 text-center">Crear Cuenta de Usuario</h2>
                <p className="text-gray-600 mb-6 text-center">Ingrese los detalles del nuevo usuario</p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <p className="text-black">Información personal:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <Label className="mb-1">Email*</Label>
                            <Input
                                className="w-full bg-white"
                                type="text"
                                {...register('email', { setValueAs: (value) => value === '' ? undefined : value })}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <Label className="mb-1">Teléfono*</Label>
                            <Input
                                className="w-full bg-white"
                                type="text"
                                {...register('phone', { setValueAs: (value) => value === '' ? undefined : value })}
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                        </div>

                        <div className="flex flex-col">
                            <Label className="mb-1" >Primer nombre*</Label>
                            <Input
                                className="w-full bg-white"
                                type="text"
                                {...register('firstname', { setValueAs: (value) => value === '' ? undefined : value })}
                            />
                            {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <Label className="mb-1">Segundo nombre*</Label>
                            <Input
                                className="w-full bg-white"
                                type="text"
                                {...register('secondname', { setValueAs: (value) => value === '' ? undefined : value })}
                            />
                            {errors.secondname && <p className="text-red-500 text-sm">{errors.secondname.message}</p>}
                        </div>

                        <div className="flex flex-col">
                            <Label className="mb-1">Apellido paterno*</Label>
                            <Input
                                className="w-full bg-white"
                                type="text"
                                {...register('first_lastname', { setValueAs: (value) => value === '' ? undefined : value })}
                            />
                            {errors.first_lastname && <p className="text-red-500 text-sm">{errors.first_lastname.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <Label className="mb-1">Apellido materno*</Label>
                            <Input
                                className="w-full bg-white"
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
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Seleccione una región" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Seleccione una comuna" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div>
                            <div className="flex flex-col">
                                <Label className="mb-1">Dirección*</Label>
                                <Input
                                    className="w-full bg-white"
                                    type="text"
                                    {...register('direccion', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion.message}</p>}
                            </div>
                        </div>
                    </div>
                    <p className="text-black">Información laboral:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Seleccione una región" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                        <SelectTrigger className="w-full bg-white">
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
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Seleccione el establecimiento" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Seleccione un rol" />
                                        </SelectTrigger>
                                        <SelectContent>
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

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-primary text-white font-medium rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Crear Usuario
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}