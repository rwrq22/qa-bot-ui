import { Button, Heading, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <VStack bg="gray.100" justifyContent={"center"} minH="100vh">
      <Heading>Page not found.</Heading>
      <Link to="/">
        <Button variant={"link"}>Go home &rarr;</Button>
      </Link>
    </VStack>
  );
}
