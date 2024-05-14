import React from "react";


export default function Configuracion() {
    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 lg:w-9/12 md:w-9/12 w-auto mx-auto">
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg animate-fadein">
                                <table className="w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                                                DERIVAR A :
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-300'>
                                        <tr>
                                            <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Nº de caso</th>
                                            <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}
