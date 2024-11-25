import Head from "next/head";
import WarningAlert from "../alerts/warningAlert";

export default function SinCursoAsig() {
    return (
        <>
            <Head>
                <title>Documentos</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="flex flex-col items-center">
                <WarningAlert message={'Sin cursos asignados.'} />
            </div>
        </>
    )
}