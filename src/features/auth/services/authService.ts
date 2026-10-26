import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { resetLiveCollections } from '../../../shared/data/liveCollections';

export const signInUser = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email.trim(), password);
};

export const sendUserPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email.trim());
};

// Corta los listeners antes de salir para que no fallen por falta de permisos.
export const signOutUser = async () => {
  resetLiveCollections();
  await signOut(auth);
};
