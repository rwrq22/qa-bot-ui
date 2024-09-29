import { Box, HStack, IconButton, Text, VStack, Input } from "@chakra-ui/react";
import { FaRegPaperPlane } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { ISendMessageVariables, sendMessage } from "../api";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useState, useEffect, useRef } from "react";

interface IMessage {
  pk: number;
  question: string;
  response: string;
}

export default function InputMessage() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<ISendMessageVariables>();
  const mutation = useMutation(sendMessage, {
    onSuccess: () => {
      /* navigate(`/`); */
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  let scrollRef = useRef<HTMLDivElement>(null);

  /**** http version ****/
  const fetchMessages = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/messages");
    const json = await response.json();
    setMessages(json);
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    fetchMessages();
    scrollToBottom();
    if (inputElement) {
      (inputElement as HTMLElement).focus();
    }
  }, [message]);

  const inputElement = document.querySelector("input");

  const onSubmit = async (data: ISendMessageVariables) => {
    await mutation.mutateAsync(data);
    setMessage(data.question);
    setIsLoading(false);

    if (inputElement) {
      (inputElement as HTMLElement).focus();
    }
  };

  return (
    <Box width="100%">
      {/* {messages.length > 0 && (
        <Message text={messages[messages.length - 1].text} />
      )} */}
      <HStack
        bg="gray.300"
        height="10%"
        width="610px"
        maxW="625px"
        padding="0px 10px"
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        position="fixed"
        bottom="0px"
      >
        <Input
          width="90%"
          autoFocus
          required
          type="text"
          boxShadow="md"
          p="6"
          rounded="md"
          bg="white"
          placeholder="Send a message."
          size="lg"
          variant={"outline"}
          {...register("question")}
        />
        {mutation.isError ? <Text>Something went wrong.</Text> : null}
        <IconButton
          isLoading={mutation.isLoading}
          type="submit"
          width="10%"
          height="50px"
          aria-label="Send a message"
          icon={<FaRegPaperPlane />}
        />
      </HStack>
    </Box>
  );
}
