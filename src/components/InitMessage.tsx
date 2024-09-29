import { IconButton } from "@chakra-ui/react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { deleteChatRoom } from "../api";

export default function InitMessage() {
  const navigate = useNavigate();
  const mutation = useMutation(deleteChatRoom, {
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error) => {
      console.error("Failed delete:", error);
    },
  });

  const onSubmit = () => {
    mutation.mutate();
  };
  return (
    <IconButton
      onClick={onSubmit}
      fontSize="30px"
      bg="gray.100"
      borderRadius="full"
      aria-label="Delete messages"
      type="button"
      icon={<FaRegTrashAlt />}
    />
  );
}
