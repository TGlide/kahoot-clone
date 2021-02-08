import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import firebase from "firebase"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFirebase } from "../context/firebase"
import { Game, Player } from "../entities/Game"
import { useCustomTheme } from "../theme"
import { twoWayBind } from "../utils/twoWayBind"

const prompts = [
  {
    emoji: "🚐👨🏻‍🦲🥽🧪💵",
    title: "Breaking Bad",
  },
]

interface HostViewProps {
  players: Game["players"]
  prompt: typeof prompts[0]
  gameId: string
}

const HostView = ({ players, prompt, gameId }: HostViewProps) => {
  const theme = useCustomTheme()
  const { games, gamesRef, app } = useFirebase()

  const answerColor = (correct?: boolean) => {
    if (correct === undefined) return theme.colors.gray[700]
    if (correct) return theme.colors.green[700]
    if (!correct) return theme.colors.red[700]
  }

  const handleAnswer = useCallback(
    (correct: boolean, playerId: string) => {
      if (!gamesRef) return

      const playerRef = gamesRef.child(`${gameId}/players/${playerId}`)
      playerRef.child("correct").set(correct)
      if (correct) {
        playerRef.child("points").set(players[playerId].points + 10)
      }
    },
    [gameId, gamesRef, players]
  )

  return (
    <>
      <Text fontWeight="600" alignItems="center" mt={2}>
        {prompt.title}
      </Text>

      <SimpleGrid columns={3} spacing={8} w="100%" mt={8}>
        {Object.entries(players || {}).map(([playerId, player]) => (
          <Box key={playerId}>
            <Text fontWeight="600" textAlign="center" py={2}>
              {player.screen_name}
            </Text>
            {player.answer && (
              <>
                <Box
                  background={answerColor(player.correct)}
                  boxShadow="md"
                  borderRadius={8}
                  px={4}
                  py={2}
                  mt={2}
                >
                  {player.answer}
                </Box>
                {player.correct === undefined && (
                  <ButtonGroup w={"100%"} mt={2}>
                    <Button
                      onClick={() => handleAnswer(false, playerId)}
                      isFullWidth
                      color={theme.colors.red[500]}
                    >
                      wrong
                    </Button>
                    <Button
                      onClick={() => handleAnswer(true, playerId)}
                      isFullWidth
                      color={theme.colors.green[500]}
                    >
                      right
                    </Button>
                  </ButtonGroup>
                )}
              </>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </>
  )
}

interface PlayerViewProps {
  playerId: string
  gameId: string
}

const PlayerView = ({ playerId, gameId }: PlayerViewProps) => {
  const [answer, setAnswer] = useState("")
  const [submittedAnswer, setSubmittedAnswer] = useState(undefined)
  const { games, gamesRef, app } = useFirebase()

  const playerRef = useMemo(() => {
    return gamesRef?.child(`${gameId}/players/${playerId}`)
  }, [gameId, gamesRef, playerId])

  const handleSubmit = () => {
    playerRef?.child("answer").set(answer)
  }

  useEffect(() => {
    playerRef?.child("answer").on("value", (snapshot) => {
      setSubmittedAnswer(snapshot.val())
    })
  }, [playerRef])

  return (
    <>
      {submittedAnswer ? (
        <>
          <Text textAlign="center" mt={4}>
            Submitted answer:
          </Text>
          <Text fontWeight="600" textAlign="center">
            {submittedAnswer}
          </Text>
        </>
      ) : (
        <>
          <FormControl mt={4}>
            <FormLabel fontWeight="600" textAlign="center">
              Answer:
            </FormLabel>
            <Input {...twoWayBind(answer, setAnswer)} />
          </FormControl>
          <Button onClick={handleSubmit} mt={4}>
            Submit
          </Button>
        </>
      )}
    </>
  )
}

type GamePromptProps = {
  isHost?: true
  gameId?: string
  playerId?: string
}

const GamePrompt = ({
  isHost,
  gameId,
  playerId,
}: GamePromptProps): JSX.Element => {
  const { games, gamesRef, app } = useFirebase()

  const prompt = useMemo(() => {
    if (!gameId) return
    const promptIdx = games?.[gameId].promptIdx
    if (promptIdx === undefined) return

    return prompts[promptIdx]
  }, [gameId, games])

  const players = useMemo(() => {
    if (!gameId || !games) return {}
    return games[gameId].players
  }, [gameId, games])

  return (
    <Flex flexDir="column" alignItems="center">
      <Text fontSize="3xl" alignItems="center">
        {prompt?.emoji}
      </Text>
      {isHost && gameId && prompt && (
        <HostView prompt={prompt} players={players} gameId={gameId} />
      )}
      {!isHost && gameId && playerId && (
        <PlayerView gameId={gameId} playerId={playerId} />
      )}
    </Flex>
  )
}

export default GamePrompt
