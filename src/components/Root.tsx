import {
  Box,
  HStack,
  IconButton,
  Input,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FaChevronLeft,
  FaExternalLinkAlt,
  FaRegPaperPlane,
} from "react-icons/fa";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";

import InitMessage from "./InitMessage";
import ChatQuestion from "./ChatQuestion";
import ChatResponse from "./ChatResponse";
import {
  createRoom,
  getChatRoom,
  getMessages,
  ISendMessageVariables,
  sendMessage,
} from "../api";

interface IMessage {
  pk: number;
  question: string;
  response?: string;
}

interface IChatRoom {
  pk: number;
  session_key: string;
}

export default function Root() {
  const { register, handleSubmit, reset, setFocus } =
    useForm<ISendMessageVariables>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [nextId, setNextId] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatRoom, setChatRoom] = useState<IChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* 채팅방이 있으면 대화 내역 요청하는 Query */
  const { data } = useQuery<IMessage[]>({
    queryKey: ["messages", chatRoom?.pk],
    queryFn: getMessages,
    enabled: !!chatRoom,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const mutation = useMutation(sendMessage, {
    onSuccess: (data) => {
      const response = data.response;
      try {
        setMessages((current) =>
          current.map((message) =>
            message.pk === nextId ? { ...message, response: response } : message
          )
        );
      } catch (error) {
        console.log(error);
      }
    },
  });

  const onSubmit = async (data: ISendMessageVariables) => {
    const newMessage: IMessage = {
      pk: nextId,
      question: data.question,
      response: undefined,
    };
    setMessages([...messages, newMessage]);
    setIsSubmitting(true);
    await mutation.mutateAsync(data);
    setNextId(nextId + 1);
    setIsSubmitting(false);
    reset();
  };

  const checkChatRoom = async () => {
    // 채팅방 존재 여부 확인
    try {
      const response = await getChatRoom();
      if (response) {
        setChatRoom(response);
      }
    } catch (error) {
      const newChatRoom = await createRoom();
      setChatRoom(newChatRoom);
    }
  };

  useEffect(() => {
    // 첫 마운트될 때 실행되는 함수
    checkChatRoom();
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setFocus("question");
    }
  }, [onSubmit]);

  return (
    <Box width="100%" display="flex" justifyContent={"center"}>
      <VStack width="100%" height="100vh" maxW="610px" spacing={0}>
        {/* Header */}
        <HStack
          width="100%"
          bgGradient="linear(gray.300, gray.100)"
          justifyContent={"space-between"}
          py={5}
          px={5}
          borderBottomWidth={1.5}
          borderBottomColor={"gray.300"}
        >
          <HStack>
            <IconButton
              marginRight="5"
              bg="gray.100"
              borderRadius={"100%"}
              aria-label="Go home"
              icon={<FaChevronLeft />}
              fontSize="30px"
            />
            <Image
              borderRadius="full"
              boxSize="75px"
              src="img/img-mascot.png"
            />
            <VStack>
              <Text fontSize="23px">중앙도서관</Text>
            </VStack>
          </HStack>
          <HStack>
            <IconButton
              marginRight="3"
              fontSize="30px"
              aria-label="Library link"
              icon={<FaExternalLinkAlt />}
            />
            <InitMessage />
          </HStack>
        </HStack>
        {/* Chat Background(Messages) */}
        <VStack
          paddingTop="13px"
          overflowY="auto"
          className="chat"
          width="100%"
          height="100%"
          bgGradient="linear(gray.50, whiteAlpha.50)"
          position="relative"
        >
          {chatRoom ? <ChatResponse text={"도서관 챗봇입니다."} /> : null}
          {data?.map(({ pk, question, response }) => (
            <Box key={pk} width="100%">
              <ChatQuestion text={question} />
              <ChatResponse text={response ? response : "..."} />
            </Box>
          ))}
          {messages.map(({ pk, question, response }) => (
            <Box key={pk} width="100%">
              <ChatQuestion text={question} />
              <ChatResponse text={response ? response : "..."} />
            </Box>
          ))}
          <Box ref={messagesEndRef}></Box>
        </VStack>
        {/* submit form */}
        <HStack
          bg="gray.300"
          height="11%"
          width="100%"
          padding="0px 10px"
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bottom="0px"
        >
          <Input
            width="90%"
            disabled={isSubmitting}
            autoFocus
            required
            type="text"
            autoComplete="off"
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
            disabled={isSubmitting}
            width="10%"
            height="50px"
            aria-label="Send a message"
            icon={<FaRegPaperPlane />}
          />
        </HStack>
      </VStack>
    </Box>
  );
}
