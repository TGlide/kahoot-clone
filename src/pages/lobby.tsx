import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useFirebase } from "../context/firebase";
import firebase from "firebase";
import { Game, Player } from "../entities/Game";
import { useCustomTheme } from "../theme";
import { v4 as uuidv4 } from "uuid";
import * as faker from "faker";
import { twoWayBind } from "../utils/twoWayBind";

const Lobby: React.FC = () => {
  const theme = useCustomTheme();
  const router = useRouter();
  const { games, app } = useFirebase();

  const [game, setGame] = useState<Game | undefined>();
  const [playerRef, setPlayerRef] = useState<
    firebase.database.Reference | undefined
  >();
  const [playerName, setPlayerName] = useState<string>("");
  const { game: gamePin } = router.query;

  useEffect(
    function getGame() {
      if (!games) return;
      if (typeof gamePin !== "string") return;

      setGame(games[gamePin]);
    },
    [games, gamePin]
  );

  useEffect(
    function handleGameConnection() {
      if (!game || !app || playerRef) return;
      const newPlayer: Player = {
        points: 0,
        screen_name: faker.name.findName(),
      };
      setPlayerName(newPlayer.screen_name);
      const newPlayerId = uuidv4();

      const db = app.database();
      const amOnline = db.ref(".info/connected");
      const newPlayerRef = app
        .database()
        .ref(`games/${gamePin}/players/${newPlayerId}`);
      setPlayerRef(newPlayerRef);

      amOnline.on("value", (snapshot) => {
        if (snapshot.val()) {
          newPlayerRef.onDisconnect().remove();
          newPlayerRef.set(newPlayer);
        }
      });
    },
    [game, app, playerRef]
  );

  useEffect(
    function setCleanup() {
      return function cleanup() {
        playerRef?.remove();
      };
    },
    [playerRef]
  );

  useEffect(
    function updatePlayer() {
      if (!playerRef) return;
      playerRef.set({
        points: 0,
        screen_name: playerName,
      });
    },
    [playerName]
  );

  const otherPlayers = useMemo(() => {
    if (!game?.players) return [];
    return Object.entries(game.players).filter(([id]) => id !== playerRef?.key);
  }, [game, playerRef]);

  if (!gamePin || !playerRef) return null;

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
  );
};

export default Lobby;
