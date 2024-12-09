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
import { PencilRuler } from 'lucide-react';
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "../ui/input";
import { getRegiones, getComunas } from "@/services/local.services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { api_postEstablishment } from "@/services/axios.services";
import { toast } from "react-toastify";


interface IForm {
    name: string;
    address: string;
    Phone: string;
    Region: string;
    Comuna: string;
}

export default function CrearEstablecimientos() {

    const { bearer, setRole, user, isLoading, role } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);

    const [regionList, setRegionList] = useState<string[]>([]);
    const [comunaList, setComunaList] = useState<string[]>([]);

    const fetchRegiones = async () => {
        try {
            const regionData = await getRegiones()
            setRegionList(regionData.data.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const fetchComunas = async (region: string) => {
        try {
            const comunaData = await getComunas(region)
            setComunaList(comunaData.data.data)
        } catch (error) {
            console.error('Error fetching comunas:', error)
        }
    }

    useEffect(() => {
        fetchRegiones()
    }, [])

    const SchemaFormValues = z.object({
        name: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' })
            .max(60, 'El nombre no puede exceder los 60 caracteres.'),
        address: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        Phone: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' })
            .length(9, 'El teléfono debe tener exactamente 9 dígitos.')
            .regex(/^\d+$/, 'El teléfono solo puede contener números.'),
        Region: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
        Comuna: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }),
    });

    const { register, watch, setValue, handleSubmit, formState: { errors }, control, reset } = useForm<IForm>({
        resolver: zodResolver(SchemaFormValues),
    });

    const regionWatch = watch("Region");

    useEffect(() => {
        if (regionWatch) {
            fetchComunas(regionWatch)
            setValue('Comuna', '') // Reset comuna when region changes
        }
    }, [regionWatch, setValue])

    const [loading, setLoading] = useState(false);
    const onSubmit = async (data: IForm) => {
        try {
            setLoading(true);
            const response = await api_postEstablishment(data);
            toast.success('Establecimiento creado con exito.')
            reset();
        } catch (error) {
            console.log(error);
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Card className="flex-1 cursor-pointer">
                        <CardHeader>
                            <CardTitle>
                                <Alert>
                                    <PencilRuler className="h-4 w-4" />
                                    <AlertTitle>Crear Establecimientos</AlertTitle>
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
                        <DialogTitle><PencilRuler className="h-4 w-4 inline-block" /> Crear establecimientos</DialogTitle>
                        <DialogDescription>
                            Aquí podrás crear nuevos establecimientos.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <Label>Nombre del establecimiento*</Label>
                                <Input
                                    type="text"
                                    {...register('name', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label>Region*</Label>
                                <Controller
                                    name="Region"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} >
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
                                {errors.Region && <p className="text-red-500 text-sm">{errors.Region.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label>Comuna*</Label>
                                <Controller
                                    name="Comuna"
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
                                {errors.Comuna && <p className="text-red-500 text-sm">{errors.Comuna.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label>Direccion*</Label>
                                <Input
                                    type="text"
                                    {...register('address', { setValueAs: (value) => value === '' ? undefined : value })}
                                />
                                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                            </div>
                            <div className="flex flex-col">
                                <Label>Telefono*</Label>
                                <div className="flex flex-row">
                                    <Label className="my-auto mr-1">+56</Label>
                                    <Input
                                        type="text"
                                        {...register('Phone', { setValueAs: (value) => value === '' ? undefined : value })}
                                    />
                                </div>
                                {errors.Phone && <p className="text-red-500 text-sm">{errors.Phone.message}</p>}
                            </div>
                        </div >

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {!loading ? 'Crear' : <> <span className="loading loading-spinner loading-md"></span></>}
                            </Button>
                            <Button type="button" variant='destructive' onClick={() => { setIsOpen(false) }}>Cerrar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

