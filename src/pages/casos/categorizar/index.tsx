import { api_cases } from '@/services/axios.services';
import { useUserStore } from '@/store/userStore';
import React, { useEffect, useState } from 'react';

function Tabla({ data }: { data: caseInterface[] }) {
    const paseDate = (date: string) => {
        const fecha = new Date(date);

        const dia = fecha.getDate();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const año = fecha.getFullYear();

        return `${dia}/${mes}/${año}`;
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
                    {data.map((person) => (<React.Fragment key={person.id}>
                        {person.attributes.derived ? (<>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Nº de caso</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">
                                {person.id}
                                </td>
                            </tr>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Denunciante</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                            </tr>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Categoria</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                            </tr>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Teléfono</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                            </tr>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Correo</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                            </tr>
                            <tr>
                                <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Domicilio</th>
                                <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                            </tr>
                        </>
                        ) : null}
                    </React.Fragment>))}

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
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Hora</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Participantes</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Lugar</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">¿Cuándo ocurrió?</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900">Dato 1</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>)
}




export default function Categorizar() {
    const { user, GetRole } = useUserStore();

    const getData = async () => {
        let assigned: number | undefined = undefined;
        try {
            if (GetRole() !== "Authenticated") {
                assigned = user?.id
            }
            const data = await api_cases({ createdBy: user?.id, userId: assigned });
            setData(data.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (user?.id === 0) return;
        getData();
    }, [user]);
    const [data, setData] = useState<caseInterface[]>([]);

    return (
        <div className="px-4 sm:px-6 lg:px-8 lg:w-9/12 md:w-9/12 w-auto mx-auto">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <Tabla data={data} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
