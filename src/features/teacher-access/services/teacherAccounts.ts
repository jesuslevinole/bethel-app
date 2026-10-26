import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, initializeAuth, inMemoryPersistence, signOut } from 'firebase/auth';
import { firebaseConfig } from '../../../config/firebase';
import { teacherUsersService } from '../../../services/teacherUsersService';
import type { TeacherUser } from '../../../types/index';
import { UserFacingError } from '../../../utils/userFacingError';

export interface NewTeacherAccount {
  email: string;
  name: string;
  password: string;
  teacherId: string;
}

// La cuenta se crea en una instancia aparte de Firebase (en memoria) para que el administrador
// NO pierda su sesión: createUserWithEmailAndPassword inicia sesión con la cuenta nueva.
const createAuthAccount = async (email: string, password: string) => {
  const creatorApp = initializeApp(firebaseConfig, `account-creator-${Date.now()}`);
  try {
    const creatorAuth = initializeAuth(creatorApp, { persistence: inMemoryPersistence });
    const credential = await createUserWithEmailAndPassword(creatorAuth, email, password);
    await signOut(creatorAuth);
    return credential.user.uid;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    if (code === 'auth/email-already-in-use') {
      throw new UserFacingError('Ese correo ya tiene una cuenta. Usa otro correo para este maestro.');
    }
    if (code === 'auth/weak-password') throw new UserFacingError('La contraseña debe tener al menos 6 caracteres.');
    if (code === 'auth/invalid-email') throw new UserFacingError('Escribe un correo válido.');
    throw error;
  } finally {
    await deleteApp(creatorApp);
  }
};

export const createTeacherAccount = async ({ email, name, password, teacherId }: NewTeacherAccount) => {
  const cleanEmail = email.trim().toLowerCase();
  const uid = await createAuthAccount(cleanEmail, password);
  await teacherUsersService.set(uid, { email: cleanEmail, name, teacherId });
};

// Quita el acceso borrando el perfil: la cuenta de Auth queda, pero ya no puede entrar a nada.
export const removeTeacherAccess = async (teacherUser: TeacherUser) => {
  await teacherUsersService.delete(teacherUser.id);
};

// Contraseña temporal legible (sin caracteres que se confunden, como 0/O o 1/l).
const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateTemporaryPassword = (length = 10) => {
  const randomValues = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(randomValues, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join('');
};
