import Head from "next/head";
import WarningAlert from "../alerts/warningAlert";

export default function CantUploadDoc() {
    return (
        <>
            <Head>
                <title>Documentos</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="flex flex-col items-center">
                <WarningAlert message={'Sin permisos, contacte con el administrador.'} />
            </div>
        </>
    )
}