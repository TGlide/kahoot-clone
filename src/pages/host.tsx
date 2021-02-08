import { Box, Divider, Flex, SimpleGrid, Text } from "@chakra-ui/react"
import firebase from "firebase"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFirebase } from "../context/firebase"
import { Game, GameState } from "../entities/Game"
import { useCustomTheme } from "../theme"

const Host = (): JSX.Element | null => {
  const { games, app } = useFirebase()
  const theme = useCustomTheme()
  const [gameRef, setGameRef] = useState<
    firebase.database.Reference | undefined
  >()

  const gamePins = useMemo(() => {
    if (!games) return []
    return Object.keys(games)
  }, [games])

  const gamePlayers = useMemo(() => {
    if (!gameRef?.key || !games) return []
    return games?.[gameRef.key]?.players || []
  }, [gameRef, games])

  const generateGamePin = useCallback(() => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const pin = Math.random().toString().slice(2, 8)
      if (!gamePins.includes(pin)) return pin
    }
  }, [gamePins])

  useEffect(
    function createGame() {
      if (!app || gameRef) return
      const newGame: Game = {
        state: GameState.WAITING,
        players: {},
      }

      const db = app.database()
      const amOnline = db.ref(".info/connected")
      const newGameRef = app.database().ref(`games/${generateGamePin()}`)
      setGameRef(newGameRef)
      amOnline.on("value", (snapshot) => {
        if (snapshot.val()) {
          newGameRef.onDisconnect().remove()
          newGameRef.set(newGame)
        }
      })
    },
    [app, gameRef, generateGamePin]
  )

  useEffect(
    function setCleanup() {
      return function cleanup() {
        gameRef?.remove()
      }
    },
    [gameRef]
  )

  if (!gameRef) return null

  return (
    <Flex flexDir="column" alignItems="center">
      <Text textAlign="center">The game pin is:</Text>
      <Text textAlign="center" fontSize="lg" fontWeight="600">
        {gameRef.key}
      </Text>

      <Divider my={8} />

      <Text textAlign="center">Players:</Text>
      <SimpleGrid columns={3} spacing={8} w="100%" mt={4}>
        {Object.entries(gamePlayers).map(([playerId, player]) => (
          <Box
            background={theme.colors.gray[700]}
            boxShadow="md"
            borderRadius={8}
            key={playerId}
            p={4}
          >
            {player.screen_name}
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  )
}

export default Host
