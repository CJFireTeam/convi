enum UserTypes {
    "apoderado" = "Apoderado",
    "alumno" = "Alumno",
    "otro" = "",
}
export default function ResumenCaseComponent({ data, caseId, derived }: { data: caseInterface, caseId: string | null, derived: boolean }){
    const paseDate = (date: string) => {
        const fecha = new Date(date);

        const dia = String(fecha.getDate()).padStart(2, "0");
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const año = fecha.getFullYear();

        return `${dia}/${mes}/${año}`;
    };
    const parseTime = (date: string) => {
        const time = new Date(date);

        const hours = String(time.getHours()).padStart(2, "0");
        const minutes = String(time.getMinutes()).padStart(2, "0");
        const seconds = String(time.getSeconds()).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    };

    return (<>
        <div className="overflow-x-auto rounded border-2 shadow hover:shadow-md">
            <table className="w-full divide-y divide-gray-300">
                <thead>
                    <tr>
                        <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                            Identificación del Denunciante
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-300'>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Nº de caso</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                            {data.id}
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Denunciante</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">{data.attributes.created.data.attributes.firstname} {data.attributes.created.data.attributes.first_lastname}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Categoria</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">{data.attributes.created.data.attributes.tipo === "otro" ? data.attributes.created.data.attributes.role.data.attributes.name : data.attributes.created.data.attributes.tipo}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Teléfono</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">{data.attributes.created.data.attributes.phone}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Correo</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal text-gray-900">{data.attributes.created.data.attributes.email}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Domicilio</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">{data.attributes.created.data.attributes.direccion}, {data.attributes.created.data.attributes.comuna} </td>
                    </tr>
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
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">{new Date(data.attributes.createdAt).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Hora</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">{parseTime(data.attributes.createdAt)}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Participantes</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                            {data.attributes.who.values.length > 1 ?
                                data.attributes.who.values.join(' + ') :
                                data.attributes.who.values}
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">Lugar</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                            {data.attributes.where.values.length > 1 ?
                                data.attributes.where.values.join(' + ') :
                                data.attributes.where.values}
                        </td>
                    </tr>
                    <tr>
                        <th className="px-3 py-3.5 w-1/3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">¿Cuándo ocurrió?</th>
                        <td className="px-3 py-3.5 w-2/3 text-left text-sm font-normal	 text-gray-900">
                            {data.attributes.when.values.length > 1 ?
                                data.attributes.when.values.join(' + ') :
                                data.attributes.when.values}
                        </td>
                    </tr>
                </tbody>
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
                        <span
                                className="ring-primary block mx-auto text-left rounded-md py-2 px-4 w-full text-sm font-semibold text-gray-900 resize-none"
                                
                            >
                                {data.attributes.story}
                            </span>
                        </td>
                    </tr>

                </tbody>
                <thead>
                    <tr>
                        <th colSpan={2} className="px-3 py-3.5 text-center bg-gray-50">
                            Medidas
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-300'>
                    <tr>
                        <td className="px-3 py-3.5">
                            <span
                                className="ring-primary block mx-auto text-left rounded-md py-2 px-4 w-full text-sm font-semibold text-gray-900 resize-none"
                                
                            >
                                {data.attributes.measures}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>)
}