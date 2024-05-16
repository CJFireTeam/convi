 import ResumenCaseComponent from "../../../components/case/resumen.case.component";
 import ResumenComplaintComponent from "../../../components/case/resumen.complaint.component";
 import { api_cases, api_casesOne, api_updateCases, api_updateComplaint,api_complaint } from '@/services/axios.services';
 import { useUserStore } from '@/store/userStore';
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
 import { gestionarSchema } from '@/validations/gestionarSchema';


 interface GestionarI {
    options: string;
    // inform: string;
    // denounce: string;
    // derive: string;
    // fase:number;
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
    const getcomplaint = async (id: number) => {
        let assigned: number | undefined = undefined;
        try {
            const caseData = await api_complaint({caseId:id});
            // setData(caseData.data.data);
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

    useEffect(() =>{
        if(!data) return
        getcomplaint(data.id)
    },[data]);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<GestionarI>({
        resolver: zodResolver(gestionarSchema),
    });

    const Submit = async (dataZod: GestionarI) => {
        try {
           console.log(dataZod)
           console.log(dataZod.options)
           console.log(dataZod)
           console.log(data?.id)
           
             if (!data) return;
            // await api_updateCases(data.id, fase:3);
            await api_updateComplaint(25,dataZod);
            //toast.success('Se complemento correctamente');
            // localStorage.removeItem("case")
            // localStorage.removeItem("derivado")
            // back();
        } catch (error) {
            console.log(error);
            toast.error('ha ocurrido un error')
        }
    };
    const onSubmit: SubmitHandler<GestionarI> = (data) => Submit(data)
    // useEffect(() => {
    //     if (!data?.id) return;
    //     if (!data?.attributes.derived) back();
    //     setValue("fase",3);
    // }, [data])
    return (
        <>
         <form onSubmit={handleSubmit(Submit)}>
            <div className="px-4 sm:px-6 lg:px-8 lg:w-9/12 md:w-9/12 w-auto mx-auto">
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            {data && <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg animate-fadein">
                                <ResumenCaseComponent data={data} caseId={caseId} derived={isDerived} />
                                <ResumenComplaintComponent/>
                                <table className="w-full divide-y divide-gray-300 ">
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
                                                <label className="inline-flex items-center ml-4 mr-4 mt-2 mb-2">
                                                    <input type="checkbox" {...register('options', {setValueAs: (value) => value === "" ? undefined : value,})} value="comunicar" className="form-checkbox h-5 w-5 text-gray-600" />
                                                    <span className="ml-2">Comunicar a la dirección</span>
                                                </label>
                                            
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Denunciar</th>
                                            <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900 ">
                                                <label className="inline-flex items-center ml-4 mr-4 mt-2 mb-2">
                                                    <input type="checkbox" {...register('options', {setValueAs: (value) => value === "" ? undefined : value,})} value="fiscalia" className="form-checkbox h-5 w-5 text-gray-600" />
                                                    <Image
                                                        className="ml-2"
                                                        src={fiscalia}
                                                        alt="fiscalia"
                                                        width={50}
                                                        height={50}
                                                        style={{ width: '50%', height: 'auto' }}
                                                    /> 
                                                </label>
                                                <label className="inline-flex items-center ml-4 mr-4 mt-2 mb-2">
                                                    <input type="checkbox" {...register('options', {setValueAs: (value) => value === "" ? undefined : value,})} value="pdi" className="form-checkbox h-5 w-5 text-gray-600" />
                                                    <Image
                                                        className="ml-2"
                                                        src={pdi}
                                                        alt="pdi"
                                                        width={50}
                                                        height={50}
                                                        priority
                                                        style={{ width: '50%', height: 'auto' }}
                                                    
                                                    />  
                                                </label>
                                                <label className="inline-flex items-center ml-4 mr-4 mt-2 mb-2">
                                                    <input type="checkbox" {...register('options', {setValueAs: (value) => value === "" ? undefined : value,})} value="carabineros" className="form-checkbox h-5 w-5 text-gray-600" />
                                                    <Image
                                                        className="ml-2"
                                                        src={carabineros}
                                                        alt="carabineros"
                                                        width={50}
                                                        height={50}
                                                        priority
                                                        style={{ width: '50%', height: 'auto' }}
                                                       
                                                    />    
                                                </label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Derivar</th>
                                            <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                                                <label className="inline-flex items-center ml-4 mr-4 mt-2 mb-2">
                                                    <input type="checkbox" {...register('options', {setValueAs: (value) => value === "" ? undefined : value,})} value="convi" className="form-checkbox h-5 w-5 text-gray-600" />
                                                    <span className="ml-2">Equipo Convi</span>
                                                </label>
                                                <label className="inline-flex items-center ml-4 mr-4 mt-2 mb-2">
                                                <input type="checkbox" {...register('options', {setValueAs: (value) => value === "" ? undefined : value,})} value="opd" className="form-checkbox h-5 w-5 text-gray-600" />
                                                    <span className="ml-2">Oficina de protección derechos</span>
                                                </label>
                                                <label className="inline-flex items-center ml-4 mr-4 mt-2 mb-2">
                                                    <input type="checkbox" {...register('options', {setValueAs: (value) => value === "" ? undefined : value,})} value="otras" className="form-checkbox h-5 w-5 text-gray-600" />
                                                    <span className="ml-2">Otras derivaciones</span>
                                                </label>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>}
                            <div className='flex justify-center'>
                             {errors.options?.message && (<p className="text-error text-sm ml-4 mr-4 mt-1 mb-1">{errors.options.message}</p>)}
                            </div>
                            <div className='flex justify-center'>
                                
                                    <button type="submit" className="px-4 rounded-md bg-primary my-5 px-2 py-2 text-center text-sm font-semibold text-white hover:brightness-90">
                                            Complementar
                                    </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        </>
    );
}