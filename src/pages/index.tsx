import { Container, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { useCustomTheme } from "../theme";

const Index = () => {
  const theme = useCustomTheme();
  return (
    <Container size="lg" height="100vh">
      <Flex justifyContent="space-between" align="center" width="100%" py={4}>
        <Text fontSize="xl" fontWeight="700" color={theme.colors.teal[400]}>
          Next Chakra Template
        </Text>
        <Flex>
          <DarkModeSwitch />
        </Flex>
      </Flex>
    </Container>
  );
};

export default Index;
