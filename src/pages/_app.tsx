import { ChakraProvider, Container, Flex, Link, Text } from "@chakra-ui/react";
import { AppProps } from "next/app";
import NextLink from "next/link";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { FirebaseProvider } from "../context/firebase";
import theme from "../theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <FirebaseProvider>
        <Container size="lg" height="100vh">
          <Flex
            justifyContent="space-between"
            align="center"
            width="100%"
            py={4}
          >
            <Link as={NextLink} href="/">
              <Text
                fontSize="xl"
                fontWeight="700"
                color={theme.colors.teal[400]}
                _hover={{ cursor: "pointer", textDecorationLine: "underline" }}
              >
                Kahoot Clone
              </Text>
            </Link>
            <Flex>
              <DarkModeSwitch />
            </Flex>
          </Flex>

          <Component {...pageProps} />
        </Container>
      </FirebaseProvider>
    </ChakraProvider>
  );
}

export default MyApp;
