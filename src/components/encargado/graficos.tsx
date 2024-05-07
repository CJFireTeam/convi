import React from 'react';
import Grafico1 from './grafico1';
import Grafico2 from './grafico2';



export default function Grafico() {
    return (
        <>
            <div className="flex flex-col md:flex-row lg:flex-row justify-around gap-7">
                <div className="rounded-lg border border-gray-400 shadow-md hover:shadow-xl transition duration-300 ease-in-out">
                    <div className="bg-gray-300 px-6 py-4 rounded-t-lg">
                        <div className="space-y-10 divide-y divide-gray-900/10 animate-fadein">
                            <h1 className="text-base font-semibold leading-6 text-gray-900 text-center">
                                Denuncias Por Ciclos
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-6">
                        <Grafico2 />
                    </div>
                </div>
                
                <div className="rounded-lg border border-gray-400 shadow-md hover:shadow-xl transition duration-300 ease-in-out">
                    <div className="bg-gray-300 px-6 py-4 rounded-t-lg">
                        <div className="space-y-10 divide-y divide-gray-900/10 animate-fadein">
                            <h1 className="text-base font-semibold leading-6 text-gray-900 text-center">

                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-6">
                        <Grafico1 />
                    </div>
                </div>
            </div>
        </>
    );
}
