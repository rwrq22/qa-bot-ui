import { Box, HStack, Text, VStack } from "@chakra-ui/react";

interface IMessageProps {
  text: string;
}

export default function Message({ text }: IMessageProps) {
  return (
    <HStack
      justifyContent={"flex-end"}
      width={"100%"}
      padding="10px"
      paddingRight="15px"
    >
      <VStack>
        <Box marginTop="0" paddingLeft="100px">
          <Text
            bg="white"
            boxShadow="md"
            p="3"
            rounded="md"
            backgroundColor="#BEE3F8"
          >
            {text}
          </Text>
        </Box>
      </VStack>
    </HStack>
  );
}
