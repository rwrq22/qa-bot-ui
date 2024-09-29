import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";

interface IResponseProps {
  text: string;
}

export default function ChatResponse({ text }: IResponseProps) {
  return (
    <HStack align={"top"} width={"100%"} padding="10px" paddingLeft="10px">
      <Image
        marginTop="22px"
        borderRadius="full"
        boxSize="50px"
        src="/img/img-mascot.png"
      />
      <VStack align={"left"}>
        <Text paddingLeft={"5px"} fontSize="16px">
          중앙도서관
        </Text>
        <Box marginTop="0 !important" width="fit-content" paddingRight="100px">
          <Text bg="white" boxShadow="md" p="3" rounded="md">
            {text}
          </Text>
        </Box>
      </VStack>
    </HStack>
  );
}
