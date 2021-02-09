import { Box, Button, Divider, Flex, SimpleGrid, Text } from "@chakra-ui/react"
import firebase from "firebase"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import GamePrompt from "../components/GamePrompt"
import Leaderboard from "../components/Leaderboard"
import { useFirebase } from "../context/firebase"
import { Game, GameState } from "../entities/Game"
import { useCustomTheme } from "../theme"

const Host = (): JSX.Element | null => {
  const { games, gamesRef, app } = useFirebase()
  const theme = useCustomTheme()
  const router = useRouter()
  const [gameId, setGameId] = useState<string | undefined>()
  const { gamePin } = router.query

  const gamePins = useMemo(() => {
    if (!games) return []
    return Object.keys(games)
  }, [games])

  const gamePlayers = useMemo(() => {
    if (!gameId || !games) return []
    return games?.[gameId]?.players || []
  }, [gameId, games])

  const generateGamePin = useCallback(() => {
    if (gamePin) return gamePin as string
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const pin = Math.random().toString().slice(2, 8)
      if (!gamePins.includes(pin)) return pin
    }
  }, [gamePin, gamePins])

  useEffect(
    function createGame() {
      if (!app || gameId) return
      const newGame: Game = {
        state: GameState.WAITING,
        players: {},
      }

      const db = app.database()
      const amOnline = db.ref(".info/connected")
      const newGamePin = generateGamePin()
      const newGameRef = app.database().ref(`games/${newGamePin}`)
      setGameId(newGamePin)
      amOnline.on("value", (snapshot) => {
        if (snapshot.val()) {
          // newGameRef.onDisconnect().remove()
          newGameRef.set(newGame)
        }
      })
    },
    [app, gameId, generateGamePin]
  )

  // useEffect(
  //   function setCleanup() {
  //     return function cleanup() {
  //       if (!gameId) return
  //       gamesRef?.child(gameId)?.remove()
  //     }
  //   },
  //   [gameId, gamesRef]
  // )

  const handleReady = useCallback(() => {
    if (!gameId || !gamesRef) return
    const gameRef = gamesRef.child(gameId)
    gameRef.child("state").set(GameState.PLAYING)
    gameRef.child("promptIdx").set(0)
  }, [gameId, gamesRef])

  if (!gamesRef || !gameId || !games) return null

  if (games[gameId].state === GameState.WAITING) {
    return (
      <Flex flexDir="column" alignItems="center">
        <Text textAlign="center">The game pin is:</Text>
        <Text textAlign="center" fontSize="lg" fontWeight="600">
          {gameId}
        </Text>

        <Text textAlign="center" mt={8}>
          Players:
        </Text>
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

        <Button onClick={handleReady} colorScheme="teal" mt={8}>
          Ready
        </Button>
      </Flex>
    )
  }

  if (games[gameId].state === GameState.PLAYING)
    return <GamePrompt gameId={gameId} isHost />

  return <Leaderboard gameId={gameId} isHost />
}

export default Host
