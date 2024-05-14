 import ResumenCaseComponent from "../../../components/case/resumen.case.component";
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
export default function Gestionar() {
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
    return (
        <div className="px-4 sm:px-6 lg:px-8 lg:w-9/12 md:w-9/12 w-auto mx-auto">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {data && <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg animate-fadein">
                            <ResumenCaseComponent data={data} caseId={caseId} derived={isDerived} />
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
                                </tbody>
                            </table>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    );
}