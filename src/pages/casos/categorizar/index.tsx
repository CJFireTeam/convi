import { api_cases, api_casesOne, api_updateCases } from '@/services/axios.services';
import { useUserStore } from '@/store/userStore';
import { categorizarSchema } from '@/validations/categorizarSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';


interface CategorizarI {
    category: string;
    fase:number;
}

function Tabla({ data, caseId, derived }: { data: caseInterface, caseId: string | null, derived: boolean }) {
    const paseDate = (date: string) => {
        const fecha = new Date(date);

        const dia = String(fecha.getDate()).padStart(2, "0");
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const año = fecha.getFullYear();

        return `${dia}/${mes}/${año}`;
    };
    const parseTime = (date: string) => {
        const time = new Date(date);

        const hours = String(time.getHours()).padStart(2, "0");
        const minutes = String(time.getMinutes()).padStart(2, "0");
        const seconds = String(time.getSeconds()).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    };


    return (<>
        <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-300">
                <thead>
                    <tr>
                        <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                            Identificación del Denunciante
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-300'>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Nº de caso</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">
                            {data.id}
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Denunciante</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{data.attributes.created.data.attributes.firstname} {data.attributes.created.data.attributes.first_lastname}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Categoria</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{data.attributes.created.data.attributes.role.data.attributes.name}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Teléfono</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{data.attributes.created.data.attributes.phone}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Correo</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{data.attributes.created.data.attributes.email}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Domicilio</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{data.attributes.created.data.attributes.direccion}, {data.attributes.created.data.attributes.comuna} </td>
                    </tr>
                </tbody>
                <thead>
                    <tr>
                        <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                            Datos Denuncia
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-300'>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Fecha</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{paseDate(data.attributes.createdAt)}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Hora</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{parseTime(data.attributes.createdAt)}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Participantes</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">
                            {data.attributes.who.values.length > 1 ?
                                data.attributes.who.values.join(' + ') :
                                data.attributes.who.values}
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Lugar</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">
                            {data.attributes.where.values.length > 1 ?
                                data.attributes.where.values.join(' + ') :
                                data.attributes.where.values}
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">¿Cuándo ocurrió?</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">
                            {data.attributes.when.values.length > 1 ?
                                data.attributes.when.values.join(' + ') :
                                data.attributes.when.values}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>)
}




export default function Categorizar() {
    const { user, GetRole } = useUserStore();
    const [caseId, setCaseId] = useState<string | null>(null);
    const [isDerived, setIsDerived] = useState<boolean>(false);
    const { back } = useRouter();

    const getData = async (id: string) => {
        let assigned: number | undefined = undefined;
        try {
            if (GetRole() !== "Authenticated") {
                assigned = user?.id
            }
            const caseData = await api_casesOne(id);
            setData(caseData.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (user?.id === 0) return;
        const storedCaseId = localStorage.getItem("case");
        if (!storedCaseId) return back();
        getData(storedCaseId)
        const storedDerived = localStorage.getItem("derivado");
        const isDerivedValue = storedDerived === "true";
        setCaseId(storedCaseId);
        setIsDerived(isDerivedValue);
    }, [user]);
    const [data, setData] = useState<caseInterface>();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CategorizarI>({
        resolver: zodResolver(categorizarSchema),
    });

    const Submit = async (dataZod: CategorizarI) => {
        try {
            if (!data) return;
            await api_updateCases(data.id,dataZod);
            toast.success('Se categorizo correctamente');
            localStorage.removeItem("case")
            localStorage.removeItem("derivado")
            back();

        } catch (error) {
            console.log(error);
            toast.error('ha ocurrido un error')
        }
    };
    const onSubmit: SubmitHandler<CategorizarI> = (data) => Submit(data)
    useEffect(() => {
        if (!data?.id) return;
        if (!data?.attributes.derived) back();
        setValue("fase",2);
    }, [data])

    return (
        <div className="px-4 sm:px-6 lg:px-8 lg:w-9/12 md:w-9/12 w-auto mx-auto">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {data && <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg animate-fadein">
                            <Tabla data={data} caseId={caseId} derived={isDerived} />
                            <table className="w-full divide-y divide-gray-300 border-t border-gray-300">
                                <thead>
                                    <tr>
                                        <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                                            Relato de los hechos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-300'>
                                    <tr>
                                        <td className="px-3 py-3.5">
                                            <textarea
                                                className="ring-primary block mx-auto text-left rounded-md py-2 px-4 w-full text-sm font-semibold text-gray-900 resize-none"
                                                value={data.attributes.story}
                                                readOnly
                                            />
                                        </td>
                                    </tr>


                                    <tr>
                                        <td className="px-3 py-3.5 w-full flex justify-center font-semibold text-gray-900">
                                            <form onSubmit={handleSubmit(onSubmit)}>
                                                <div className='grid grid-cols-4 gap-4'>
                                                    <div className="col-span-2">
                                                        <label className='block'>Categorizar: </label>
                                                        <select {...register("category", {
                                                            setValueAs: (value) =>
                                                                value === "" ? undefined : value,
                                                        })}  className='w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 text-sm text-gray-900'>
                                                            <option value="Aula Segura">Aula Segura</option>
                                                            <option value="Prácticas abusivas sexuales">Prácticas abusivas sexuales</option>
                                                            <option value="Maltrato físico y psicológico entre pares">Maltrato físico y psicológico entre pares</option>
                                                            <option value="Embarazo y paternidad adolescente">Embarazo y paternidad adolescente</option>
                                                            <option value="Vulneración de derechos">Vulneración de derechos</option>
                                                            <option value="Consumo de drogas y alcohol">Consumo de drogas y alcohol</option>
                                                            <option value="Tendencia o actos suicidas">Tendencia o actos suicidas</option>
                                                            <option value="Bullying">Bullying</option>
                                                            <option value="Otros">Otros</option>
                                                        </select>
                                                    </div>
                                                    <button type="submit" className="col-start-4  block rounded-md bg-primary my-5 px-2 py-2 text-center text-sm font-semibold text-white hover:brightness-90">
                                                        Enviar
                                                    </button>
                                                </div>
                                            </form>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
