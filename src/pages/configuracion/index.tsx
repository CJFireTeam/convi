import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, Pagination, Table } from "react-daisyui";
import { useUserStore } from "../../store/userStore";
import { api_getPositions, api_postPositions, api_putPositions } from "../../services/axios.services";
import metaI from "../../interfaces/meta.interface";
import { PlusIcon,LockClosedIcon,LockOpenIcon } from '@heroicons/react/20/solid';
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

function Cargos() {
    interface TableCargosI {
            id: number;
            attributes: CargosI
    }
    interface CargosI {
        name: string;
        establishment:number;
        status: boolean
    };
    const Schema = z.object({
        name: z.string({ required_error: "Campo Requerido", invalid_type_error: "Campo Requerido" }),
        establishment: z.number(),
        status: z.boolean().default(true)
    });
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CargosI>({
        resolver: zodResolver(Schema),
    });
    const {bearer,setRole,GetRole,user,GetStablishment} = useUserStore()
    const [metaData, setMetaData] = useState<metaI>({page:1,pageCount:0,pageSize:0,total:0});
    const [data,setData] = useState<TableCargosI[]>([])
    const [isLoading,setIsLoading] = useState<boolean>(false);
    const ref = useRef<HTMLDialogElement>(null);
    const handleShow = useCallback(() => {
    ref.current?.showModal();
    }, [ref]);
    const hadleClose = useCallback(() => {
        ref.current?.close();
    },[ref]);
      const getPositions = async (stablishment:number) => {
        try {
            const dataPos = await api_getPositions({Stablishment:stablishment,page:metaData.page});
            setData(dataPos.data.data);
            setMetaData(dataPos.data.meta.pagination);

        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (GetStablishment().id === 0) return;
        getPositions(GetStablishment().id)
        setValue("establishment",GetStablishment().id)
    },[GetStablishment().id])
    
    const updatePage = (number:number) => {
        if (number < 1) return;
        if (number > metaData.pageCount) return;
        metaData.page = number;
        metaData.pageCount = metaData.pageCount
        metaData.pageSize = metaData.pageSize
        metaData.total = metaData.total
        setMetaData(metaData);
        getPositions(GetStablishment().id)
      }
    const changeStatus = async (id:number,status:boolean) => {
        try {
            await api_putPositions(id,{status:status});
            getPositions(GetStablishment().id);
            setIsLoading(false);
            // hadleClose()
            toast.success('Se actualizo correctamente');
        } catch (error) {
            console.log(error);
            toast.error('ha ocurrido un error')
        }
    };
    const Submit = async (dataZod: CargosI) => {
        setIsLoading(true)
        try {
            await api_postPositions(dataZod);
            getPositions(GetStablishment().id);
            setIsLoading(false);
            hadleClose()
            reset();
            setValue("establishment",GetStablishment().id)
            toast.success('Se Agrego la categoria correctamente');
        } catch (error) {
            console.log(error);
            setIsLoading(false)
            toast.error('ha ocurrido un error')
        }
    };
    const onSubmit: SubmitHandler<CargosI> = (data) => Submit(data)

    return (
        <div className="overflow-x-auto border rounded flex flex-col justify-center items-center">
        <div className="flex flex-row bg-gray-100 w-full justify-around items-center">
            <span className="font-semibold ">Cargos</span>
            <button onClick={handleShow} className="m-2 ">
                <PlusIcon className="h-6 w-6 text-primary"/>
            </button>
            </div>
        <Table size="md" className="border rounded">
          <Table.Head>
            <span>Nombre</span>
            <span></span>
          </Table.Head>
  
          <Table.Body>
          {data.map((element, index) => (
            <Table.Row key={index}>
              <span>{index + 1} - {element.attributes.name}</span>
              <span>
                {element.attributes.status ? <button onClick={() =>changeStatus(element.id,!element.attributes.status)}><LockOpenIcon className="h-6 w-6 text-primary"></LockOpenIcon></button> : <button onClick={() =>changeStatus(element.id,!element.attributes.status)}><LockClosedIcon className="h-6 w-6 text-error"></LockClosedIcon></button>}
              </span>
            </Table.Row>

          ))}
          </Table.Body>
        </Table>
          <Pagination className="mt-2">
      <Button onClick={() => updatePage(metaData.page -1 )} className="join-item">«</Button>
      <Button className="join-item">Pagina {metaData.page}</Button>
      <Button onClick={() => updatePage(metaData.page +1 )} className="join-item">»</Button>
    </Pagination>
    <Modal  ref={ref}>
        <Modal.Header className="font-bold">Creacion de cargo
        <Button  onClick={hadleClose} size="sm" color="ghost" shape="circle" className="absolute right-2 top-2">
            x
          </Button>
          </Modal.Header>
        <Modal.Body>
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                <div className="mt-2 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3  sm:text-sm">
                    Nombre
                    </span>
                    <input
                    type="text"
                    {...register("name")}
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-primary placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    />
                </div>
                <Button color="primary" animation className="m-2" disabled={isLoading} type="submit" loading={isLoading} >Guardar</Button>
            </form>
        </Modal.Body>
      </Modal>
      </div>
    )
}

export default function Configuracion() {
    return (
        <>
            <Cargos/>
        </>
    );

}
