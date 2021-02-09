import { Box, Button, Flex, SimpleGrid, Text } from "@chakra-ui/react"
import { useMemo } from "react"
import { useFirebase } from "../context/firebase"
import { GameState } from "../entities/Game"
import { useCustomTheme } from "../theme"

interface LeaderboardProps {
  gameId: string
  isHost?: boolean
}

const Leaderboard = ({ gameId, isHost }: LeaderboardProps): JSX.Element => {
  const { games, gamesRef } = useFirebase()
  const theme = useCustomTheme()

  const orderedPlayers = useMemo(() => {
    if (!games) return []
    return Object.values(games[gameId].players).sort(
      (pa, pb) => pa.points - pb.points
    )
  }, [gameId, games])

  const handleNext = () => {
    if (!games || !gamesRef) return
    const players = games[gameId].players
    const gameRef = gamesRef.child(`${gameId}`)
    for (const [playerId] of Object.entries(players)) {
      const playerRef = gameRef.child(`players/${playerId}`)
      playerRef.child("answer").remove()
      playerRef.child("correct").remove()
    }
    const promptIdx = games[gameId].promptIdx || 0
    gameRef.child("promptIdx").set(promptIdx + 1)
    gameRef.child("state").set(GameState.PLAYING)
  }

  return (
    <Flex flexDir="column" alignItems="center">
      <SimpleGrid columns={3} spacing={8} w="100%" mt={4}>
        {orderedPlayers.map((player, idx) => (
          <Box
            background={theme.colors.gray[700]}
            boxShadow="md"
            borderRadius={8}
            key={idx}
            p={4}
          >
            <Text textAlign="center">{player.screen_name}</Text>
            <Text
              textAlign="center"
              fontWeight="600"
              fontStyle="italic"
              color={
                player.correct ? theme.colors.green[500] : theme.colors.red[500]
              }
            >
              &quot;{player.answer}&quot;
            </Text>
            <Text fontWeight="600" textAlign="center" mt={2}>
              {player.points}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
      {isHost && (
        <Button onClick={handleNext} mt={8}>
          Next
        </Button>
      )}
    </Flex>
  )
}

export default Leaderboard
