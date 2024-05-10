import { useCallback, useEffect, useRef } from "react";
import { Button, Form, Modal, Radio } from "react-daisyui";
import { useUserStore } from "../../store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { api_updateUser } from "../../services/axios.services";

interface Inputs {
    tipo: "alumno" | "apoderado"
}
const Schema = z.object({
    tipo: z.string({required_error:"Es necesario seleccionar una opcion"})
});

export default function ModalWhoIS() {
    const { bearer, setRole, GetRole, user, isLoading,updateUser } = useUserStore();
    const {register, handleSubmit,watch,setValue, formState: {errors} } = useForm<Inputs>({
        resolver: zodResolver(Schema),
      });

    const SubmitTipo = async (data: Inputs) => {
        try {
            await api_updateUser(user.id,data)
            updateUser({tipo:data.tipo});
        } catch (error) {
            console.log(error)
        }
    }

    const ref = useRef<HTMLDialogElement>(null);
    useEffect(()=> {
        ref.current?.showModal();
    },[])
  const handleShow = useCallback(() => {
  }, [ref]);
  const onSubmit = handleSubmit((data:Inputs) => SubmitTipo(data))
  if (!user.tipo) return <div className="font-sans">
      {/* <Button onClick={handleShow}>Open Modal</Button> */}
      <Modal ref={ref}>
        <Modal.Header className="font-bold">Hola {user.firstname}!</Modal.Header>
        <Modal.Body>
          Ayudanos a conocerte
        </Modal.Body>
        <Modal.Actions className="justify-normal w-full">
        <form className="space-y-6 w-full" method="POST"  onSubmit={onSubmit}>
        <div>
        <Form.Label title="Soy un Alumno">
          <Radio  name="tipo" onClick={() => setValue("tipo","alumno")} className="checked:bg-primary mx-2" />
        </Form.Label>
        <Form.Label title="Soy un Apoderado">
          <Radio  name="tipo" onClick={() => setValue("tipo","apoderado")} className="checked:bg-primary mx-2 focus:bg-primary" />
        </Form.Label>
        <span className="text-error">{errors.tipo?.message}</span>
        </div>
        <div className="text-center">
            <Button color="primary">Guardar</Button>

        </div>
          </form>
        </Modal.Actions>
      </Modal>
    </div>
}