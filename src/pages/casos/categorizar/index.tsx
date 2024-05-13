import { api_cases, api_casesOne } from '@/services/axios.services';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

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
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{data.attributes.who.values.length === 1 ? data.attributes.who.values : data.attributes.who.values }</td>
                            </tr>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Lugar</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                            </tr>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">¿Cuándo ocurrió?</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">{data.attributes.when.values}</td>
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


    useEffect(() => {
        if (!data?.id) return;
        if (!data?.attributes.derived) back();
    }, [data])

    return (
        <div className="px-4 sm:px-6 lg:px-8 lg:w-9/12 md:w-9/12 w-auto mx-auto">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {data && <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg animate-fadein">
                            <Tabla data={data} caseId={caseId} derived={isDerived} />
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
