import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, Lock, LockOpen, School, Search } from 'lucide-react';
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { api_allEstablishments, api_allEstablishmentStatusFalse, api_allEstablishmentStatusTrue, api_putEstablishment, api_putStatusEstablishment } from "@/services/axios.services";
import { IAllEstablishment } from "@/interfaces/establishment.interface";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import WarningAlert from "../alerts/warningAlert";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getComunas, getRegiones } from "@/services/local.services";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface IForm {
    name: string;
    address: string;
    Phone: string;
    Region: string;
    Comuna: string;
}

export default function VerEstablecimientos() {
    const { bearer, setRole, user, role } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalTrue, setTotalTrue] = useState(0);
    const [totalFalse, setTotalFalse] = useState(0);
    const [allEstablishment, setAllEstablishment] = useState<IAllEstablishment[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [adminFilter, setAdminFilter] = useState<'all' | 'with' | 'without'>('all');
    const itemsPerPage = 10;
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
        name: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }).min(1, "El nombre no puede esar vacio")
            .max(60, 'El nombre no puede exceder los 60 caracteres.'),
        address: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Tipo de dato inválido' }).min(1, "La dirección no puede esar vacia"),
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
        }
    }, [regionWatch, setValue])

    const getAllEstablishment = async () => {
        try {
            const data = await api_allEstablishments();
            setAllEstablishment(data.data.data);
            setTotal(data.data.meta.pagination.total);
        } catch (error) {
            console.log(error)
        }
    }

    const getEstablishmentStatusTrue = async () => {
        try {
            const data = await api_allEstablishmentStatusTrue();
            setTotalTrue(data.data.meta.pagination.total);
        } catch (error) {
            console.log(error)
        }
    }

    const getEstablishmentStatusFalse = async () => {
        try {
            const data = await api_allEstablishmentStatusFalse();
            setTotalFalse(data.data.meta.pagination.total)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getAllEstablishment();
        getEstablishmentStatusTrue();
        getEstablishmentStatusFalse();
    }, [])

    const findAdministrador = (users: IAllEstablishment['attributes']['users']['data']) => {
        return users.find(user => user.attributes.role.data.attributes.name === 'admin');
    }

    const filteredEstablishments = allEstablishment.filter(e => {
        const nameMatch = e.attributes.name.toLowerCase().includes(searchTerm.toLowerCase());
        const adminMatch =
            adminFilter === 'all' ? true :
                adminFilter === 'with' ? findAdministrador(e.attributes.users.data) !== undefined :
                    findAdministrador(e.attributes.users.data) === undefined;
        return nameMatch && adminMatch;
    });

    const totalPages = Math.ceil(filteredEstablishments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEstablishments = filteredEstablishments.slice(startIndex, endIndex);

    const [editingEstablishment, setEditingEstablishment] = useState<number | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedAddress, setEditedAddress] = useState('');
    const [editedPhone, setEditedPhone] = useState('');


    const handleEditClick = (id: number, establishment: IAllEstablishment) => {
        reset()
        setEditingEstablishment(id);
        setEditedName(establishment.attributes.name);
        setEditedAddress(establishment.attributes.address);
        setEditedPhone(establishment.attributes.Phone);
    };

    const handleSaveEdit: SubmitHandler<IForm> = async (data: IForm) => {
        try {
            if (!editingEstablishment) return;

            const updatedData = {
                name: data.name,
                address: data.address,
                Phone: data.Phone,
                Comuna: data.Comuna,
            };

            await api_putEstablishment(editingEstablishment, updatedData);
            setEditingEstablishment(null);
            toast.success('Establecimiento actualizado correctamente.')
            getAllEstablishment();
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            toast.error('Ha ocurrido un error inesperado, porfavor contactate con soporte')
        }
    };
    const handleCancelEdit = () => {
        setEditingEstablishment(null);
    };

    const handleToggleStatus = async (id: number, status: boolean) => {
        try {
            await api_putStatusEstablishment(id, !status);
            toast.success('Estado del establecimiento actualizado con éxito')
            getAllEstablishment();
            getEstablishmentStatusTrue();
            getEstablishmentStatusFalse();
        } catch (error) {
            console.error("Error al cambiar el estado del establecimiento:", error);
            toast.error('Ha ocurrido un error inesperado')
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Card className="flex-1 cursor-pointer">
                        <CardHeader>
                            <CardTitle>
                                <Alert>
                                    <School className="h-4 w-4" />
                                    <AlertTitle>Ver establecimientos</AlertTitle>
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
                        <DialogTitle><School className="h-5 w-5 inline-block" /> Total de establecimientos</DialogTitle>
                        <DialogDescription>
                            Aquí podrás ver a detalle los establecimientos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-3 gap-2 h-full text-center">
                        <div className="flex flex-col">
                            <div className="p-2 col-span-1">
                                <Label>Total Establecimientos</Label>
                            </div>
                            <div className="border rounded-md w-full p-2 col-span-1 bg-yellow-300">
                                <Label>{total}</Label>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="p-2 col-span-1">
                                <Label>Activos</Label>
                            </div>
                            <div className="border rounded-md w-full p-2 col-span-1 bg-green-300">
                                <Label>{totalTrue}</Label>
                            </div>

                        </div>


                        <div className="flex flex-col">
                            <div className="p-2 col-span-1">
                                <Label>Desactivados</Label>
                            </div>
                            <div className="border rounded-md w-full p-2 col-span-1 bg-red-300">
                                <Label>{totalFalse}</Label>
                            </div>
                        </div>
                    </div>

                    <div className="my-4 space-y-2">
                        <div className="flex items-center space-x-2">
                            <Search className="w-5 h-5 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Buscar establecimiento por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow"
                            />
                        </div>
                        <Select value={adminFilter} onValueChange={(value: 'all' | 'with' | 'without') => setAdminFilter(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por administrador" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los establecimientos</SelectItem>
                                <SelectItem value="with">Con administrador</SelectItem>
                                <SelectItem value="without">Sin administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        {currentEstablishments.length === 0 && (
                            <div className="flex justify-center">
                                <WarningAlert message={'Sin Establecimientos creados '} />
                            </div>
                        )}
                        {currentEstablishments.length > 0 && currentEstablishments.map((e, i) => (
                            <TooltipProvider key={e.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Accordion type="single" collapsible>
                                            <AccordionItem value={`item-${i}`}>
                                                <AccordionTrigger>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{e.attributes.name}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`w-3 h-3 rounded-full ${findAdministrador(e.attributes.users.data) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleToggleStatus(e.id, e.attributes.status);
                                                                }}
                                                            >
                                                                {e.attributes.status ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>

                                                <AccordionContent>
                                                    <div className="grid grid-cols-2 text-center p-4">
                                                        <Label className="col-span-2 text-lg">Administrador del establecimiento: </Label>
                                                        <Label className="col-span-2 text-lg">{
                                                            (() => {
                                                                const admin = findAdministrador(e.attributes.users.data);
                                                                return admin
                                                                    ? `${admin.attributes.firstname} ${admin.attributes.first_lastname}`
                                                                    : 'No se encontró administrador';
                                                            })()
                                                        }</Label>
                                                    </div>

                                                    {editingEstablishment === e.id ? (
                                                        <form onSubmit={handleSubmit(handleSaveEdit)} className="grid grid-cols-2 gap-2 p-4">
                                                            <div>
                                                                <Label htmlFor="name">Nombre</Label>
                                                                <Input
                                                                    id="name"
                                                                    {...register('name')}
                                                                    defaultValue={editedName}
                                                                />
                                                                {errors.name && <span className="text-red-500">{errors.name.message}</span>}
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="address">Dirección</Label>
                                                                <Input
                                                                    id="address"
                                                                    {...register('address')}
                                                                    defaultValue={editedAddress}
                                                                />
                                                                {errors.address && <span className="text-red-500">{errors.address.message}</span>}
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="Phone">Teléfono</Label>
                                                                <Input
                                                                    id="Phone"
                                                                    {...register('Phone')}
                                                                    defaultValue={editedPhone}
                                                                />
                                                                {errors.Phone && <span className="text-red-500">{errors.Phone.message}</span>}
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="Region">Región</Label>
                                                                <Controller
                                                                    name="Region"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Selecciona una región" />
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
                                                                {errors.Region && <span className="text-red-500">{errors.Region.message}</span>}
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="Comuna">Comuna</Label>
                                                                <Controller
                                                                    name="Comuna"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watch('Region')}>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Selecciona una comuna" />
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
                                                                {errors.Comuna && <span className="text-red-500">{errors.Comuna.message}</span>}
                                                            </div>
                                                            <div className="col-span-2 flex justify-end gap-2">
                                                                <Button type="button" onClick={handleCancelEdit} variant="secondary">
                                                                    Cancelar
                                                                </Button>
                                                                <Button type="submit">
                                                                    Guardar
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-2 p-4">
                                                            <Label>Nombre: {e.attributes.name}</Label>
                                                            <Label>Dirección: {e.attributes.address}</Label>
                                                            <Label>Teléfono: {e.attributes.Phone}</Label>
                                                            <div className="col-span-2 flex justify-end">
                                                                <Button
                                                                    onClick={() => handleEditClick(e.id, e)}
                                                                    variant="outline"
                                                                >
                                                                    Editar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {!findAdministrador(e.attributes.users.data) && "Este establecimiento no tiene administrador"}
                                        {findAdministrador(e.attributes.users.data) && "Tiene administrador"}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                        </Button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={() => { setIsOpen(false) }}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

