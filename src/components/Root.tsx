import {
  Box,
  HStack,
  IconButton,
  Input,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaChevronLeft, FaExternalLinkAlt } from "react-icons/fa";
import InitMessage from "../components/InitMessage";

import { FaRegPaperPlane } from "react-icons/fa";
import { useForm } from "react-hook-form";
import {
  createRoom,
  getChatRoom,
  getMessages,
  ISendMessageVariables,
  sendMessage,
} from "../api";
import { useMutation, useQuery } from "@tanstack/react-query";
import Message from "../components/Message";
import { useState, useRef, useEffect } from "react";
import ChatResponse from "./ChatResponse";
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
  const [scroll, setScroll] = useState(false);
  const [chatRoom, setChatRoom] = useState<IChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  /* 채팅방이 있으면 메세지들을 요청하는 Query */
  const { isLoading, data } = useQuery<IMessage[]>({
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

  useEffect(() => {
    // 첫 마운트될 때 실행되는 함수
    const checkChatRoom = async () => {
      // 채팅방 존재 여부 확인
      try {
        const response = await getChatRoom();
        if (response) {
          setChatRoom(response);
        }
      } catch (error) {
        /* console.log("채팅방 새로 생성 시도", error); */
        const newChatRoom = await createRoom();
        setChatRoom(newChatRoom);
      }
    };
    checkChatRoom();
  }, []);

  useEffect(() => {
    if (!isLoading && messagesEndRef.current) {
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
    <Box
      width="100%"
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <Box
        height="100vh"
        width="100%"
        maxW="610px"
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
      >
        {/* Header */}
        <Box width="100%" bgGradient="linear(gray.300, gray.100)">
          <HStack
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
        </Box>
        {/* Chatting & Propmt section */}
        <VStack
          paddingTop="13px"
          overflow="auto"
          className="chat"
          width="100%"
          height="78%"
          bgGradient="linear(gray.50, whiteAlpha.50)"
          position="relative"
        >
          <ChatResponse text={"도서관 챗봇입니다."} />
          {data?.map(({ pk, question, response }) => (
            <Box key={pk} width="100%">
              <Message text={question} />
              <ChatResponse text={response ? response : "..."} />
            </Box>
          ))}
          {messages.map(({ pk, question, response }) => (
            <Box key={pk} width="100%">
              <Message text={question} />
              <ChatResponse text={response ? response : "..."} />
            </Box>
          ))}
          <HStack
            bg="gray.300"
            height="10%"
            width="100%"
            maxW="625px"
            padding="0px 10px"
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            position="fixed"
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
          <Box ref={messagesEndRef}></Box>
        </VStack>
      </Box>
    </Box>
  );
}
