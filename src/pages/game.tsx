import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import GamePrompt from "../components/GamePrompt"
import Leaderboard from "../components/Leaderboard"
import { useFirebase } from "../context/firebase"
import { Game, GameState, Player } from "../entities/Game"
import { useCustomTheme } from "../theme"
import { twoWayBind } from "../utils/twoWayBind"

interface LobbyProps {
  gameId: string
  playerId: string
}

const Lobby = ({ gameId, playerId }: LobbyProps) => {
  const { games, gamesRef } = useFirebase()
  const theme = useCustomTheme()
  const [playerName, setPlayerName] = useState<string>("")

  useEffect(
    function updatePlayer() {
      if (!gamesRef) return
      const playerNameRef = gamesRef?.child(
        `${gameId}/players/${playerId}/screen_name`
      )
      playerNameRef.set(playerName)
    },
    [gameId, gamesRef, playerId, playerName]
  )

  const otherPlayers = useMemo(() => {
    const game = games?.[gameId]
    if (!game?.players) return []
    return Object.entries(game.players).filter(([id]) => id !== playerId)
  }, [gameId, games, playerId])

  return (
    <Flex flexDir="column" alignItems="center">
      <FormControl>
        <FormLabel>Your name:</FormLabel>
        <Input {...twoWayBind(playerName, setPlayerName)} />
      </FormControl>
      <Text fontWeight="600" mt={8}>
        Other players:
      </Text>
      <SimpleGrid columns={3} spacing={8} w="100%" mt={4}>
        {otherPlayers.map(([playerId, player]) => (
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

const GameScreen: React.FC = () => {
  const router = useRouter()
  const { games, app, gamesRef } = useFirebase()
  const [game, setGame] = useState<Game | undefined>()
  const [playerId, setPlayerId] = useState<string | undefined>()
  const { pin: gamePin } = router.query

  useEffect(
    function getGame() {
      if (!games) return
      if (typeof gamePin !== "string") return

      setGame(games[gamePin])
    },
    [games, gamePin]
  )

  useEffect(
    function handleGameConnection() {
      if (!game || !gamesRef || !app || playerId) return
      const newPlayer: Player = {
        points: 0,
        screen_name: "",
      }
      const newPlayerId = uuidv4()
      setPlayerId(newPlayerId)

      const db = app.database()
      const amOnline = db.ref(".info/connected")
      const newPlayerRef = gamesRef.child(`${gamePin}/players/${newPlayerId}`)

      amOnline.on("value", (snapshot) => {
        if (snapshot.val()) {
          // newPlayerRef.onDisconnect().remove()
          newPlayerRef.set(newPlayer)
        }
      })
    },
    [game, app, gamePin, playerId, gamesRef]
  )

  // useEffect(
  //   function setCleanup() {
  //     return function cleanup() {
  //       gamesRef?.child(`games/${gamePin}/players/${playerId}`)?.remove()
  //     }
  //   },
  //   [gamePin, gamesRef, playerId]
  // )

  if (!gamePin || !playerId) return null

  return (
    <>
      {game?.state === GameState.WAITING && (
        <Lobby playerId={playerId} gameId={gamePin as string} />
      )}
      {game?.state === GameState.PLAYING && app && (
        <GamePrompt gameId={gamePin as string} playerId={playerId} />
      )}
      {game?.state === GameState.LEADERBOARD && app && (
        <Leaderboard gameId={gamePin as string} />
      )}
    </>
  )
}

export default GameScreen
