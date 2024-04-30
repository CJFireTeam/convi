import React, { useState, useEffect } from 'react';
import { getComunas, getRegiones } from "../../services/local.services";
import {
    api_casesRoles,
    api_establishmentByComuna,
    api_usersByRole,
} from "../../services/axios.services";
import stablishmentI from "../../interfaces/establishment.interface";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider, useFormContext, FieldErrors } from 'react-hook-form';
import { suggestionSchema } from "@/validations/suggestionSchema";

interface Inputs {
    TextoSugerencia: string;
    colegio: number;
}
interface props {
    errors: FieldErrors<Inputs>
}


function Colegio({ errors }: props) {
    const { register, getValues } = useFormContext()

    const [regionList, setRegionList] = useState<string[]>([]);
    const [regionSelected, setRegionSelected] = useState<string>("");

    const [comunaList, setComunaList] = useState<string[]>([]);
    const [comunaSelected, setComunaSelected] = useState<string>("");

    const [establecimientoList, setEstablecimientoList] = useState<
        stablishmentI[]
    >([]);
    const [establecimientoSelected, setEstablecimientoSelected] =
        useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleChangeRegion = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setRegionSelected(event.target.value);
        if (event.target.value === "0") {
            return;
        }
        const comunas = await getComunas(event.target.value);
        setComunaList(comunas.data.data);
    };

    const handleChangeComuna = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setComunaSelected(event.target.value);
        if (Number(event.target.value) === 0) {
            return;
        }

        const data = await api_establishmentByComuna(event.target.value);
        setEstablecimientoList(data.data.data);

    };

    const handleChangeEstablecimiento = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setEstablecimientoSelected(Number(event.target.value));

    };

    useEffect(() => {
        const Regiones = async () => {
            const data = await getRegiones();
            setRegionList(data.data.data);
        };
        Regiones();
    }, []);

    return (
        <div className="grid grid-flow-col justify-stretch animate-fadein">
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Región:</label>
                <select id="region" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-10/12 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={regionSelected}
                    onChange={handleChangeRegion}>
                    <option value={0}>Seleccione la region:</option>
                    {regionList.map((region: string) => (
                        <option value={region} key={region}>
                            {region}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Comuna:</label>
                <select value={comunaSelected}
                    onChange={handleChangeComuna}
                    id="comuna" className="bg-gray-50 border border-gregisterray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-10/12 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value={""}>Seleccione la comuna: </option>
                    {comunaList.map((comuna: string) => (
                        <option value={comuna} key={comuna}>
                            {comuna}
                        </option>
                    ))}

                </select>
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Colegio:</label>
                <select  {...register('colegio', {
                    setValueAs: (value) => value === "" ? undefined : Number(value)
                })}
                    id="colegio" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-10/12 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="">Seleccione el establecimiento: {getValues("colegio")}</option>
                    {establecimientoList.map((stablishment: stablishmentI) => (
                        <option value={stablishment.id} key={stablishment.id}>
                            {stablishment.attributes.name}
                            {JSON.stringify(stablishment.id)}
                        </option>
                    ))}
                </select>
                <p className="text-error text-sm mt-1 text-wei font-semibold">{errors.colegio ? errors.colegio.message : ""}</p>
            </div>
        </div>

    )
};

function SugerenciaText({ errors }: props) {

    const { register, getValues } = useFormContext()

    return (
        <>
            <div className="flex items-center justify-center mb-4 ">
                <div className="mx-4 w-full">
                    <span>¿Cual es su sugerencia?</span>
                    <textarea {...register('TextoSugerencia', {
                        setValueAs: (value) => value === "" ? undefined : value
                    })}
                        className={`${errors.TextoSugerencia ? "border-error focus:ring-error" : "border-primary focus:ring-primary"} border rounded-lg bg-gray-100 focus:outline-none   p-2 resize-y w-full h-full`}
                        rows={6} id="TextoSugerencia"></textarea>
                    {errors.TextoSugerencia ? errors.TextoSugerencia.message : ""}
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center m-2">
                <div className="px-4 py-5 sm:px-6 text-left justify-start">
                    <span className="font-bold md:text-base text-sm">
                        Importante: su consulta o sugerencia será recepcionada por el equipo de convivencia
                        escolar del establecimiento y será respondida a la brevedad por esta misma aplicación,
                        podrá ver la respuesta en la sección Mis casos.
                    </span>
                </div>
                <button
                    className="flex rounded-full bg-indigo-600 px-10 py-1 text-sm md:text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    type="submit"
                ><span>Enviar</span></button>
            </div>
        </>
    );
};


export default function Sugerencia() {
    const methods = useForm<Inputs>({
        resolver: zodResolver(suggestionSchema),
    });
    const onSubmit = async (data: any) => {
        console.log(data)
        await trigger();
        
    }

    const {
        register,
        getValues,
        setValue,
        handleSubmit,
        trigger,
        watch,
        reset,
        control,
        formState: { errors },
    } = methods;


    const [destinatario, setDestinatario] = useState('');
    const handleDestinatarioChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setDestinatario(event.target.value);
    };



    return (
        <>
            <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-3 sm:px-6">
                    <h6 className="font-bold md:text-lg text-sm">
                        Rellene los siguientes campos para hacer la sugerencia.
                    </h6>
                </div>
                <div className="px-4 py-5 sm:p-6 bg-slate-50">
                    <div className="md:flex-1 md:mx-1 my-1 overflow-hidden shadow-xl rounded-lg bg-white shadow animate-fadein">
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)}>
                                <div className="px-4 py-5 sm:px-6 text-left ">
                                    <div className="max-w-sm mb-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione a quien va dirigida la sugerencia:</label>
                                        <select
                                            id="destinatario"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            value={destinatario}
                                            onChange={handleDestinatarioChange}
                                        >
                                            <option value="">Escoge una opción:</option>
                                            <option value="convi">Convi</option>
                                            <option value="colegio">Colegio</option>
                                        </select>
                                    </div>
                                    {destinatario === 'colegio' && (
                                        <>
                                            <Colegio errors={errors} />
                                            <SugerenciaText errors={errors} />
                                        </>
                                    )}
                                    {destinatario == 'convi' && (
                                        <SugerenciaText errors={errors} />
                                    )}


                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </>
    );
};