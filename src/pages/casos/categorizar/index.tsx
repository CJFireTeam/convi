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
    fase: number;
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
            await api_updateCases(data.id, dataZod);
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
        setValue("fase", 2);
    }, [data])

    if (data) return (
        <>
            <ResumenCaseComponent data={data} caseId={caseId} derived={isDerived} />


            <form onSubmit={handleSubmit(onSubmit)} className="px-2 py-4 border-2 rounded shadow hover:shadow-md	 mt-4 flex md:flex-row flex-col lg:flex-row xl:flex-row 2xl:flex-row justify-center md:justify-evenly py-2">
                <div className="">
                    <label className='block'>Categorizar: </label>
                    <select {...register("category", {
                        setValueAs: (value) =>
                            value === "" ? undefined : value,
                    })} className='w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-gray-900'>
                        <option value="">Seleccionar categoria</option>
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
                    {errors.category?.message && (<p className="text-error text-sm">{errors.category.message}</p>)}

                </div>

                <div className='flex justify-center'>
                    <button type="submit" className="px-4 rounded-md bg-primary my-5 px-2 py-2 text-center text-sm font-semibold text-white hover:brightness-90">
                        Categorizar
                    </button>
                </div>
            </form>
        </>
    );
}
