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
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { Label } from "../ui/label";
import { ChevronLeft, ChevronRight, Search, SquareUser, Lock, LockOpen, Edit } from 'lucide-react';
import { api_getActiveAdministrador, api_getAllAdministrador, api_getBlockAdministrador, api_getpendientAdministrador, api_putBlockedUser, api_putUserAdmin, api_role } from "@/services/axios.services";
import { IAdmin } from "@/interfaces/admin.interface";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "react-toastify";
import { Separator } from "../ui/separator";
import { getComunas, getRegiones } from "@/services/local.services";
import { api_allEstablishments } from "@/services/axios.services";
import { IAllEstablishment } from "@/interfaces/establishment.interface";

interface IRoles {
    id: number;
    name: string;
}

export default function VerAdministradores() {
    const { bearer, setRole, user, role } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);

    const [totalAdmin, setTotalAdmin] = useState<IAdmin[]>([]);
    const [activeAdmin, setActiveAdmin] = useState<IAdmin[]>([]);
    const [blockAdmin, setBlockAdmin] = useState<IAdmin[]>([]);
    const [pendientAdmin, setPendientAdmin] = useState<IAdmin[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [adminFilter, setAdminFilter] = useState<'all' | 'active' | 'pending' | 'blocked' | 'with_establishment' | 'without_establishment'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingAdmin, setEditingAdmin] = useState<IAdmin | null>(null);
    const [allEstablishments, setAllEstablishments] = useState<IAllEstablishment[]>([]);
    const [selectedEstablishment, setSelectedEstablishment] = useState<number | null>(null);
    const itemsPerPage = 10;

    const getAllAdministradores = async () => {
        try {
            const data = await api_getAllAdministrador();
            setTotalAdmin(data.data);
            const data2 = await api_getActiveAdministrador();
            setActiveAdmin(data2.data);
            const data3 = await api_getBlockAdministrador();
            setBlockAdmin(data3.data);
            const data4 = await api_getpendientAdministrador();
            setPendientAdmin(data4.data)
        } catch (error) {
            console.log(error);
        }
    }

    const loadEstablishments = async () => {
        try {
            const response = await api_allEstablishments();
            setAllEstablishments(response.data.data);
        } catch (error) {
            console.error("Error al cargar establecimientos:", error);
            toast.error("Error al cargar establecimientos");
        }
    };

    useEffect(() => {
        getAllAdministradores();
        loadEstablishments();
    }, [])

    const filteredAdmins = totalAdmin.filter(admin => {
        const nameMatch = `${admin.firstname} ${admin.first_lastname}`.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch =
            adminFilter === 'all' ? true :
                adminFilter === 'active' ? admin.confirmed && !admin.blocked :
                    adminFilter === 'pending' ? !admin.confirmed :
                        adminFilter === 'blocked' ? admin.blocked :
                            adminFilter === 'with_establishment' ? admin.establishment !== null :
                                adminFilter === 'without_establishment' ? admin.establishment === null :
                                    true;
        return nameMatch && statusMatch;
    });

    const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAdmins = filteredAdmins.slice(startIndex, endIndex);

    const handleEditAdmin = async (admin: IAdmin) => {
        setEditingAdmin(admin);
        setSelectedRegion(admin.region);
        const comunas = await fetchComunas(admin.region);
        setComunaList(comunas);
        setSelectedComuna(admin.comuna);
        setSelectedEstablishment(admin.establishment?.id || null);
    }

    const handleBlockUser = async (id: number, blocked: boolean) => {
        try {
            await api_putBlockedUser(id, !blocked);
            toast.success('Usuario bloqueado con éxito')
            await getAllAdministradores();
        } catch (error) {
            console.error("Error al cambiar el estado de bloqueo:", error);
            toast.error('ha ocurrido un error inesperado')
        }
    };

    const [selectedRegion, setSelectedRegion] = useState(editingAdmin?.region || '');
    const [selectedComuna, setSelectedComuna] = useState(editingAdmin?.comuna || '');

    const [regionList, setRegionList] = useState<string[]>([]);
    useEffect(() => {
        const Regiones = async () => {
            const data = await getRegiones();
            setRegionList(data.data.data);
        };
        Regiones();
    }, []);

    const [comunaList, setComunaList] = useState<string[]>([]);

    const fetchComunas = async (region: string) => {
        try {
            const data = await getComunas(region);
            return data.data.data;
        } catch (error) {
            console.error("Error al obtener comunas:", error);
            return [];
        }
    };

    useEffect(() => {
        if (editingAdmin) {
            setSelectedRegion(editingAdmin.region);
            fetchComunas(editingAdmin.region).then(comunas => {
                setComunaList(comunas);
                setSelectedComuna(editingAdmin.comuna);
            });
            setSelectedEstablishment(editingAdmin.establishment?.id || null);
        }
    }, [editingAdmin]);

    const [loading, setLoading] = useState(false);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Card className="flex-1 cursor-pointer">
                        <CardHeader>
                            <CardTitle>
                                <Alert>
                                    <SquareUser className="h-4 w-4" />
                                    <AlertTitle>Ver Administradores</AlertTitle>
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
                        <DialogTitle><SquareUser className="h-5 w-5 inline-block" /> Total de Administradores</DialogTitle>
                        <DialogDescription>
                            Aquí podrás ver a detalle los administradores.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-4 gap-2 h-full text-center">
                        <div className="flex flex-col">
                            <div className="p-2 ">
                                <Label>Total</Label>
                            </div>
                            <div className="border rounded-md w-full p-2 bg-yellow-300">
                                <Label>{totalAdmin.length}</Label>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="p-2 ">
                                <Label>Activos</Label>
                            </div>
                            <div className="border rounded-md w-full p-2 bg-green-300">
                                <Label>{activeAdmin.length}</Label>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="p-2 ">
                                <Label>Pendientes</Label>
                            </div>
                            <div className="border rounded-md w-full p-2 bg-gray-300">
                                <Label>{pendientAdmin.length}</Label>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="p-2 ">
                                <Label>Bloqueados</Label>
                            </div>
                            <div className="border rounded-md w-full p-2 bg-red-300">
                                <Label>{blockAdmin.length}</Label>
                            </div>
                        </div>
                    </div>

                    <div className="my-4 space-y-2">
                        <div className="flex items-center space-x-2">
                            <Search className="w-5 h-5 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Buscar administrador por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow"
                            />
                        </div>
                        <Select value={adminFilter} onValueChange={(value: 'all' | 'active' | 'pending' | 'blocked' | 'with_establishment' | 'without_establishment') => setAdminFilter(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los administradores</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="pending">Pendientes</SelectItem>
                                <SelectItem value="blocked">Bloqueados</SelectItem>
                                <SelectItem value="with_establishment">Con establecimiento</SelectItem>
                                <SelectItem value="without_establishment">Sin establecimiento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        {currentAdmins.map((admin, i) => (
                            <TooltipProvider key={admin.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Accordion type="single" collapsible>
                                            <AccordionItem value={`item-${i}`}>
                                                <AccordionTrigger>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{admin.firstname} {admin.first_lastname}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`w-3 h-3 rounded-full ${admin.establishment ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleBlockUser(admin.id, admin.blocked);
                                                                }}
                                                                disabled={!admin.confirmed}
                                                            >
                                                                {admin.blocked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid grid-cols-2 gap-2 p-4">
                                                        {admin.establishment ? (
                                                            <>
                                                                <Label className="col-span-2 mb-2">Datos del establecimiento: </Label>
                                                                <Label>Establecimiento: {admin.establishment.name}</Label>
                                                                <Label>Dirección: {admin.establishment.address}</Label>
                                                                <Label>Comuna: {admin.establishment.Comuna}</Label>
                                                                <Separator className="my-4 col-span-2" />
                                                            </>
                                                        ) : (<>
                                                            <Label className="col-span-2 text-red-500">Sin establecimiento asignado</Label>
                                                            <Separator className="my-4 col-span-2" />
                                                        </>)}
                                                        <Label className="col-span-2 mb-2">Datos del administrador: </Label>
                                                        <Label>Nombre completo: {admin.firstname} {admin.secondname} {admin.first_lastname} {admin.second_lastname}</Label>
                                                        <Label>Estado: {admin.confirmed ? (admin.blocked ? 'Bloqueado' : 'Activo') : 'Pendiente'}</Label>
                                                        <Label>Email: {admin.email}</Label>
                                                        <Label>Region: {admin.region}</Label>
                                                        <Label>Comuna: {admin.comuna}</Label>
                                                        <Label>Direccion: {admin.direccion}</Label>
                                                        <Label>Telefono: {admin.phone}</Label>
                                                        <div className="col-span-2 flex justify-end">
                                                            <Button
                                                                onClick={() => handleEditAdmin(admin)}
                                                                disabled={admin.blocked}
                                                                variant="outline"
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Editar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {!admin.establishment ? "Este administrador no tiene establecimiento asignado" : 'Establecimiento asignado.'}
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

            <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
                <DialogContent className="sm:max-w-[700px] w-[102vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Administrador</DialogTitle>
                    </DialogHeader>
                    {editingAdmin && (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    setLoading(true)
                                    const formData = new FormData(e.target as HTMLFormElement);

                                    const updatedData = {
                                        firstname: formData.get("firstname") as string,
                                        secondname: formData.get("secondname") as string,
                                        first_lastname: formData.get("first_lastname") as string,
                                        second_lastname: formData.get("second_lastname") as string,
                                        email: formData.get("email") as string,
                                        username: formData.get("username") as string,
                                        phone: formData.get("phone") as string,
                                        direccion: formData.get("direccion") as string,
                                        region: formData.get("region") as string,
                                        comuna: formData.get("comuna") as string,
                                        establishment: selectedEstablishment ? Number(selectedEstablishment) : null,
                                    };

                                    await api_putUserAdmin(editingAdmin.id, updatedData);
                                    toast.success("Administrador actualizado con éxito.");
                                    await getAllAdministradores();
                                } catch (error) {
                                    console.error("Error al actualizar administrador:", error);
                                    toast.error("Ocurrió un error al actualizar el administrador.");
                                    setLoading(false);
                                } finally {
                                    setEditingAdmin(null);
                                    setLoading(false);
                                }
                            }}
                        >
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="firstname" className="text-right">Nombre</Label>
                                    <Input
                                        id="firstname"
                                        name="firstname"
                                        defaultValue={editingAdmin.firstname}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="secondname" className="text-right">Segundo Nombre</Label>
                                    <Input
                                        id="secondname"
                                        name="secondname"
                                        defaultValue={editingAdmin.secondname}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="first_lastname" className="text-right">Primer Apellido</Label>
                                    <Input
                                        id="first_lastname"
                                        name="first_lastname"
                                        defaultValue={editingAdmin.first_lastname}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="second_lastname" className="text-right">Segundo Apellido</Label>
                                    <Input
                                        id="second_lastname"
                                        name="second_lastname"
                                        defaultValue={editingAdmin.second_lastname}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        defaultValue={editingAdmin.email}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="text-right">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        defaultValue={editingAdmin.username}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={editingAdmin.phone}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="direccion" className="text-right">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        name="direccion"
                                        defaultValue={editingAdmin.direccion}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="region" className="text-right">Región</Label>
                                    <Select
                                        name="region"
                                        value={selectedRegion}
                                        onValueChange={async (value) => {
                                            setSelectedRegion(value);
                                            const comunas = await fetchComunas(value);
                                            setComunaList(comunas);
                                            setSelectedComuna('');
                                        }}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Selecciona una región" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-52">
                                            {regionList.map((region) => (
                                                <SelectItem key={region} value={region}>
                                                    {region}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="comuna" className="text-right">Comuna</Label>
                                    <Select
                                        name="comuna"
                                        value={selectedComuna}
                                        onValueChange={(value) => setSelectedComuna(value)}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Selecciona una comuna" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-52">
                                            {comunaList.map((comuna) => (
                                                <SelectItem key={comuna} value={comuna}>
                                                    {comuna}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="establishment" className="text-right">Rol</Label>
                                    <Input
                                        id="role"
                                        name="role"
                                        defaultValue={editingAdmin.role.name}
                                        className="col-span-3"
                                        readOnly
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="establishment" className="text-right">Establecimiento</Label>
                                    <Select
                                        name="establishment"
                                        value={selectedEstablishment === null ? "null" : selectedEstablishment?.toString()}
                                        onValueChange={(value) => setSelectedEstablishment(value === "null" ? null : Number(value))}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Selecciona un establecimiento" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-52">
                                            <SelectItem value="null">Sin establecimiento</SelectItem>
                                            {allEstablishments.map((establishment) => (
                                                <SelectItem key={establishment.id} value={establishment.id.toString()}>
                                                    {establishment.attributes.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    {!loading ? 'Guardar cambios' : <> <span className="loading loading-spinner loading-md"></span></>}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditingAdmin(null)}>
                                    Cancelar
                                </Button>
                            </DialogFooter>
                        </form>

                    )}
                </DialogContent>
            </Dialog>

        </>
    )
}