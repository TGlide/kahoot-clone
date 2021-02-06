import { Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/dist/client/router";

const Index = () => {
  const router = useRouter();

  return (
    <Flex flexDir="column" justify="center">
      <Button>Host game</Button>
      <Button onClick={() => router.push("join")} mt={4}>
        Join game
      </Button>
    </Flex>
  );
};

export default Index;
