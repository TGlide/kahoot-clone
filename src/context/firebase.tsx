import { createContext, useContext, useEffect, useState } from "react"
import firebase from "firebase"
import { Game } from "../entities/Game"

interface FirebaseProps {
  gamesRef?: firebase.database.Reference
  games?: {
    [key: string]: Game
  }
  app?: firebase.app.App
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MSRMT_ID,
}

const FirebaseContext = createContext<FirebaseProps>({})

export const FirebaseProvider: React.FC = ({ children }) => {
  const [games, setGames] = useState<FirebaseProps["games"]>({})
  const [gamesRef, setGamesRef] = useState<
    firebase.database.Reference | undefined
  >()

  const [fb, setFb] = useState<firebase.app.App | undefined>(undefined)

  useEffect(
    function initializeFirebase() {
      if (!fb) {
        setFb(firebase.apps?.[0] || firebase.initializeApp(firebaseConfig))
      }
    },
    [fb]
  )

  useEffect(
    function setupValues() {
      if (!fb) return
      const db = firebase.database()
      const newGamesRef = db.ref("games")
      setGamesRef(newGamesRef)

      newGamesRef.on("value", (snapshot) => {
        const data = snapshot.val()
        setGames(data)
      })
    },
    [fb]
  )

  return (
    <FirebaseContext.Provider value={{ games, app: fb, gamesRef }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext)

  if (context === undefined) {
    throw new Error("useAlert must be used within the AlertsProvider component")
  }

  return context
}
