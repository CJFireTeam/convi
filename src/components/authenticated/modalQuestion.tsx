import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { api_getQuestions } from "../../services/axios.services";
import { Button, Modal } from "react-daisyui";
import { useRouter } from "next/router";
function ModalQuestions() {
  const ref = useRef<HTMLDialogElement>(null);
  const handleCloseModal = useCallback(() => {
    ref.current?.close();
  }, [ref]);

  const { push } = useRouter();
  const redirect = () => {
    handleCloseModal();
    push("encuestas");
  };
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <Modal ref={ref}>
      <Modal.Header className="font-bold">Hola!</Modal.Header>
      <Modal.Body>
        <span className="font-medium">Tienes cuestionarios sin responder en tu bandeja</span>
      </Modal.Body>
      <Modal.Actions className="justify-normal w-full flex flex-col gap-4">
        <Button onClick={redirect} color="primary">Responder</Button>
        <Button onClick={handleCloseModal} color="ghost">Cerrar</Button>
      </Modal.Actions>
    </Modal>
  )
};

export default function ModalQuestion() {
  const { bearer, setRole, GetRole, user, isLoading, updateUser } = useUserStore();
  const [countQuestions, setCountQuestions] = useState(0);
  const getQuestionary = async () => {
    const questions = await api_getQuestions(user.username);

    setCountQuestions(questions.data.meta.pagination.total);
  }
  useEffect(() => {
    getQuestionary();
  }, [])
  if (countQuestions !== 0) return (<><ModalQuestions />  </>)
  return null;
}

function push(arg0: string) {
  throw new Error("Function not implemented.");
}
