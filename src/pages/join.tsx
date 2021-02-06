import {
  Button,
  Flex,
  HStack,
  PinInput,
  PinInputField,
  Text,
} from "@chakra-ui/react"
import { FormEvent, useState } from "react"
import { useFirebase } from "../context/firebase"
import { useCustomTheme } from "../theme"
import { twoWayBind } from "../utils/twoWayBind"
import { useRouter } from "next/router"

const Join = () => {
  const theme = useCustomTheme()
  const { games } = useFirebase()
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState<null | string>(null)

  const handleJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!games) return setError("Couldn't fetch games.")
    if (!Object.keys(games).includes(pin)) return setError("Invalid pin")
    router.push(`game?pin=${pin}`)
  }

  return (
    <Flex flexDir="column" align="center">
      <form onSubmit={handleJoin}>
        <Flex flexDir="column" align="center">
          <Text textAlign="center">Enter the game pin:</Text>
          <HStack justify="center" mt={4}>
            <PinInput {...twoWayBind(pin, setPin)}>
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          <Button type="submit" disabled={pin.length < 6} w="75%" mt={6}>
            Join
          </Button>
        </Flex>
      </form>
      {error && (
        <Text color={theme.colors.red[400]} textAlign="center" mt={4}>
          {error}
        </Text>
      )}
    </Flex>
  )
}

export default Join
