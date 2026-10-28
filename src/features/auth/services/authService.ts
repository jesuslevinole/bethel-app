import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { appUsersService } from '../../../services/appUsersService';
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

// Rol con el que entra quien crea su propia cuenta (id fijo de los roles predeterminados).
export const SELF_REGISTRATION_ROLE_ID = 'estudiante';

// "Crear mi cuenta" del estudiante nuevo: la cuenta de Auth y su usuario con rol Estudiante, sin alumno ligado.
// Las reglas solo dejan crear este perfil así (isSelfRegistration). Queda con la sesión abierta.
export const registerStudent = async (name: string, email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(credential.user, { displayName: name.trim() });
  await appUsersService.set(credential.user.uid, {
    active: true,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    roleId: SELF_REGISTRATION_ROLE_ID,
    selfRegistered: true,
    studentId: null,
    teacherId: null,
  });
};
