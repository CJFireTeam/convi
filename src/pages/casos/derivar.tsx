/* import { api_casesOne } from "@/services/axios.services";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function derivar() {
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

    return (<>
        <div className="px-4 sm:px-6 lg:px-8 lg:w-8/12 md:w-9/12 w-auto mx-auto">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg animate-fadein">
                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                                                RESUMEN:
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className='divide-y divide-gray-300'>
                                        <tr>
                                            <td className="px-3 text-center py-3.5 w-full text-sm font-semibold border-b text-gray-900">
                                                Caso N° {data?.id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 text-center py-3.5 w-full text-sm font-semibold border-b text-gray-900">
                                                Categoria: {data?.attributes.category}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className="w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                                                Derivar a:
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-300'>
                                        <tr>
                                            <th className="px-3 py-3.5 w-2/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300"></th>
                                            <td className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900">

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>);
} */