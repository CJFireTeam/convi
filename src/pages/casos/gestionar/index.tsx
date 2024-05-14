 import ResumenCaseComponent from "../../../components/case/resumen.case.component";
 import ResumenDenunciaComponent from "../../../components/case/resumen.denuncia.component";
 import { api_cases, api_casesOne, api_updateCases } from '@/services/axios.services';
 import { useUserStore } from '@/store/userStore';
 import { categorizarSchema } from '@/validations/categorizarSchema';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { useRouter } from 'next/router';
 import React, { useEffect, useState } from 'react';
 import { SubmitHandler, useForm } from 'react-hook-form';
 import { toast } from 'react-toastify';
 import {z} from 'zod';
 import Image from "next/image";
 import fiscalia from "../../../../public/icons/fiscalia.png";
 import carabineros from "../../../../public/icons/carabineros.png";
 import pdi from "../../../../public/icons/pdi.png";


 interface faseI {
    fase:number;
}

export const faseSchema = z.object({
    fase: z.number(),
});

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
    } = useForm<faseI>({
        resolver: zodResolver(faseSchema),
    });

    const Submit = async (dataZod: faseI) => {
        /* try {
            if (!data) return;
            await api_updateCases(data.id,dataZod);
            toast.success('Se categorizo correctamente');
            localStorage.removeItem("case")
            localStorage.removeItem("derivado")
            back();

        } catch (error) {
            console.log(error);
            toast.error('ha ocurrido un error')
        } */
    };

    useEffect(() => {
        if (!data?.id) return;
        if (!data?.attributes.derived) back();
        setValue("fase", 3);
    }, [data])


    return (
        <div className="px-4 sm:px-6 lg:px-8 lg:w-9/12 md:w-9/12 w-auto mx-auto">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {data && <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg animate-fadein">
                            <ResumenCaseComponent data={data} caseId={caseId} derived={isDerived} />
                            <ResumenDenunciaComponent/>
                            <table className="w-full divide-y divide-gray-300">
                <thead>
                    <tr>
                        <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                            Complementar Denuncia
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-300'>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Informar</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                            <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" value="comunicar" />
                                <span className="ml-2">Comunicar a la dirección</span>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Denunciar</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                            <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" value="fiscalia" />
                                <Image
                                    className="ml-2"
                                    src={fiscalia}
                                    alt="fiscalia"
                                    width={65}
                                    layout="fixed"
                                    priority
                                /> 
                            </label>
                            <label className="inline-flex items-center ml-4">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" value="pdi" />
                                <Image
                                    className="ml-2"
                                    src={pdi}
                                    alt="pdi"
                                    width={65}
                                    layout="fixed"
                                    priority
                                />  
                            </label>
                            <label className="inline-flex items-center ml-4">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" value="carabineros" />
                                <Image
                                    className="ml-2"
                                    src={carabineros}
                                    alt="carabineros"
                                    width={60}
                                    layout="fixed"
                                    priority
                                />    
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Derivar</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                            <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" value="convi" />
                                <span className="ml-2">Equipo Convi</span>
                            </label>
                            <label className="inline-flex items-center ml-4">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" value="opd" />
                                <span className="ml-2">Oficina de protección derechos</span>
                            </label>
                            <label className="inline-flex items-center ml-4">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" value="otras" />
                                <span className="ml-2">Otras derivaciones</span>
                            </label>
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