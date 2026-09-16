import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseServices, isFirebaseConfigured } from "./firebaseConfig";

export function getCurrentAdmin(onChange: (user: User | null) => void) {
  if (!isFirebaseConfigured()) {
    onChange(null);
    return () => {};
  }

  let unsubscribe = () => {};
  getFirebaseServices().then(({ auth }) => {
    unsubscribe = onAuthStateChanged(auth, onChange);
  });

  return () => unsubscribe();
}

export async function signInAdmin(email: string, password: string) {
  const { auth } = await getFirebaseServices();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  const { auth } = await getFirebaseServices();
  return signOut(auth);
}
