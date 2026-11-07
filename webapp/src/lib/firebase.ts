import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, initializeFirestore, persistentLocalCache } from 'firebase/firestore'

const env = import.meta.env
const useEmulator = env.VITE_USE_EMULATOR === 'true'

export const firebaseConfigured = useEmulator || Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID)

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'demo-saathi',
  appId: env.VITE_FIREBASE_APP_ID,
})

export const auth = getAuth(app)
// Offline cache lets families fill diaries with patchy connectivity; writes sync when back online.
export const db = initializeFirestore(app, useEmulator ? {} : { localCache: persistentLocalCache() })

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
