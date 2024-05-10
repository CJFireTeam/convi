import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { api_casesByFase } from '../../services/axios.services';
import GraficoFases from './graficoFases';



export default function Grafico() {
    const { user, GetRole, role } = useUserStore();
    const [counts,setCounts] = useState<number[]>([0,0,0,0])
    
    const updateCounts = (fase: number, count: number) => {
        setCounts(prevCounts => {
            const newCounts = [...prevCounts];
            newCounts[fase-1] = count;
            return newCounts;
        });
    };
    
    const dataFaseByNumber = async (fase:number) => {
        let assigned: number | undefined = undefined;
        if (GetRole() !== "Authenticated") {
            assigned = user?.id
          }
        const data = await api_casesByFase({ createdBy: user?.id, userId: assigned,fase:fase })
        updateCounts(fase, data.data.meta.pagination.total);
    }

    useEffect(() => {
        if (user?.id === 0) return;
        dataFaseByNumber(1);
        dataFaseByNumber(2);
        dataFaseByNumber(3);
        dataFaseByNumber(4);
      }, [user]);
    return (
        <>
            <div className="flex flex-col md:flex-row lg:flex-row justify-start gap-7">
                <div className="rounded-lg border border-gray-400 shadow-md hover:shadow-xl transition duration-300 ease-in-out">
                    <div className="bg-gray-300 px-6 py-4 rounded-t-lg">
                        <div className="space-y-10 divide-y divide-gray-900/10 animate-fadein">
                            <h1 className="text-base font-semibold leading-6 text-gray-900 text-center">
                                Denuncias Por Ciclos 
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-6">
                        <GraficoFases dataNumbers={counts}/>
                    </div>
                </div>
                
                {/* <div className="rounded-lg border border-gray-400 shadow-md hover:shadow-xl transition duration-300 ease-in-out">
                    <div className="bg-gray-300 px-6 py-4 rounded-t-lg">
                        <div className="space-y-10 divide-y divide-gray-900/10 animate-fadein">
                            <h1 className="text-base font-semibold leading-6 text-gray-900 text-center">

                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-6">
                        <Grafico1 />
                    </div>
                </div> */}
            </div>
        </>
    );
}
